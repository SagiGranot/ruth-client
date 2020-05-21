import React, { Component } from "react";
import { loadModules } from "esri-loader";
import ReactDOM from "react-dom";

export class DeltaLogs extends React.Component {
  componentDidMount() {
    loadModules(["esri/widgets/Expand"], {
      css: true,
    }).then(async ([Expand]) => {
      const expand = new Expand({
        expandIconClass: "esri-icon-key",
        expandTooltip: "Expand DeltaLogs widget",
        view: this.props.view,
        content: document.getElementById("logsContent"),
        expanded: false,
      });
      this.props.view.ui.add(expand, "top-right");
    });
  }

  render() {
    return (
      <div
        style={{ width: "400px", height: "400px", backgroundColor: "white" }}
        id="logsContent"
      >
        <h4>Delta Recent Logs</h4>
      </div>
    );
  }
}
