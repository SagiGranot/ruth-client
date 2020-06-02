import { Component } from 'react';
import { loadModules } from 'esri-loader';
import { viewshedMarker } from '../markers/viewshed';
import { circleMarker } from '../markers/circle';
//import axios from 'axios';

import viewshedMocks1 from '../resources/mocks/viewshed-1.json';
import viewshedMocks2 from '../resources/mocks/viewshed-2.json';
import viewshedMocks3 from '../resources/mocks/viewshed-3.json';
import viewshedMocks4 from '../resources/mocks/viewshed-4.json';
import viewshedMocks5 from '../resources/mocks/viewshed-5.json';

import viewshedMocks6 from '../resources/mocks/viewsheds/viewshed-01.json';
import viewshedMocks7 from '../resources/mocks/viewsheds/viewshed-02.json';
import viewshedMocks8 from '../resources/mocks/viewsheds/viewshed-03.json';
import viewshedMocks9 from '../resources/mocks/viewsheds/viewshed-04.json';
import viewshedMocks10 from '../resources/mocks/viewsheds/viewshed-05.json';

var viewshedArr = [
  viewshedMocks10,
  viewshedMocks9,
  viewshedMocks8,
  viewshedMocks7,
  viewshedMocks6,
  viewshedMocks5,
  viewshedMocks4,
  viewshedMocks3,
  viewshedMocks2,
  viewshedMocks1,
];

// var viewshedArr = [viewshedMocks10, viewshedMocks9, viewshedMocks8, viewshedMocks7, viewshedMocks6];
var geolocate = require('mock-geolocation');

const gpUrl =
  'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed';

export class Viewshed extends Component {
  constructor() {
    super();
    this.esriModule = {};
    this.featureSet = {};
    this.vsDistance = {};
    this.deployLayer = {};
    this.graphicsLayer = {};
    this.gp = {};
    this.currUserPos = null;
    this.userCircleGraphic = null;
    this.userRadius = 3;
    this.viewshed = null;
    this.isEnemyHighlight = false;

    this.createUserCircleGraphic = this.createUserCircleGraphic.bind(this);
    this.getViewshedInsideCircle = this.getViewshedInsideCircle.bind(this);
    this.createGraphicContainer = this.createGraphicContainer.bind(this);
    this.createFeatureSet = this.createFeatureSet.bind(this);
    this.updateDeploys = this.updateDeploys.bind(this);
    this.getUserCircle = this.getUserCircle.bind(this);
    this.calcViewshed = this.calcViewshed.bind(this);
    this.queryEnemies = this.queryEnemies.bind(this);
    this.sendLocation = this.sendLocation.bind(this);
    this.drawViewshed = this.drawViewshed.bind(this);
    this.createDeployGraphic = this.createDeployGraphic.bind(this);
    this.queryByDeployId = this.queryByDeployId.bind(this);
    this.queryByObjectId = this.queryByObjectId.bind(this);
    this.highlightEnemyViewshed = this.highlightEnemyViewshed.bind(this);
    this.getUserCircleGraphic = this.getUserCircleGraphic.bind(this);
  }

  componentDidMount() {
    loadModules(
      [
        'esri/geometry/Point',
        'esri/geometry/Circle',
        'esri/geometry/Polyline',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/tasks/Geoprocessor',
        'esri/tasks/support/LinearUnit',
        'esri/tasks/support/FeatureSet',
        'esri/geometry/geometryEngine',
      ],
      { css: false }
    ).then(
      async ([
        Point,
        Circle,
        Polyline,
        Graphic,
        GraphicsLayer,
        Geoprocessor,
        LinearUnit,
        FeatureSet,
        geometryEngine,
      ]) => {
        this.esriModules = {
          Point,
          Circle,
          Polyline,
          Graphic,
          GraphicsLayer,
          Geoprocessor,
          LinearUnit,
          FeatureSet,
          geometryEngine,
        };
        this.deployLayer = this.props.view.map.allLayers.find((layer) => layer.title === 'deployments');
        this.graphicsLayer = new GraphicsLayer();
        this.props.view.map.add(this.graphicsLayer);
        this.props.socketio.on('SEND_LOCATION', this.updateDeploys);
        // this.props.view.on('click', this.sendLocation);
        this.props.view.on('click', this.highlightEnemyViewshed);
        const user = await this.queryCurrentUser();
        const [x, y] = this.props.Utils.lngLatToXY(
          user.features[0].geometry.longitude,
          user.features[0].geometry.latitude
        );
        this.currUserPos = {
          longitude: user.features[0].geometry.longitude,
          latitude: user.features[0].geometry.latitude,
          x,
          y,
        };

        this.gp = new Geoprocessor(gpUrl);
        this.gp.outSpatialReference = { wkid: 102100 };

        this.props.view.when(async () => {
          //update camera position to user current position
          geolocate.change({
            lng: this.currUserPos.longitude,
            lat: this.currUserPos.latitude,
          });

          //const { features: enemyDeploys } = await this.queryEnemies();
          //const result = await this.calcViewshed(enemyDeploys);
          this.userCircleGraphic = await this.getUserCircleGraphic();
          this.viewshed = viewshedArr[9];
          // const result = viewshedArr[9];
          await this.drawViewshed(this.viewshed);
        });
      }
    );
  }

