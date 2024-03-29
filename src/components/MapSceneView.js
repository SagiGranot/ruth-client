import React from 'react';
import ReactDOM from 'react-dom';
import { loadModules } from 'esri-loader';
import { LineOfSight } from './LineOfSight';
import { Viewshed } from './Viewshed';
import { DayLight } from './DayLight';
import { DeltaLogs } from './DeltaLogs';
import { Weather } from './Weather';
import { deployLayerOpt } from '../layers/deployLayer';
import { objectLayerOpt } from '../layers/objectLayer';
import { ObjectEditor } from './ObjectEditor';
import { getDeployments } from '../api/getDeployments';
import { getDeltas } from '../api/getDeltas';
import { getWeather } from '../api/getWeather';
import { getGeoObjects } from '../api/getGeoObjects';
import { deployMarkers } from '../markers/deploy';
import GeoObject from '../schema/GeoObject';
import { Camera } from './Camera';
var geolocate = require('mock-geolocation');

// import { mockGeolocation } from '../utils/mockLocation';
export class MapSceneView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.esriModules = {};
    this.socketio = this.props.socketio;
    this.userId = this.props.userId;

    this.setUserMarkerPosition = this.setUserMarkerPosition.bind(this);
    this.addLayer = this.addLayer.bind(this);
    this.createLayer = this.createLayer.bind(this);
    this.renderEsriComponent = this.renderEsriComponent.bind(this);
    this.createDeployGraphics = this.createDeployGraphics.bind(this);
    this.createObjectGraphics = this.createObjectGraphics.bind(this);
    this.xyToLngLat = this.xyToLngLat.bind(this);
  }

  async componentDidMount() {
    loadModules(
      [
        'esri/Map',
        'esri/views/SceneView',
        'esri/layers/FeatureLayer',
        'esri/Graphic',
        'esri/widgets/Track',
        'esri/geometry/support/webMercatorUtils',
      ],
      {
        css: 'https://js.arcgis.com/4.15/esri/themes/dark/main.css',
      }
    )
      .then(async ([Map, SceneView, FeatureLayer, Graphic, Track, Utils]) => {
        this.esriModules = { Map, SceneView, FeatureLayer, Graphic, Utils };
        const map = new Map({
          basemap: 'topo-vector',
          ground: 'world-elevation',
        });

        geolocate.use();

        this.view = new SceneView({
          container: this.mapRef.current,
          map: map,
          camera: { position: [35.5954, 30.993, 3000], tilt: 46, fov: 100 },
          environment: {
            atmosphere: { quality: 'low' },
            lighting: { date: new Date(), directShadowsEnabled: false },
          },
        });

        var track = new Track({
          view: this.view,
          scale: 10000,
          graphic: new Graphic(deployMarkers.User),
          useHeadingEnabled: false, // Don't change orientation of the map
        });

        const [deployments, objects, deltas, weather] = await Promise.all([
          getDeployments(),
          getGeoObjects(),
          getDeltas(this.userId),
          getWeather(),
        ]);

        this.setUserMarkerPosition(deployments, this.userId);
        const deployGraphics = this.createDeployGraphics(deployments);
        const objectGraphics = this.createObjectGraphics(objects);
        const deployLayer = this.createLayer(deployLayerOpt, deployGraphics);
        const objectLayer = this.createLayer(objectLayerOpt, objectGraphics);

        this.view.when(() => {
          var prevLocation = this.view.center;

          function updateCameraPosition(view, location) {
            try {
              view.goTo({
                center: location,
                tilt: 65,
                zoom: 15,
                heading: 360 - getHeading(location, prevLocation), // only applies to SceneView);
              });
            } catch (error) {
              if (error.name != 'AbortError') {
                console.error(error);
              }
            }
          }

          var element = document.createElement('div');
          element.className = 'esri-icon-locate esri-widget--button esri-widget';
          element.addEventListener('click', (evt) => {
            var location = track.graphic.geometry;
            updateCameraPosition(this.view, location);
          });
          this.view.ui.add(element, 'top-left');

          track.on('track', function () {
            var location = track.graphic.geometry;
            updateCameraPosition(this.view, location);
            prevLocation = location.clone();
          });

          track.start();

          function getHeading(point, oldPoint) {
            // get angle between two points
            var angleInDegrees = (Math.atan2(point.y - oldPoint.y, point.x - oldPoint.x) * 180) / Math.PI;

            // move heading north
            return -90 + angleInDegrees;
          }
          this.addLayer([deployLayer, objectLayer]);

          const viewShedProps = {
            Utils,
            deployments,
            socketio: this.socketio,
            track,
            userId: this.userId,
          };

          this.view.ui.add(track, 'top-left');
          this.renderEsriComponent(Viewshed, viewShedProps, 'bottom-right');
          this.renderEsriComponent(ObjectEditor, { socketio: this.socketio });
          this.renderEsriComponent(DayLight);
          this.renderEsriComponent(Weather, { weather });
          this.renderEsriComponent(Camera, {}, 'top-left');
          this.renderEsriComponent(DeltaLogs, {
            socketio: this.socketio,
            deltas,
            userId: this.userId,
          });
        });
      })
      .catch((e) => console.log(e));
  }

  componentWillUnmount() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
  }

  createDeployGraphics(items) {
    return items.map((item) => {
      return new this.esriModules.Graphic({
        geometry: {
          type: 'point',
          latitude: item.location.coordinates[1],
          longitude: item.location.coordinates[0],
        },
        attributes: { ...item },
      });
    });
  }

  createObjectGraphics(items) {
    return items.map((item) => {
      return new this.esriModules.Graphic({
        geometry: {
          type: 'polygon',
          rings: [item.location.coordinates[0]],
        },
        attributes: {
          ...item,
        },
      });
    });
  }

  setUserMarkerPosition(deployments, id) {
    deployments.forEach((deploy) => {
      if (deploy.deployId === `${id}`) deploy.tag = 'User';
    });
  }

  createLayer(layerOptions, graphics) {
    layerOptions.source = graphics;
    return new this.esriModules.FeatureLayer(layerOptions);
  }

  addLayer(layers = []) {
    layers.forEach((layer) => {
      this.view.map.add(layer);
      layer.on('apply-edits', (e) => {
        //when adding new object save it to db
        if (!e.edits.addFeatures) {
          return;
        }

        const { attributes, geometry } = e.edits.addFeatures[0];
        if (attributes.tag === 'Building') {
          const rings = geometry.rings[0].map((ring) => this.xyToLngLat(ring[0], ring[1]));
          const geoObject = new GeoObject(attributes, rings);
          geoObject.save();
        }
      });
    });
  }

  getLayer(layerTitle = '') {
    return this.props.view.map.allLayers.find((layer) => {
      return layer.title === layerTitle;
    });
  }

  xyToLngLat(x, y) {
    return this.esriModules.Utils.xyToLngLat(x, y);
  }

  renderEsriComponent(component, props = {}, position = null) {
    const Components = component;
    const elm = document.createElement('div');
    this.view.ui.add(elm, position);
    ReactDOM.render(<Components view={this.view} {...props} />, elm);
  }

  render() {
    return <div className="webmap" ref={this.mapRef} />;
  }
}
