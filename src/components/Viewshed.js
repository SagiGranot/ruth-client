import React, { Component } from 'react';
import { loadModules } from 'esri-loader';
// import socketIOClient from 'socket.io-client';
const clone = require('rfdc')();
const Deploy = require('../schema/Deploy.json');

export class Viewshed extends Component {
  constructor() {
    super();
    // this.socket = socketIOClient('http://localhost:8080');
    // this.sendLocation = this.sendLocation.bind(this);
  }

  componentDidMount() {
    loadModules(
      [
        'esri/geometry/Point',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/tasks/Geoprocessor',
        'esri/tasks/support/LinearUnit',
        'esri/tasks/support/FeatureSet',
      ],
      { css: true }
    ).then(
      ([
        Point,
        Graphic,
        GraphicsLayer,
        Geoprocessor,
        LinearUnit,
        FeatureSet,
      ]) => {
        var featureLayer = this.props.view.map.allLayers.find(function(layer) {
          return layer.title === 'deployments';
        });

        var gpUrl =
        "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed";


        var fillSymbol = {
          type: "simple-fill",
          color: [255, 0, 0, 0.40],
          outline: {
            color: [255, 255, 255, 0.00],
            width: 0
          }
        };

        var graphicsLayer = new GraphicsLayer();
        this.props.view.map.add(graphicsLayer);

        var gp = new Geoprocessor(gpUrl);
        gp.outSpatialReference = {
          wkid: 102100
        };
        // this.props.view.on("click", computeViewshed);

        function computeViewshed(items) {
          // graphicsLayer.removeAll();

          debugger;
          const inputGraphicContainer = items.map( i => {
            let point = new Point({
              latitude: i.location.coordinates[1],
              longitude: i.location.coordinates[0],
            })

            return new Graphic({
              geometry: point
            });
          })

          var featureSet = new FeatureSet();
          featureSet.features = inputGraphicContainer;

          var vsDistance = new LinearUnit();
          vsDistance.distance = 10;
          vsDistance.units = "kilometers";

          var params = {
            Input_Observation_Point: featureSet,
            Viewshed_Distance: vsDistance
          };

          gp.execute(params).then(drawResultData);
        }

        function drawResultData(result) {
          var resultFeatures = result.results[0].value.features;

          var viewshedGraphics = resultFeatures.map(function(feature) {
            feature.symbol = fillSymbol;
            return feature;
          });

          graphicsLayer.addMany(viewshedGraphics);
        }


        let targets = this.props.deployments.filter(target => target.deployType === 'Enemy');
         computeViewshed(targets);

        // this.socket.on('SEND_LOCATION', updateTargets);

        function updateTargets(item) {
          computeViewshed(item)
          // viewModel.targets.push({
          //   location: new Point({
          //     latitude: item.location.coordinates[1],
          //     longitude: item.location.coordinates[0],
          //     z: item.location.elevation || 3200
          //   })
          // });

          // let graphic = new Graphic({
          //   geometry: {
          //     type: 'point',
          //     latitude: item.location.coordinates[1],
          //     longitude: item.location.coordinates[0]
          //   },
          //   attributes: { ...item },
          //   symbol: {}
          // });

          // const addEdits = {
          //   addFeatures: [graphic]
          // };

          // featureLayer
          //   .applyEdits(addEdits)
          //   .then(function(results) {
          //     // if edits were removed
          //     if (results.deleteFeatureResults.length > 0) {
          //       console.log(
          //         results.deleteFeatureResults.length,
          //         'features have been removed'
          //       );
          //     }
          //     // if features were added - call queryFeatures to return
          //     //    newly added graphics
          //     if (results.addFeatureResults.length > 0) {
          //       var objectIds = [];
          //       results.addFeatureResults.forEach(function(item) {
          //         objectIds.push(item.objectId);
          //       });
          //       // query the newly added features from the layer
          //       featureLayer
          //         .queryFeatures({
          //           objectIds: objectIds
          //         })
          //         .then(function(results) {
          //           console.log(
          //             results.features.length,
          //             'features have been added.'
          //           );
          //         });
          //     }
          //   })
          //   .catch(function(error) {
          //     console.log(error);
          //   });
        }
      }
    );
  }

  sendLocation(event) {
    this.props.view.hitTest(event.screenPoint).then( response => {
      var graphics = response.results;
      if (!graphics.length) {
        const deploy = clone(Deploy);
        deploy.location.coordinates = [
          event.mapPoint.longitude,
          event.mapPoint.latitude
        ];
        deploy.location.elevation = event.mapPoint.z;
        this.socket.emit('SEND_LOCATION', deploy);
      }
    });
  }

  render() {
    return null
  }
}
