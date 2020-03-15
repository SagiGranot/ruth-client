import React from 'react';
import ReactDOM from 'react-dom';
import { loadModules } from 'esri-loader';
import {LineOfSight} from './LineOfSight';

export class MapSceneView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    loadModules(
      ['esri/Map', 'esri/views/SceneView',],
      { css: true }
    ).then(
      ([Map, SceneView,
      ]) => {
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
          }});

          const elm = document.createElement("div");
          this.view.ui.add(elm, "top-right");
          ReactDOM.render(<LineOfSight view={this.view} />, elm);
      }
    );
  }

  componentWillUnmount() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
  }

  render() {
    return (
      <div className='webmap' ref={this.mapRef}/>
    );
  }
}
