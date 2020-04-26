import { Component } from 'react';
import { loadModules } from 'esri-loader';
import { point, polygon } from '@turf/helpers';
import circle from '@turf/circle';
import uniqBy from 'lodash.uniqby';
import isPointInsidePolygon from '@turf/boolean-point-in-polygon';
import { viewshedMarker } from '../markers/viewshed';
import { circleMarker } from '../markers/circle';

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
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        'esri/tasks/Geoprocessor',
        'esri/tasks/support/LinearUnit',
        'esri/tasks/support/FeatureSet',
      ],
      { css: true }
    ).then(async ([Point, Graphic, GraphicsLayer, Geoprocessor, LinearUnit, FeatureSet]) => {
      this.esriModules = { Point, Graphic, GraphicsLayer, Geoprocessor, LinearUnit, FeatureSet };
      this.deployLayer = this.props.view.map.allLayers.find((layer) => layer.title === 'deployments');
      this.graphicsLayer = new GraphicsLayer();
      this.props.view.map.add(this.graphicsLayer);
      this.props.socketio.on('SEND_LOCATION', this.updateDeploys);

      this.props.view.on('click', this.sendLocation);

      this.gp = new Geoprocessor(gpUrl);
      this.gp.outSpatialReference = {
        wkid: 102100,
      };

      const { features: enemyDeploys } = await this.queryEnemies();
      const result = await this.calcViewshed(enemyDeploys);
      await this.drawViewshed(result);
    });
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
      where: "deployType = 'User'",
      outFields: ['*'],
      returnGeometry: true,
    });
    return res;
  }

  async updateDeployPosition(deploy) {
    const deployId = deploy.deployId;
    if (deployId === '3') {
      this.currUserPos = { longitude: deploy.location.coordinates[0], latitude: deploy.location.coordinates[1] };
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
    const viewshedPoints = items[0].value.features;
    const userCircle = await this.getUserCircle();
    const userCirclePolygon = polygon(userCircle.geometry.coordinates);
    const viewshedInsideCircle = this.getViewshedInsideCircle(viewshedPoints, userCirclePolygon);
    this.graphicsLayer.removeAll(); //remove prev viewshed from map
    const userCircleGraphic = await this.createUserCircleGraphic(userCircle);
    this.graphicsLayer.add(userCircleGraphic);
    this.graphicsLayer.addMany(viewshedInsideCircle);
  }

  async getUserCircle() {
    const user = await this.queryCurrentUser();
    const { longitude, latitude } = this.currUserPos || user.features[0].geometry;
    const center = [longitude, latitude];
    return circle(center, this.userRadius);
  }

  async createUserCircleGraphic(circle) {
    const circleGraphic = new this.esriModules.Graphic({
      geometry: {
        type: 'polygon',
        rings: circle.geometry.coordinates,
      },
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

  getViewshedInsideCircle(viewshedPoints, userCirclePolygon) {
    return viewshedPoints.filter((_point) => {
      const lon = _point.geometry.centroid.longitude;
      const lat = _point.geometry.centroid.latitude;
      const viewshedPoint = point([lon, lat]);
      let isInside = isPointInsidePolygon(viewshedPoint, userCirclePolygon);
      if (isInside) {
        _point.symbol = viewshedMarker;
        return _point;
      }
      return false;
    });
  }

  async calcViewshed(features) {
    const inputGraphicContainer = this.createGraphicContainer(features);
    const featureSet = this.createFeatureSet(inputGraphicContainer);
    const { results } = await this.gp.execute(featureSet);
    return results;
  }

  sendLocation(event) {
    console.log(event.mapPoint);
    // this.props.view.hitTest(event.screenPoint).then( response => {
    //   var graphics = response.results;
    //   if (!graphics.length) {
    //     const deploy = clone(Deploy);
    //     deploy.location.coordinates = [
    //       event.mapPoint.longitude,
    //       event.mapPoint.latitude
    //     ];
    //     deploy.location.elevation = event.mapPoint.z;
    //     this.socket.emit('SEND_LOCATION', deploy);
    //   }
    // });
  }

  render() {
    return null;
  }
}
