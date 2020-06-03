import { Component } from 'react';
import '../resources/style/Style.css';

export class Camera extends Component {
  componentDidMount() {
    var mainView = this.props.view;
    var changeViewBtn = document.createElement('div');
    changeViewBtn.className = 'esri-icon-maps esri-widget--button esri-widget';
    changeViewBtn.addEventListener('click', tiltView);

    var rotateClockwiseBtn = document.createElement('div');
    rotateClockwiseBtn.className = 'esri-icon-rotate-back esri-widget--button esri-widget';
    rotateClockwiseBtn.addEventListener('click', () => rotateView(-1));

    var rotateAntiClockwiseBtn = document.createElement('div');
    rotateAntiClockwiseBtn.className = 'esri-icon-rotate esri-widget--button esri-widget';
    rotateAntiClockwiseBtn.addEventListener('click', () => rotateView(1));

    mainView.ui.add(changeViewBtn, 'top-left');
    mainView.ui.add(rotateClockwiseBtn, 'top-left');
    mainView.ui.add(rotateAntiClockwiseBtn, 'top-left');

    function rotateView(direction) {
      var heading = mainView.camera.heading;
      // Set the heading of the view to the closest multiple of 45 degrees,
      // depending on the direction of rotation
      if (direction > 0) {
        heading = Math.floor((heading + 1e-3) / 45) * 45 + 45;
      } else {
        heading = Math.ceil((heading - 1e-3) / 45) * 45 - 45;
      }

      mainView.goTo({
        heading: heading,
      });
    }

    function tiltView() {
      let zoom = 15;
      zoom = 100000;

      mainView.goTo({
        tilt: 10,
        scale: zoom,
      });
    }
  }

  render() {
    return null;
  }
}
