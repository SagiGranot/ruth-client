import React from "react";
import ReactDOM from "react-dom";
import { loadModules } from "esri-loader";
import { LineOfSight } from "./LineOfSight";
import { Viewshed } from "./Viewshed";
import { MapOverview } from "./MapOverview";
import { Camera } from "./Camera";
import { deployLayerOpt } from "../layers/deployLayer";
import { objectLayerOpt } from "../layers/objectLayer";
import { ObjectEditor } from "./ObjectEditor";

export class MapSceneView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    loadModules(
      [
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
      ],
      { css: true }
    ).then(([Map, SceneView, FeatureLayer, Graphic]) => {
      const map = new Map({
        basemap: "topo-vector",
        ground: "world-elevation",
      });

      this.view = new SceneView({
        container: this.mapRef.current,
        map: map,
        camera: {
          position: [35.587, 30.929, 2184], // change map location [lon , lat, height]
          tilt: 80,
        },
      });

      var deployments;

      fetch("http://localhost:8080/deploy", {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          var arrMarkers = [];
          var objMarkers;
          deployments = data;
          data.forEach((deploy) => {
            if (deploy.deployId === "3") deploy.deployType = "me";
            arrMarkers.push(drawMarker(deploy));
          });

          const deployLayer = createLayer(deployLayerOpt, arrMarkers);

          objMarkers = drawPolyMarker();
          const objectLayer = createLayer(objectLayerOpt, objMarkers);

          objectLayer.on("apply-edits", (e) => {});
          deployLayer.on("apply-edits", (e) => {});

          this.view.map.add(deployLayer);
          this.view.map.add(objectLayer);
          console.log("Success:", data);

          // const topRightContainer = document.createElement("div");
          // topRightContainer.id = "rightContainer";
          // const cameraElm = document.createElement("div");
          // const mapOverviewElm = document.createElement("div");
          const lineOfSightElm = document.createElement("div");
          // const viewshedElm = document.createElement("div");
          const objectEditorElm = document.createElement("div");

          // topRightContainer.appendChild(cameraElm);
          // topRightContainer.appendChild(mapOverviewElm);
          // topRightContainer.appendChild(objectEditorElm);
          // this.view.ui.add(topRightContainer, "top-right");
          this.view.ui.add(lineOfSightElm, "bottom-right");
          this.view.ui.add(objectEditorElm, "top-right");
          // this.view.ui.add(viewshedElm, 'bottom-right');
          // ReactDOM.render(<Camera view={this.view} />, cameraElm);
          ReactDOM.render(
            <LineOfSight view={this.view} deployments={deployments} />,
            lineOfSightElm
          );
          // ReactDOM.render(<Viewshed view={this.view} deployments={deployments}/>, viewshedElm);
          // ReactDOM.render(<MapOverview view={this.view} />, mapOverviewElm);
          ReactDOM.render(<ObjectEditor view={this.view} />, objectEditorElm);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      function drawMarker(item) {
        let graphic = new Graphic({
          geometry: {
            type: "point",
            latitude: item.location.coordinates[1],
            longitude: item.location.coordinates[0],
          },
          attributes: { ...item, totalAmount: `${getTotalAmount(item)}` },
        });
        return graphic;
      }

      function drawPolyMarker(item) {
        let graphic = new Graphic({
          geometry: {
            type: "polygon",
            rings: [
              [35.5941043819718, 30.96278145588418],
              [35.590824784255645, 30.964041640021],
              [35.5948743645029, 30.974897501935263],
              [35.5941043819718, 30.96278145588418],
            ],
          },
          attributes: {
            oadditionalInfo: "mma",
            height: "3000",
            objectType: "Building",
            reportingUserId: "3",
            totalAmount: "3",
            additionalInfo: "hohoh",
          },
        });

        return [graphic];
      }

      function getTotalAmount(item) {
        return item.deployment.reduce((total, i) => total + i.amount, 0);
      }

      function createLayer(layer, graphics) {
        layer.source = graphics;

        return new FeatureLayer(layer);
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
    return <div className="webmap" ref={this.mapRef} />;
  }
}
