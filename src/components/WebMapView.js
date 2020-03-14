import React from 'react';
import { loadModules } from 'esri-loader';

export class WebMapView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(
      [
        'esri/Map',
        'esri/views/SceneView',
        'esri/widgets/LineOfSight',
        'esri/widgets/Expand',
        'esri/geometry/Point',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/tasks/Geoprocessor',
        'esri/tasks/support/LinearUnit',
        'esri/tasks/support/FeatureSet',
        'esri/core/watchUtils'
      ],
      { css: true }
    ).then(
      ([
        Map,
        SceneView,
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
        const map = new Map({
          basemap: 'topo-vector', //topo-vector , streets, Gray, Dark Gray, hybrid,  open street map, Topographic
          ground: 'world-elevation'
        });

        this.view = new SceneView({
          container: this.mapRef.current,
          map: map,
          camera: {
            position: [7.654, 45.919, 5184],
            tilt: 80
          }
        });

        const lineOfSightWidget = new LineOfSightWidget({
          view: this.view,
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

        this.view.ui.add(expand, 'top-right');
      }
    );
  }

  componentWillUnmount() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
  }

  render() {
    return (
      <div className='webmap' ref={this.mapRef}>
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
      </div>
    );
  }
}
