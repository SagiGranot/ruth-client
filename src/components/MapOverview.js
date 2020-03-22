import React, { Component } from 'react'
import { loadModules } from 'esri-loader';
import '../resources/style/Style.css';

export class MapOverview extends Component {
  componentDidMount() {
    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/Graphic",
        "esri/core/watchUtils"
      ],
      { css: true }
    ).then(
      ([
        Map, MapView, Graphic, watchUtils
      ]) => {
        var mainView = this.props.view;
        var overviewMap = new Map({
          basemap: "topo"
        });

        var mapView = new MapView({
        container: "overviewDiv",
        map: overviewMap,
        constraints: {
          rotationEnabled: false
        }
      });


      mapView.ui.components = [];

      mapView.when(function() {
        mainView.when(function() {
          setup();
        });
      });


      function setup() {
        const extent3Dgraphic = new Graphic({
          geometry: null,
          symbol: {
            type: "simple-fill",
            color: [0, 0, 0, 0.5],
            outline: null
          }
        });
        mapView.graphics.add(extent3Dgraphic);

        watchUtils.init(mainView, "extent", function(extent) {
          if (mainView.stationary) {
            mapView.goTo({
              center: mainView.center,
              scale:
                mainView.scale *
                2 *
                Math.max(
                  mainView.width / mapView.width,
                  mainView.height / mapView.height
                )
            });
          }
          extent3Dgraphic.geometry = extent;
        });
      }

  })
}

  render() {
    return (
      <div id="overviewDiv"><div id="extentDiv"></div></div>
    );
  }
}