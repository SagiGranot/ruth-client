import { Component } from 'react';
import { loadModules } from 'esri-loader';
import uniqBy from 'lodash.uniqby';
import { viewshedMarker } from '../markers/viewshed';
import { circleMarker } from '../markers/circle';
import axios from 'axios';
var geolocate = require('mock-geolocation');

// import viewshedMocks from '../resources/mocks/viewshed.json';

const USER_ID = 3;
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
    this.userRadius = 3;

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
    this.queryById = this.queryById.bind(this);
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
        this.props.view.on('click', this.sendLocation);

        this.gp = new Geoprocessor(gpUrl);
        this.gp.outSpatialReference = { wkid: 102100 };

        this.props.view.when(async () => {
          geolocate.use();
          const { features: enemyDeploys } = await this.queryEnemies();
          const result = await this.calcViewshed(enemyDeploys);
          await this.drawViewshed(result);
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

  async queryById(deployId) {
    const res = await this.deployLayer.queryFeatures({
      where: `deployId = '${deployId}'`,
      outFields: ['*'],
      returnGeometry: true,
    });
    return res;
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
    if (deployId === USER_ID) {
      this.currUserPos = {
        longitude: deploy.location.coordinates[0],
        latitude: deploy.location.coordinates[1],
      };
    }

    let deployToUpdate = await this.queryById(deployId);
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
      const { features: enemyDeploys } = await this.queryEnemies();
      const enemiesToUpdates = deploysToUpdate.filter((deploy) => deploy.attributes.deployType === 'Enemy');
      const enemiesSet = uniqBy([...enemiesToUpdates, ...enemyDeploys], 'attributes.deployId');
      const result = await this.calcViewshed(enemiesSet);
      await this.drawViewshed(result);
      await this.deployLayer.applyEdits(edits);
      geolocate.change({
        lng: this.currUserPos.longitude,
        lat: this.currUserPos.latitude,
      });
    } catch (error) {
      console.log(error);
    }
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
    const userCircle = await this.getUserCircle();
    const userCircleGraphic = await this.createUserCircleGraphic(userCircle);
    if (items) {
      const viewshedPoints = items[0].value.features;
      // const viewshedPoints = items;
      const viewshedInsideCircle = this.getViewshedInsideCircle(viewshedPoints, userCircle);
      this.graphicsLayer.removeAll(); //remove prev viewshed from map
      this.graphicsLayer.addMany(viewshedInsideCircle);
    } else {
      this.graphicsLayer.removeAll(); //remove prev viewshed from map
    }
    this.graphicsLayer.add(userCircleGraphic);
  }

  async getUserCircle() {
    const user = await this.queryCurrentUser();
    const { x, y } = this.currUserPos || user.features[0].geometry;
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
      const inputGraphicContainer = this.createGraphicContainer(features);
      const featureSet = this.createFeatureSet(inputGraphicContainer);
      const { results } = await this.gp.execute(featureSet);

      if (process.env.REACT_APP_MOCK) {
        await axios.post('http://localhost:8081/save', { data: results[0].value.features });
      }

      return results;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async sendLocation(event) {
    console.log(event.mapPoint);
  }

  render() {
    return null;
  }
}
