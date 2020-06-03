import { Component } from 'react';
import { loadModules } from 'esri-loader';

export class DayLight extends Component {
  componentDidMount() {
    loadModules(['esri/widgets/Daylight', 'esri/widgets/Expand'], {
      css: true,
    }).then(async ([Daylight, Expand]) => {
      const daylightWidget = new Daylight({
        view: this.props.view,
        playSpeedMultiplier: 0.02,
        visibleElements: {
          timezone: false,
          datePicker: false,
          shadowsToggle: false,
        },
      });

      const expand = new Expand({
        expandIconClass: 'esri-icon-time-clock',
        expandTooltip: 'Expand daylight widget',
        view: this.props.view,
        content: daylightWidget,
        expanded: false,
      });
      this.props.view.ui.add(expand, 'top-right');
    });
  }

  render() {
    return null;
  }
}
