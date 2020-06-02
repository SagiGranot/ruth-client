/* eslint-disable react/react-in-jsx-scope */
import React, { Component } from "react";
import { loadModules } from "esri-loader";

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
    loadModules(["esri/widgets/Expand"], {
      css: true,
    }).then(async ([Expand]) => {
      const weatherWidget = new Expand({
        expandIconClass: "esri-icon-environment-settings",
        expandTooltip: "Expand weather widget",
        view: this.props.view,
        content: document.getElementById("weather"),
        expanded: false,
      });

      this.props.view.ui.add(weatherWidget, "top-right");
      this.weatherInfo = this.props.weather;
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div
        style={{
          width:
            this.state.windowWidth > this.mediaQuery.phone ? "400px" : "280px",
          height:
            this.state.windowWidth > this.mediaQuery.phone ? "400px" : "500px",
          padding: "5px",
          backgroundColor: "black",
          opacity: "70%",
        }}
        id="weather"
      >
        <h2
          style={{
            textAlign:
              this.state.windowWidth > this.mediaQuery.phone
                ? "center"
                : "left",
          }}
        >
          Weather Information
        </h2>
        <div style={{ margin: "5px", padding: "5px" }}>
          <h3>Humidity: {this.weatherInfo.Humidity}%</h3>
          <h3>
            <i
              style={{ margin: "5px" }}
              className="fas fa-temperature-high"
            ></i>
            High Temperature: {this.weatherInfo.HighTemperature} &#8451;
          </h3>
          <h3>
            <i style={{ margin: "5px" }} className="fas fa-temperature-low"></i>
            Low Temperature: {this.weatherInfo.LowTemperature} &#8451;
          </h3>
          <h3>
            <i style={{ margin: "5px" }} className="fas fa-wind"></i>Wind Speed:{" "}
            {this.weatherInfo.WindSpeed} km/h
          </h3>
          <h3>
            <i style={{ margin: "5px" }} className="fas fa-cloud-sun"></i>
            Sunrise: {this.weatherInfo.Sunrise}
          </h3>
          <h3 style={{ marginLeft: "30px" }}>
            Sunset: {this.weatherInfo.Sunset}
          </h3>
          <h3>
            <i style={{ margin: "5px" }} className="fas fa-cloud-moon"></i>
            Moonset: {this.weatherInfo.Moonset}
          </h3>
          <h3 style={{ marginLeft: "30px" }}>
            Moon Phase: {this.weatherInfo.MoonPhase}
          </h3>
        </div>
      </div>
    );
  }
}