  async queryEnemies() {
    const res = await this.deployLayer.queryFeatures({
      where: "deployType = 'Enemy'",
      outFields: ['*'],
      returnGeometry: true,
    });
    return res;
  }

  async queryByDeployId(deployId) {
    const res = await this.deployLayer.queryFeatures({
      where: `deployId = '${deployId}'`,
      outFields: ['*'],
      returnGeometry: true,
    });
    return res;
  }

  async queryByObjectId(objectId) {
    const { features } = await this.deployLayer.queryFeatures({
      where: `OBJECTID = ${objectId}`,
      outFields: ['*'],
      returnGeometry: true,
    });
    return features[0];
  }

  async queryCurrentUser() {
    const res = await this.deployLayer.queryFeatures({
      where: "tag = 'User'",
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference: { wkid: 102100 },
    });
    return res;
  }

  async updateDeployPosition(deploy) {
    const deployId = deploy.deployId;
    if (deployId == this.props.userId) {
      const lon = deploy.location.coordinates[0];
      const lat = deploy.location.coordinates[1];
      const [x, y] = this.props.Utils.lngLatToXY(lon, lat);
      this.currUserPos = {
        longitude: lon,
        latitude: lat,
        x,
        y,
      };
      this.userCircleGraphic = await this.getUserCircleGraphic();
    }

    let deployToUpdate = await this.queryByDeployId(deployId);
    //add new deploy feature to deploy layer
    if (deployToUpdate.features.length === 0) {
      const deployGraphic = this.createDeployGraphic(deploy);
      const edits = { addFeatures: [deployGraphic] };
      await this.deployLayer.applyEdits(edits);
      deployToUpdate = await this.queryByDeployId(deployId);
    }

    deployToUpdate = deployToUpdate.features[0];
    deployToUpdate.geometry['latitude'] = deploy.location.coordinates[1];
    deployToUpdate.geometry['longitude'] = deploy.location.coordinates[0];
    deployToUpdate.geometry['z'] = deploy.location.elevation;
    return deployToUpdate;
  }

  async updateDeploys(deploys) {
    try {
      const deploysToUpdate = await Promise.all(
        deploys.map(async (deploy) => {
          const deployUpdate = await this.updateDeployPosition(deploy);
          return deployUpdate;
        })
      );

      const edits = { updateFeatures: deploysToUpdate };
      //const { features: enemyDeploys } = await this.queryEnemies();
      const enemiesToUpdates = deploysToUpdate.filter((deploy) => deploy.attributes.deployType === 'Enemy');
      // const enemiesSet = uniqBy([...enemiesToUpdates, ...enemyDeploys], 'attributes.deployId');

      console.log('enemiesToUpdates.length ' + enemiesToUpdates.length);
      if (enemiesToUpdates.length > 0) {
        // viewshedToDraw = await this.calcViewshed(enemiesSet);
        this.viewshed = await this.calcViewshed(enemiesToUpdates);
      }

      await this.drawViewshed(this.viewshed);
      await this.deployLayer.applyEdits(edits);

      geolocate.change({
        lng: this.currUserPos.longitude,
        lat: this.currUserPos.latitude,
      });
    } catch (error) {
      console.log(error);
    }
  }

  createDeployGraphic(item) {
    return new this.esriModules.Graphic({
      geometry: {
        type: 'point',
        latitude: item.location.coordinates[1],
        longitude: item.location.coordinates[0],
      },
      attributes: { ...item },
    });
  }

  createGraphicContainer(items) {
    const graphics = items.map((i) => {
      let point = new this.esriModules.Point({
        latitude: i.geometry.latitude,
        longitude: i.geometry.longitude,
      });

      return new this.esriModules.Graphic({
        geometry: point,
        attributes: { deployId: i.attributes.deployId },
      });
    });
    return graphics;
  }

