import React from 'react';
import ReactDOM from 'react-dom';
import { loadModules } from 'esri-loader';
import { LineOfSight } from './LineOfSight';
import { Viewshed } from './Viewshed';
import { deployLayerOpt } from '../layers/deployLayer';
import { objectLayerOpt } from '../layers/objectLayer';
import { ObjectEditor } from './ObjectEditor';
import { getDeployments } from '../api/getDeployments';
import { getGeoObjects } from '../api/getGeoObjects';
export class MapSceneView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.esriModules = {};

    this.setUserMarkerPosition = this.setUserMarkerPosition.bind(this);
    this.addLayer = this.addLayer.bind(this);
    this.createLayer = this.createLayer.bind(this);
    this.renderEsriComponent = this.renderEsriComponent.bind(this);
  }

  async componentDidMount() {
    loadModules(['esri/Map', 'esri/views/SceneView', 'esri/layers/FeatureLayer', 'esri/Graphic'], { css: true })
      .then(async ([Map, SceneView, FeatureLayer, Graphic]) => {
        this.esriModules = { Map, SceneView, FeatureLayer, Graphic };
        const map = new Map({ basemap: 'topo-vector', ground: 'world-elevation' });
        this.view = new SceneView({
          container: this.mapRef.current,
          map: map,
          camera: {
            position: [35.587, 30.929, 2184],
            tilt: 80,
          },
        });

        const [deployments, objects] = await Promise.all([getDeployments(), getGeoObjects()]);
        objects[0].objectType = 'Building';
        objects[1].objectType = 'Building';

        this.setUserMarkerPosition(deployments, 3);
        const deployGraphics = createDeployGraphics(deployments);
        const objectGraphics = createObjectGraphics(objects);

        const deployLayer = this.createLayer(deployLayerOpt, deployGraphics);
        const objectLayer = this.createLayer(objectLayerOpt, objectGraphics);
        this.addLayer([deployLayer, objectLayer]);
        this.renderEsriComponent(LineOfSight, { deployments }, 'bottom-right');
        this.renderEsriComponent(ObjectEditor, {}, 'top-right');

        function createDeployGraphics(items) {
          return items.map((item) => {
            return new Graphic({
              geometry: {
                type: 'point',
                latitude: item.location.coordinates[1],
                longitude: item.location.coordinates[0],
              },
              attributes: { ...item },
            });
          });
        }

        function createObjectGraphics(items) {
          return items.map((item) => {
            return new Graphic({
              geometry: {
                type: 'polygon',
                rings: [item.location.coordinates],
              },
              attributes: {
                ...item,
              },
            });
          });
        }
      })
      .catch((e) => console.log(e));
  }

  componentWillUnmount() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
  }

  setUserMarkerPosition(deployments, id) {
    deployments.forEach((deploy) => {
      if (deploy.deployId == id) deploy.deployType = 'User';
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
        console.log(e);
      });
    });
  }

  renderEsriComponent(component, props, position) {
    const Components = component;
    const elm = document.createElement('div');
    this.view.ui.add(elm, position);
    ReactDOM.render(<Components view={this.view} {...props} />, elm);
  }

  render() {
    return <div className="webmap" ref={this.mapRef} />;
  }
}
