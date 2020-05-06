import React, { Component } from 'react';
import { loadModules } from 'esri-loader';
export class LineOfSight extends Component {
  componentDidMount() {
    loadModules(
      ['esri/widgets/LineOfSight', 'esri/widgets/Expand', 'esri/geometry/Point', 'esri/layers/GraphicsLayer'],
      { css: false }
    ).then(([LineOfSightWidget, Expand, Point, GraphicsLayer]) => {
      this.deployLayer = this.props.view.map.allLayers.find((layer) => layer.title === 'deployments');
      //add listener when layer is changing then update sightline
      this.deployLayer.on('edits', (event) => {
        console.log(event);
      });

      const lineOfSightWidget = new LineOfSightWidget({
        view: this.props.view,
        container: 'losWidget',
      });

      const viewModel = lineOfSightWidget.viewModel;

      var graphicsLayer = new GraphicsLayer();
      this.props.view.map.add(graphicsLayer);
      // watch when observer location changes
      viewModel.watch('observer', function (value) {});

      // watch when a new target is added or removed
      viewModel.targets.on('change', function (event) {
        event.added.forEach(function (target) {
          target.watch('intersectedLocation', () => {});
        });
      });

      // this.props.view.on('click', this.sendLocation);
      // viewModel.observer = new Point({
      //   latitude: this.props.deployments[3].location.coordinates[1],
      //   longitude: this.props.deployments[3].location.coordinates[0],
      //   z: this.props.deployments[3].location.elevation,
      // });

      this.props.deployments.forEach((target) => {
        viewModel.targets.push({
          location: new Point({
            latitude: target.location.coordinates[1],
            longitude: target.location.coordinates[0],
            z: target.location.elevation || 3200,
          }),
        });
      });

      viewModel.start();

      const expand = new Expand({
        expandTooltip: 'Expand line of sight widget',
        view: this.view,
        content: document.getElementById('menu'),
        expanded: false,
      });

      this.props.view.ui.add(expand, 'top-right');
      this.props.socketio.on('SEND_LOCATION', updateTargets);

      function updateTargets(item) {
        viewModel.targets.forEach((target, i) => {
          if (
            item.prevlocation.coordinates[0] === target.location.longitude &&
            item.prevlocation.coordinates[1] === target.location.latitude &&
            item.prevlocation.elevation === target.location.z
          ) {
            viewModel.targets.splice(i, 1);
          }
        });
        viewModel.targets.push({
          location: new Point({
            latitude: item.location.coordinates[1],
            longitude: item.location.coordinates[0],
            z: item.location.elevation || 3200,
          }),
        });
      }
    });
  }

  render() {
    return (
      <div id="menu" className="esri-widget">
        <h3>Line of sight analysis</h3>
        <div id="losWidget"></div>
      </div>
    );
  }
}
