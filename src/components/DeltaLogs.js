import React, { Component } from "react";
import { loadModules } from "esri-loader";

const COLORS = {
  ENEMY_CLOSER: "#f5cd36",
  ENEMY_SURROUNDING: "#f50e6e",
  ASSIST_FRIENDLY: "#44f47b",
  BLUE: "#4466f4",
};

export class DeltaLogs extends React.Component {
  constructor() {
    super();
    this.deltasLogs = [];

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
      css: false,
    }).then(async ([Expand]) => {
      const expand = new Expand({
        expandIconClass: "esri-icon-duplicate",
        expandTooltip: "Expand DeltaLogs widget",
        view: this.props.view,
        content: document.getElementById("logsContent"),
        expanded: false,
      });
      this.props.view.ui.add(expand, "top-right");

      this.props.socketio.on("NOTIFICATION", this.addLogsToWidget);
      this.props.socketio.on("ENEMY_CLOSER_" + this.props.userId, (log) =>
        this.addLogsToWidget(log, "ENEMY_CLOSER")
      );
      this.props.socketio.on("ENEMY_SURROUNDING_" + this.props.userId, (log) =>
        this.addLogsToWidget(log, "ENEMY_SURROUNDING")
      );
      this.props.socketio.on("ASSIST_FRIENDLY_" + this.props.userId, (log) =>
        this.addLogsToWidget(log, "ASSIST_FRIENDLY")
      );

      this.deltasLogs = this.props.deltas;
      //console.log(this.deltasLogs[1].data[0].area);
      window.addEventListener("resize", () => {
        this.setState({ windowWidth: document.body.clientWidth });
      });

      this.forceUpdate();
    });
  }

  addLogsToWidget(log, type) {
    this.deltasLogs.unshift({ message: type, timestamp: log.timestamp });
    this.forceUpdate();
  }

  render() {
    return (
      <div
        style={{
          width:
            this.state.windowWidth > this.mediaQuery.phone ? "400px" : "280px",
          height: "400px",
          padding: "5px",
          margin: "0",
          backgroundColor: "black",
          opacity: "70%",
        }}
        id="logsContent"
      >
        <h2 style={{ textAlign: "center" }}>Delta Recent Logs</h2>
        <div
          style={{
            padding: "5px",
            overflowY: "scroll",
            width: "100%",
            height: "300px",
          }}
        >
          {this.deltasLogs.map((value, index) => {
            //console.log(value);
            const time = value.timestamp
              ? new Date(value.timestamp)
              : new Date(Date.now());
            return (
              <div
                style={{
                  //margin: "4px",
                  //marginBottom: "20px",
                  // color: COLORS[value.message],
                  display: "flex",
                  margin: "4px 4px 20px",
                  //justifyContent: "space-evenly",
                  alignItems: "center",
                }}
                id={value._id}
                key={index}
              >
                <div
                  style={{
                    margin: "10px",
                    backgroundColor: COLORS[value.message],
                    width: "10px",
                    height: "10px",
                    borderRadius: "50px",
                    boxShadow: "0px 0px 7px" + COLORS[value.message],
                  }}
                ></div>

                <h4
                  style={{
                    margin: "0",
                    display:
                      this.state.windowWidth > this.mediaQuery.phone
                        ? "block"
                        : "inline",
                  }}
                >
                  {value.message}
                </h4>
                <h5
                  style={{
                    margin: "10px",
                    display:
                      this.state.windowWidth > this.mediaQuery.phone
                        ? "inline"
                        : "block",
                  }}
                >
                  {time.toDateString()} --- {time.getUTCHours()}:
                  {time.getMinutes()}
                </h5>
                {/* <h5>Area: {value[1].data[0].area.area}</h5> */}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
