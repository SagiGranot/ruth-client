import React, { Component } from "react";
import { loadModules } from "esri-loader";
import socketIOClient from "socket.io-client";
const clone = require("rfdc")();
const Deploy = require("../schema/Deploy.json");

export class Viewshed extends Component {
  constructor() {
    super();
    this.socket = socketIOClient("http://localhost:8080");
    this.sendLocation = this.sendLocation.bind(this);
  }

  componentDidMount() {
    loadModules(
      [
        "esri/geometry/Point",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/tasks/Geoprocessor",
        "esri/tasks/support/LinearUnit",
        "esri/tasks/support/FeatureSet"
      ],
      { css: true }
    ).then(
      ([
        Point,
        Graphic,
        GraphicsLayer,
        Geoprocessor,
        LinearUnit,
        FeatureSet
      ]) => {
        var featureLayer = this.props.view.map.allLayers.find(function(layer) {
          return layer.title === "deployments";
        });

        var gpUrl =
          "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed";

        var fillSymbol = {
          type: "simple-fill",
          color: [255, 0, 0, 0.4],
          outline: {
            color: [255, 255, 255, 0.0],
            width: 0
          }
        };

        var graphicsLayer = new GraphicsLayer();
        this.props.view.map.add(graphicsLayer);

        var gp = new Geoprocessor(gpUrl);
        gp.outSpatialReference = {
          wkid: 102100
        };

        function computeViewshed(items) {
          graphicsLayer.removeAll();

          featureLayer
            .queryFeatures({
              where: "deployType = 'Enemy'",
              outFields: ["*"],
              returnGeometry: true
            })
            .then(function(results) {
              const inputGraphicContainer = results.features.map(i => {
                let point = new Point({
                  latitude: i.geometry.latitude,
                  longitude: i.geometry.longitude
                });

                return new Graphic({
                  geometry: point
                });
              });

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
            });
        }

        function drawResultData(result) {
          var resultFeatures = result.results[0].value.features;

          var viewshedGraphics = resultFeatures.map(function(feature) {
            feature.symbol = fillSymbol;
            return feature;
          });

          graphicsLayer.addMany(viewshedGraphics);
        }

        //computeViewshed();

        function selectFeature(deploy) {
          console.log(deploy);
          const deployId = deploy.deployId;
          const queryById = deployId ? `='${deployId}'` : null;
          featureLayer
            .queryFeatures({
              where: "deployId" + queryById,
              outFields: ["*"],
              returnGeometry: true
            })
            .then(function(results) {
              let editFeature = results.features[0];
              editFeature.geometry["latitude"] = deploy.location.coordinates[1];
              editFeature.geometry["longitude"] =
                deploy.location.coordinates[0];
              editFeature.geometry["z"] = deploy.location.elevation;

              const edits = {
                updateFeatures: [editFeature]
              };

              featureLayer
                .applyEdits(edits)
                .then(function(editsResult) {
                  if (deploy.deployType === "Enemy") {
                    // computeViewshed();
                  }
                })
                .catch(function(error) {
                  console.log("error = ", error);
                });
            });
        }

        this.socket.on("SEND_LOCATION", selectFeature);
      }
    );
  }

  sendLocation(event) {
    // this.props.view.hitTest(event.screenPoint).then( response => {
    //   var graphics = response.results;
    //   if (!graphics.length) {
    //     const deploy = clone(Deploy);
    //     deploy.location.coordinates = [
    //       event.mapPoint.longitude,
    //       event.mapPoint.latitude
    //     ];
    //     deploy.location.elevation = event.mapPoint.z;
    //     this.socket.emit('SEND_LOCATION', deploy);
    //   }
    // });
  }

  render() {
    return null;
  }
}
