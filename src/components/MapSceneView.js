import React from 'react';
import ReactDOM from 'react-dom';
import { loadModules } from 'esri-loader';
import { LineOfSight } from './LineOfSight';
import { MapOverview } from './MapOverview';
import { Camera } from './Camera';

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
          position: [7.654, 45.919, 5184],
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
            arrMarkers.push(drawMarker(deploy));
          });

          const featureLayer = createLayer(arrMarkers);
          this.view.map.add(featureLayer);
          console.log('Success:', data);

          const topRightContainer = document.createElement('div');
          topRightContainer.id = 'rightContainer';
          const cameraElm = document.createElement('div');
          const editReports = document.createElement('div');
          const mapOverviewElm = document.createElement('div');
          const lineOfSightElm = document.createElement('div');

          topRightContainer.appendChild(cameraElm);
          topRightContainer.appendChild(mapOverviewElm);
          this.view.ui.add(topRightContainer, 'top-right');
          this.view.ui.add(lineOfSightElm, 'bottom-right');
          // this.view.ui.add(editReports, 'bottom-left');
          ReactDOM.render(<Camera view={this.view} />, cameraElm);
          ReactDOM.render(<LineOfSight view={this.view} deployments={deployments}/>, lineOfSightElm);
          ReactDOM.render(<MapOverview view={this.view} />, mapOverviewElm);
          // ReactDOM.render(<EditReports view={this.view} />, editReports);

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
          attributes: {...item},
          symbol: {

          }
        });
        return graphic;
      }

      // var foundLayer = this.view.map.allLayers.find(function(layer) {
      //   return layer.title === "deployments";
      //  });


      function createLayer(graphics) {
        return new FeatureLayer({
          source: graphics,
          title: 'deployments',
          objectIdField: 'OBJECTID',
          geometryType: 'point',
          spatialReference: { wkid: 4326 },
          fields: [
            {
              name: 'deployType',
              alias: 'TYPE',
              type: 'string'
            },
            {
              name: 'additionalInfo',
              alias: 'INFO',
              type: 'string'
            },
          ],
          renderer: {
            type: "unique-value",
            field: "deployType",
            defaultSymbol: { type: "simple-fill" },
            uniqueValueInfos: [{
                value: "Friendly",
                symbol: {
                  type: 'web-style',
                  name: "shield-3",
                  styleName: "Esri2DPointSymbolsStyle"
                }
              },
              {
                value: "Enemy",
                symbol: {
                  type: 'web-style',
                  name: "square-3",
                  styleName: "Esri2DPointSymbolsStyle"
              }
            }
            ]
          },
          popupTemplate: {
            title: '{deployType}',
            content:[{
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "additionalInfo",
                  label: "Description"
                }
              ]
            }]
          }
        });
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
