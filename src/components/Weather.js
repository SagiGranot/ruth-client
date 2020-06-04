/* eslint-disable react/react-in-jsx-scope */
import React, { Component } from 'react';
import { loadModules } from 'esri-loader';

export class Weather extends Component {
  constructor() {
    super();
    this.weatherInfo = {};

    this.mediaQuery = {
      desktop: 1200,
      tablet: 768,
      phone: 576,
    };

    this.state = {
      windowWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    loadModules(['esri/widgets/Expand'], {
      css: true,
    }).then(async ([Expand]) => {
      const weatherWidget = new Expand({
        expandIconClass: 'esri-icon-environment-settings',
        expandTooltip: 'Expand weather widget',
        view: this.props.view,
        content: document.getElementById('weather'),
        expanded: false,
      });

      this.props.view.ui.add(weatherWidget, 'top-right');
      this.weatherInfo = this.props.weather;
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div
        style={{
          width: '268px',
          height: this.state.windowWidth > this.mediaQuery.phone ? '400px' : '500px',
          padding: '5px',
          backgroundColor: '#2f2f2f',
          opacity: '85%',
        }}
        id="weather"
      >
        <header
          style={{
            backgroundColor: '#242424',
            padding: '0 11px',
            fontSize: '16px',
            borderBottom: '1px solid rgba(173,173,173,0.3)',
            display: 'flex',
            alignItems: 'center',
            height: '56px',
          }}
        >
          <h4 style={{ textAlign: 'center', flex: '1 1 auto', overflow: 'hidden' }}>Weather</h4>
        </header>
        <div style={{ margin: '5px', padding: '5px' }}>
          <h5>Humidity: {this.weatherInfo.Humidity}%</h5>
          <h5>
            <i style={{ margin: '5px' }} className="fas fa-temperature-high"></i>
            High Temperature: {this.weatherInfo.HighTemperature} &#8451;
          </h5>
          <h5>
            <i style={{ margin: '5px' }} className="fas fa-temperature-low"></i>
            Low Temperature: {this.weatherInfo.LowTemperature} &#8451;
          </h5>
          <h5>
            <i style={{ margin: '5px' }} className="fas fa-wind"></i>Wind Speed: {this.weatherInfo.WindSpeed}{' '}
            km/h
          </h5>
          <h5>
            <i style={{ margin: '5px' }} className="fas fa-cloud-sun"></i>
            Sunrise: {this.weatherInfo.Sunrise}
          </h5>
          <h5 style={{ marginLeft: '30px' }}>Sunset: {this.weatherInfo.Sunset}</h5>
          <h5>
            <i style={{ margin: '5px' }} className="fas fa-cloud-moon"></i>
            Moonset: {this.weatherInfo.Moonset}
          </h5>
          <h5 style={{ marginLeft: '30px' }}>Moon Phase: {this.weatherInfo.MoonPhase}</h5>
        </div>
      </div>
    );
  }
}
