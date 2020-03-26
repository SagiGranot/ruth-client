import React from 'react';
import ReactDOM from 'react-dom';
import { loadModules } from 'esri-loader';
import { LineOfSight } from './LineOfSight';
import { Viewshed } from './Viewshed';
import { MapOverview } from './MapOverview';
import { Camera } from './Camera';
import {deployLayerOpt} from '../configs/deployLayer';

export class MapSceneView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    loadModules(
      [
        'esri/Map',
        'esri/views/SceneView',
        'esri/layers/FeatureLayer',
        'esri/Graphic'
      ],
      { css: true }
    ).then(([Map, SceneView, FeatureLayer, Graphic]) => {
      const map = new Map({
        basemap: 'topo-vector',
        ground: 'world-elevation'
      });

      this.view = new SceneView({
        container: this.mapRef.current,
        map: map,
        camera: {
          position: [7.654, 45.919, 5184], // change map location [lon , lat, height]
          tilt: 80
        }
      });

      var deployments;

      fetch('http://localhost:8080/deploy', {
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          var arrMarkers = [];
          deployments = data;
          data.forEach(deploy => {
            if(deploy.deployId === '3')
              deploy.deployType = 'me';
            arrMarkers.push(drawMarker(deploy));
          });

          const featureLayer = createLayer(arrMarkers);
          this.view.map.add(featureLayer);
          console.log('Success:', data);

          const topRightContainer = document.createElement('div');
          topRightContainer.id = 'rightContainer';
          const cameraElm = document.createElement('div');
          const mapOverviewElm = document.createElement('div');
          const lineOfSightElm = document.createElement('div');
          const viewshedElm = document.createElement('div');

          topRightContainer.appendChild(cameraElm);
          topRightContainer.appendChild(mapOverviewElm);
          this.view.ui.add(topRightContainer, 'top-right');
          this.view.ui.add(lineOfSightElm, 'bottom-right');
          this.view.ui.add(viewshedElm, 'bottom-right');
          ReactDOM.render(<Camera view={this.view} />, cameraElm);
          ReactDOM.render(<LineOfSight view={this.view} deployments={deployments}/>, lineOfSightElm);
          ReactDOM.render(<Viewshed view={this.view} deployments={deployments}/>, viewshedElm);
          ReactDOM.render(<MapOverview view={this.view} />, mapOverviewElm);

        })
        .catch(error => {
          console.error('Error:', error);
        });

      function drawMarker(item) {
        let graphic = new Graphic({
          geometry: {
            type: 'point',
            latitude: item.location.coordinates[1],
            longitude: item.location.coordinates[0],
          },
          attributes: {...item, totalAmount: `${getTotalAmount(item)}`},
        });
        return graphic;
      }

      function getTotalAmount(item) {
        return item.deployment.reduce( (total, i) =>  total + i.amount , 0)
      }

      function createLayer(graphics) {
        deployLayerOpt.source = graphics
        return new FeatureLayer(deployLayerOpt);
      }
    });
  }

  componentWillUnmount() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
  }

  render() {
    return <div className='webmap' ref={this.mapRef} />;
  }
}
