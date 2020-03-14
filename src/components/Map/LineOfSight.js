import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';

export const LineOfSight = props => {
  useEffect(() => {
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(
      [
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
        LineOfSightWidget,
        Expand,
        watchUtils
      ]) => {
        console.log("1111111111111111");
        const lineOfSightWidget = new LineOfSightWidget({
          view: props.view,
          container: 'losWidget'
        });
        const viewModel = lineOfSightWidget.viewModel;

        viewModel.watch('observer', function(value) {
          calcLineOfSight();
        });

        // watch when a new target is added or removed
        viewModel.targets.on('change', function(event) {
          event.added.forEach(function(target) {
            calcLineOfSight();
            // for each target watch when the intersection changes
            target.watch('intersectedLocation', calcLineOfSight);
          });
        });

        const calcLineOfSight = () => console.log('blablabla');

        viewModel.start();

        // watchUtils.whenEqualOnce(viewModel, 'state', 'creating', function(
        //   value
        // ) {
        //   viewModel.stop();
        // });

        const expand = new Expand({
          expandTooltip: 'Expand line of sight widget',
          view: props.view,
          content: document.getElementById('menu'),
          expanded: true
        });

        props.view.ui.add(expand, 'top-right');

        return () => {
          if (props.view) {
            // destroy the map view
            props.view.container = null;

          }
          return props.view
        };
      },[]);
  });

  return (
    <div id='menu' className='esri-widget'>
      <div id='elevationDiv' className='esri-widget'>
        {/* <label>
          Elevation: <input id='elevationInput' type='checkbox' checked='yes' />
        </label> */}
      </div>
      <h3>Line of sight analysis</h3>
      {/* <input type='checkbox' id='layerVisibility' checked /> */}
      <label htmlFor='layerVisibility'>Show development layer</label>
      <button id='updateEnemyBtn'>update enemy position</button>
      <button id='removeMarkers'>RemoveAllMarkers</button>

      <div id='losWidget'></div>
    </div>
  );
};
