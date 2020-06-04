import React, { Component } from 'react';
import { loadModules } from 'esri-loader';

const COLORS = {
  ENEMY_CLOSER: '#f5cd36',
  ENEMY_SURROUNDING: '#f50e6e',
  ASSIST_FRIENDLY: '#44f47b',
  BLUE: '#4466f4',
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
    loadModules(['esri/widgets/Expand'], {
      css: false,
    }).then(async ([Expand]) => {
      const expand = new Expand({
        expandIconClass: 'esri-icon-duplicate',
        expandTooltip: 'Expand DeltaLogs widget',
        view: this.props.view,
        content: document.getElementById('logsContent'),
        expanded: false,
      });
      this.props.view.ui.add(expand, 'top-right');

      this.props.socketio.on('NOTIFICATION', this.addLogsToWidget);
      this.props.socketio.on('ENEMY_CLOSER_' + this.props.userId, (log) =>
        this.addLogsToWidget(log, 'ENEMY_CLOSER')
      );
      this.props.socketio.on('ENEMY_SURROUNDING_' + this.props.userId, (log) =>
        this.addLogsToWidget(log, 'ENEMY_SURROUNDING')
      );
      this.props.socketio.on('ASSIST_FRIENDLY_' + this.props.userId, (log) =>
        this.addLogsToWidget(log, 'ASSIST_FRIENDLY')
      );

      this.deltasLogs = this.props.deltas;
      //console.log(this.deltasLogs[1].data[0].area);
      // window.addEventListener('resize', () => {
      //   this.setState({ windowWidth: document.body.clientWidth });
      // });

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
          width: '310px',
          height: '400px',
          margin: '0',
          backgroundColor: '#2f2f2f',
          opacity: '90%',
        }}
        id="logsContent"
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
          <h4 style={{ textAlign: 'center', flex: '1 1 auto', overflow: 'hidden' }}>Delta Recent Logs</h4>
        </header>
        <div
          style={{
            overflowY: 'scroll',
            width: '100%',
            height: '300px',
          }}
        >
          {this.deltasLogs.map((value, index) => {
            //console.log(value);
            const time = value.timestamp ? new Date(value.timestamp) : new Date(Date.now());
            return (
              <div
                style={{
                  //margin: "4px",
                  //marginBottom: "20px",
                  // color: COLORS[value.message],
                  display: 'flex',
                  margin: '4px 4px 20px',
                  backgroundColor: '#252525',
                  borderRadius: '2px',
                  border: '1px solid rgba(173,173,173,0.3)',
                  borderColor: 'transparent',
                  //justifyContent: "space-evenly",
                  alignItems: 'center',
                  boxShadow: '0 1px 0 rgba(173,173,173,0.3)',
                }}
                id={value._id}
                key={index}
              >
                <div
                  style={{
                    margin: '10px',
                    backgroundColor: COLORS[value.message],
                    width: '10px',
                    height: '10px',
                    borderRadius: '50px',
                    boxShadow: '0px 0px 7px' + COLORS[value.message],
                  }}
                ></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      margin: '0',
                      display: this.state.windowWidth > this.mediaQuery.phone ? 'block' : 'inline',
                    }}
                  >
                    {value.message}
                  </span>
                  <span>
                    {time.toDateString()} --- {time.getUTCHours()}:{time.getMinutes()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
