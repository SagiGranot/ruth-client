import React, { Component } from "react";
import { loadModules } from "esri-loader";
import moment from "moment";

// let deltasLogs = [
//   "Log 1",
//   "Log 2",
//   "Log 3",
//   "Log 4",
//   "Log 5",
//   "Log 6",
//   "Log 7",
//   "Log 8",
//   "Log 9",
//   "Log 10",
// ];
// let date = moment().format("DD-MM-YYYY hh:mm:ss");

export class DeltaLogs extends React.Component {
  constructor() {
    super();
    this.deltasLogs = [];
  }

  componentDidMount() {
    loadModules(["esri/widgets/Expand"], {
      css: false,
    }).then(async ([Expand]) => {
      const expand = new Expand({
        expandIconClass: "esri-icon-key",
        expandTooltip: "Expand DeltaLogs widget",
        view: this.props.view,
        content: document.getElementById("logsContent"),
        expanded: false,
      });
      this.props.view.ui.add(expand, "top-right");
      this.deltasLogs = this.props.deltas;
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div
        style={{
          width: "400px",
          height: "400px",
          padding: "5px",
          margin: "0",
          backgroundColor: "black",
          opacity: "70%",
        }}
        id="logsContent"
      >
        <h3 style={{ padding: "5px" }}>Delta Recent Logs</h3>
        <div
          style={{
            padding: "5px",
            overflowY: "scroll",
            width: "100%",
            height: "300px",
          }}
        >
          {this.deltasLogs.map((value, index) => {
            let time = new Date(value.timestamp);
            console.log(time.toDateString());
            return (
              <div style={{ margin: "4px" }} id={value._id}>
                <h4 key={index}>{value.message}</h4>
                <h5>
                  {time.toDateString()} --- {time.getUTCHours()}:
                  {time.getMinutes()}
                </h5>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
