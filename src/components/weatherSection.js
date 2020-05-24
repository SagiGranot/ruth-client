import React, { Component } from 'react';
import { loadModules } from 'esri-loader';

export class WeatherSec extends React.Component {
  constructor() {
    super();
    this.weatherForcast = [];
  }

  componentDidMount() {
    loadModules(['esri/widgets/Expand'], {
      css: false,
    }).then(async ([Expand]) => {
      const expand = new Expand({
        expandIconClass: 'esri-icon-environment-settings',
        expandTooltip: 'Expand DeltaLogs widget',
        view: this.props.view,
        content: document.getElementById('weatherContent'),
        expanded: false,
      });
      this.props.view.ui.add(expand, 'top-right');
      this.weatherForcast = this.props.forcast;
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div
        style={{
          width: '400px',
          height: '400px',
          padding: '5px',
          margin: '0',
          backgroundColor: 'black',
          opacity: '70%',
        }}
        id="weatherContent"
      >
        <h3 style={{ padding: '5px' }}>Weather</h3>
        <div
          style={{
            padding: '5px',
            overflowY: 'scroll',
            width: '100%',
            height: '300px',
          }}
        >
        </div>
      </div>
    );
  }
}
