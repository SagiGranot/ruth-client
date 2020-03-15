import React, { Component } from 'react'
import { loadModules } from 'esri-loader';

export class LineOfSight extends Component {
  state = {};

  componentDidMount() {
    loadModules(
      ['esri/widgets/LineOfSight',
      'esri/widgets/Expand',
      'esri/geometry/Point',
      'esri/Graphic',
      'esri/layers/GraphicsLayer',
      'esri/tasks/Geoprocessor',
      'esri/tasks/support/LinearUnit',
      'esri/tasks/support/FeatureSet',
      'esri/core/watchUtils'],
      { css: true }
    ).then(
      ([
        LineOfSightWidget,
        Expand,
        Point,
        Graphic,
        GraphicsLayer,
        Geoprocessor,
        LinearUnit,
        FeatureSet,
        watchUtils
      ]) => {
        const lineOfSightWidget = new LineOfSightWidget({
          view: this.props.view,
          container: 'losWidget'
        });

        const viewModel = lineOfSightWidget.viewModel;

        // watch when observer location changes
        viewModel.watch('observer', function(value) {
          // DO LOGIC
          console.log('@@@')
        });

        // watch when a new target is added or removed
        viewModel.targets.on('change', function(event) {
          event.added.forEach(function(target) {
            // for each target watch when the intersection changes
            target.watch('intersectedLocation', () =>
              //DO LOGIC
              console.log('@@@')
            );
          });
        });

        viewModel.observer = new Point({
          latitude: 45.97406769726578,
          longitude: 7.655679901160549,
          z: 3991.9613455347717
        });

        viewModel.start();

        const expand = new Expand({
          expandTooltip: 'Expand line of sight widget',
          view: this.view,
          content: document.getElementById('menu'),
          expanded: true
        });

                  // Insert text
        this.props.view.ui.add(expand, 'bottom-right');

  })
}

  render() {
    return (
      <div id='menu' class='esri-widget'>
      <div id='elevationDiv' class='esri-widget'>
        <label>
          Elevation:{' '}
          <input id='elevationInput' type='checkbox' checked='yes' />
        </label>
      </div>
      <h3>Line of sight analysis</h3>
      <input type='checkbox' id='layerVisibility' checked />
      <label for='layerVisibility'>Show development layer</label>
      <button id='updateEnemyBtn'>update enemy position</button>
      <button id='removeMarkers'>RemoveAllMarkers</button>

    <div id='losWidget'></div>
    </div>
    );
  }
}