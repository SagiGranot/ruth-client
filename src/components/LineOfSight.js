import React, { Component } from "react";
import { loadModules } from "esri-loader";
import socketIOClient from "socket.io-client";
const clone = require("rfdc")();
const Deploy = require("../schema/Deploy.json");
export class LineOfSight extends Component {
  constructor() {
    super();
    this.socket = socketIOClient("http://localhost:8080");
    // this.sendLocation = this.sendLocation.bind(this);
  }

  componentDidMount() {
    loadModules(
      [
        "esri/widgets/LineOfSight",
        "esri/widgets/Expand",
        "esri/geometry/Point",
        "esri/Graphic",
        "esri/layers/GraphicsLayer",
        "esri/tasks/Geoprocessor",
        "esri/tasks/support/LinearUnit",
        "esri/tasks/support/FeatureSet",
        "esri/core/watchUtils",
      ],
      { css: true }
    ).then(
      ([
        LineOfSightWidget,
        Expand,
        Point,
        Graphic,
        GraphicsLayer,
        Geoprocessor,
        LinearUnit,
        FeatureSet,
        watchUtils,
      ]) => {
        var featureLayer = this.props.view.map.allLayers.find(function (layer) {
          return layer.title === "deployments";
        });

        const lineOfSightWidget = new LineOfSightWidget({
          view: this.props.view,
          container: "losWidget",
        });

        const viewModel = lineOfSightWidget.viewModel;

        var graphicsLayer = new GraphicsLayer();
        this.props.view.map.add(graphicsLayer);
        // watch when observer location changes
        viewModel.watch("observer", function (value) {
          console.log("@@@");
        });

        // watch when a new target is added or removed
        viewModel.targets.on("change", function (event) {
          event.added.forEach(function (target) {
            target.watch("intersectedLocation", () => console.log("@@@"));
          });
        });

        this.props.view.on("click", this.sendLocation);
        viewModel.observer = new Point({
          latitude: this.props.deployments[4].location.coordinates[1],
          longitude: this.props.deployments[4].location.coordinates[0],
          z: this.props.deployments[4].location.elevation,
        });

        this.props.deployments.forEach((target) => {
          viewModel.targets.push({
            location: new Point({
              latitude: target.location.coordinates[1],
              longitude: target.location.coordinates[0],
              z: target.location.elevation || 3200,
            }),
          });
        });

        viewModel.start();

        const expand = new Expand({
          expandTooltip: "Expand line of sight widget",
          view: this.view,
          content: document.getElementById("menu"),
          expanded: false,
        });

        this.props.view.ui.add(expand, "bottom-right");
        this.socket.on("SEND_LOCATION", updateTargets);

        function updateTargets(item) {
          viewModel.targets.forEach((target, i) => {
            if (
              item.prevlocation.coordinates[0] === target.location.longitude &&
              item.prevlocation.coordinates[1] === target.location.latitude &&
              item.prevlocation.elevation === target.location.z
            ) {
              viewModel.targets.splice(i, 1);
            }
          });
          viewModel.targets.push({
            location: new Point({
              latitude: item.location.coordinates[1],
              longitude: item.location.coordinates[0],
              z: item.location.elevation || 3200,
            }),
          });
        }
      }
    );
  }

  sendLocation(event) {
    console.log(event.mapPoint);
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
    return (
      <div id="menu" className="esri-widget">
        <div id="elevationDiv" className="esri-widget">
          <label>
            Elevation:{" "}
            <input id="elevationInput" type="checkbox" checked="yes" />
          </label>
        </div>
        <h3>Line of sight analysis</h3>
        <input type="checkbox" id="layerVisibility" checked />
        <label for="layerVisibility">Show development layer</label>
        <button id="updateEnemyBtn">update enemy position</button>
        <button id="removeMarkers">RemoveAllMarkers</button>

        <div id="losWidget"></div>
      </div>
    );
  }
}
