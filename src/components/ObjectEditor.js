import React, { Component } from "react";
import { loadModules } from "esri-loader";

export class ObjectEditor extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    loadModules(["esri/widgets/Editor"], {
      css: true,
    }).then(([Editor]) => {
      this.props.view.when(() => {
        // this.props.view.popup.autoOpenEnabled = false; //disable popups
        // Create the Editor
        let editor = new Editor({
          view: this.props.view,
        });
        // Add widget to top-right of the view
        this.props.view.ui.add(editor, "top-right");

        const satelliteCheckbox = document.getElementById("satellite");
        // change event handler to set the basempa accordingly
        satelliteCheckbox.addEventListener("change", (event) => {
          this.props.view.map.basemap = event.target.checked ? "satellite" : "";
        });
        // Add the checkbox to the bottom-right of the view
        this.props.view.ui.add("setting", "bottom-right");
      });
    });
  }

  render() {
    return (
      <div id="setting" className="esri-widget">
        <input type="checkbox" id="satellite" />
        <label for="satellite">Show satellite basemap</label>
        <br />
      </div>
    );
  }
}
