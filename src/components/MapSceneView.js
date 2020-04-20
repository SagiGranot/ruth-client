import React from "react";
import ReactDOM from "react-dom";
import { loadModules } from "esri-loader";
import { LineOfSight } from "./LineOfSight";
import { Viewshed } from "./Viewshed";
import { deployLayerOpt } from "../layers/deployLayer";
import { objectLayerOpt } from "../layers/objectLayer";
import { ObjectEditor } from "./ObjectEditor";
import { getDeployments } from "../api/getDeployments";
export class MapSceneView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  async componentDidMount() {
    loadModules(
      [
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
      ],
      { css: true }
    )
      .then(async ([Map, SceneView, FeatureLayer, Graphic]) => {
        const map = new Map({
          basemap: "topo-vector",
          ground: "world-elevation",
        });

        this.view = new SceneView({
          container: this.mapRef.current,
          map: map,
          camera: {
            position: [35.587, 30.929, 2184],
            tilt: 80,
          },
        });

        let objectGraphics = [];

        const deployments = await getDeployments();
        const deployGraphics = deployments.map((deploy) => {
          if (deploy.deployId === "3") deploy.deployType = "me";
          return createPointGraphic(deploy);
        });

        let objMarkers = createPolyGraphic();

        const deployLayer = createLayer(deployLayerOpt, deployGraphics);
        const objectLayer = createLayer(objectLayerOpt, objMarkers);
        objectLayer.on("apply-edits", (e) => {});
        deployLayer.on("apply-edits", (e) => {});
        this.view.map.add(deployLayer);
        this.view.map.add(objectLayer);

        const lineOfSightElm = document.createElement("div");
        const objectEditorElm = document.createElement("div");
        this.view.ui.add(lineOfSightElm, "bottom-right");
        this.view.ui.add(objectEditorElm, "top-right");

        ReactDOM.render(
          <LineOfSight view={this.view} deployments={deployments} />,
          lineOfSightElm
        );
        ReactDOM.render(<ObjectEditor view={this.view} />, objectEditorElm);

        function createPointGraphic(item) {
          let graphic = new Graphic({
            geometry: {
              type: "point",
              latitude: item.location.coordinates[1],
              longitude: item.location.coordinates[0],
            },
            attributes: { ...item },
          });
          return graphic;
        }

        function createPolyGraphic(item) {
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

        function createLayer(layer, graphics) {
          layer.source = graphics;
          return new FeatureLayer(layer);
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

  render() {
    return <div className="webmap" ref={this.mapRef} />;
  }
}
