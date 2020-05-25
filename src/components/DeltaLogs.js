import React, { Component } from 'react';
import { loadModules } from 'esri-loader';

const COLORS = { ENEMY_CLOSER: 'yellow', ENEMY_SURROUNDING: 'red', ASSIST_FRIENDLY: 'blue' };

export class DeltaLogs extends React.Component {
  constructor() {
    super();
    this.deltasLogs = [];
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
          width: '400px',
          height: '400px',
          padding: '5px',
          margin: '0',
          backgroundColor: 'black',
          opacity: '70%',
        }}
        id="logsContent"
      >
        <h3 style={{ padding: '5px' }}>Delta Recent Logs</h3>
        <div
          style={{
            padding: '5px',
            overflowY: 'scroll',
            width: '100%',
            height: '300px',
          }}
        >
          {this.deltasLogs.map((value, index) => {
            let time = new Date(value.timestamp);
            return (
              <div
                style={{ margin: '4px', marginBottom: '20px', color: COLORS[value.message] }}
                id={value._id}
                key={index}
              >
                <h4 style={{ margin: '0' }}>{value.message}</h4>
                <h5 style={{ margin: '0' }}>
                  {time.toDateString()} --- {time.getUTCHours()}:{time.getMinutes()}
                </h5>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