  async drawViewshed(items) {
    //this.userCircleGraphic = this.getUserCircleGraphic()
    const userCircle = await this.getUserCircle();
    //const userCircleGraphic = await this.createUserCircleGraphic(userCircle);
    //this.userCircleGraphic = await this.createUserCircleGraphic(userCircle);

    if (items) {
      //save viedshed inside user radius circle
      //const viewshedPoints = items[0].value.features;
      const viewshedPoints = items;
      viewshedPoints.forEach((viewshedPoint) => (viewshedPoint.geometry.type = 'polygon'));
      this.viewshed = this.getViewshedInsideCircle(viewshedPoints, userCircle);
      this.graphicsLayer.removeAll(); //remove prev viewshed from map
      this.graphicsLayer.addMany(this.viewshed);
    } else {
      this.graphicsLayer.removeAll(); //remove prev viewshed from map
    }
    this.graphicsLayer.add(this.userCircleGraphic);
    geolocate.change({
      lng: this.currUserPos.longitude,
      lat: this.currUserPos.latitude,
    });
  }

  async getUserCircle() {
    const { x, y } = this.currUserPos;
    const point = new this.esriModules.Point({
      x,
      y,
      spatialReference: { wkid: 102100, latestWkid: 3857 },
    });
    const userCircle = new this.esriModules.Circle({
      center: point,
      radius: 3000,
      spatialReference: { wkid: 102100, latestWkid: 3857 },
    });
    return userCircle;
  }

  createCutter(polygon) {
    const cutter = new this.esriModules.Polyline({
      paths: polygon.rings,
      spatialReference: { wkid: 102100, latestWkid: 3857 },
    });
    return cutter;
  }

  async createUserCircleGraphic(circle) {
    const circleGraphic = new this.esriModules.Graphic({
      geometry: circle,
      symbol: circleMarker,
    });
    return circleGraphic;
  }

  createFeatureSet(graphics) {
    var featureSet = new this.esriModules.FeatureSet();
    featureSet.features = graphics;

    var vsDistance = new this.esriModules.LinearUnit();
    vsDistance.distance = 10;
    vsDistance.units = 'kilometers';
    return {
      Input_Observation_Point: featureSet,
      Viewshed_Distance: vsDistance,
    };
  }

  getViewshedInsideCircle(viewshedPolygons = [], userCirclePolygon = {}) {
    const viewshedInCircle = [];
    const cutter = this.createCutter(userCirclePolygon);

    viewshedPolygons.forEach((polygon) => {
      if (this.esriModules.geometryEngine.contains(userCirclePolygon, polygon.geometry)) {
        polygon.symbol = viewshedMarker;
        polygon.geometry.type = 'polygon';
        viewshedInCircle.push(polygon);
      }

      if (this.esriModules.geometryEngine.intersects(userCirclePolygon, polygon.geometry)) {
        const result = this.esriModules.geometryEngine.cut(polygon.geometry, cutter);
        const _polygon = new this.esriModules.Graphic({
          geometry: result[1], // result of the viewshed cutting part that inside the circle
          symbol: viewshedMarker,
        });
        viewshedInCircle.push(_polygon);
      }
    });
    return viewshedInCircle;
  }

  async calcViewshed(features) {
    try {
      console.log('calling calcViewshed()...');
      // const inputGraphicContainer = this.createGraphicContainer(features);
      // const featureSet = this.createFeatureSet(inputGraphicContainer);

      // let stop = 0;
      // let result = {};
      // while (stop < 10) {
      //   try {
      //     result = await this.gp.execute(featureSet);
      //     stop = 10;
      //   } catch (error) {
      //     console.log('not get viewshed');
      //     stop++;
      //   }
      // }

      //pop viewshed
      let results = viewshedArr.pop();

      // if (process.env.REACT_APP_MOCK) {
      //   await axios.post('http://localhost:8081/save', { data: result.results[0].value.features });
      // }

      this.viewshed = results;
      // return result.results;
      return results;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async highlightEnemyViewshed(event) {
    this.props.view.hitTest(event.screenPoint).then(async ({ results = null }) => {
      const highlightObject =
        results && results[0] && results[0].graphic.attributes ? results[0].graphic.attributes : {};
      const isEnemyHighlight = results.length === 0 || highlightObject.deployType !== 'Enemy' ? false : true;

      if (isEnemyHighlight) {
        //show highlight enemy viewshed
        console.log('show highlight enemy viewshed...');
        const enemyDeploy = await this.queryByObjectId(highlightObject.OBJECTID);
        this.graphicsLayer.removeAll();
        this.graphicsLayer.addMany(viewshedArr[9]);
        this.graphicsLayer.add(this.userCircleGraphic);
        return;
      }
      //show viewshed inside circle if enemy is not highlight
      console.log('show user viewshed...');
      this.graphicsLayer.removeAll(); //remove prev viewshed from map
      this.graphicsLayer.addMany(this.viewshed);
      this.graphicsLayer.add(this.userCircleGraphic);
      return;
    });
  }

  async getUserCircleGraphic() {
    const userCircle = await this.getUserCircle();
    const userCircleGraphic = await this.createUserCircleGraphic(userCircle);
    return userCircleGraphic;
  }

  async sendLocation(event) {
    console.log(event.mapPoint);
  }

  render() {
    return null;
  }
}
