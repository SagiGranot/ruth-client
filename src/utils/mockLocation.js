var geolocate = require('mock-geolocation');

export function mockGeolocation() {
  var coords = [
      {
        lng: 35.59540058516399,
        lat: 31.02111266189348,
      },
      {
        lng: 35.59310207023188,
        lat: 31.012612854723553,
      },
      {
        lng: 35.584129181722126,
        lat: 31.009262634916993,
      },
      {
        lng: 35.564517186930296,
        lat: 31.011935025267213,
      },
      {
        lng: 35.55098045108684,
        lat: 31.01261864659178,
      },
      {
        lng: 35.53093780845384,
        lat: 31.038071803762474,
      },
      {
        lng: 35.51186801725245,
        lat: 31.077120642821857,
      },
      {
        lng: 35.53301686163438,
        lat: 31.060372154304186,
      },
      {
        lng: 35.55617872669662,
        lat: 31.071001298767047,
      },
      {
        lng: 35.559680862571184,
        lat: 31.06853723538814,
      },
    ],
    currentCoordIndex = 0;

  // geolocate.use();

  // setInterval(function () {
  //   geolocate.change(coords[currentCoordIndex]);
  //   currentCoordIndex = (currentCoordIndex + 1) % coords.length;
  // }, 1500);
}
