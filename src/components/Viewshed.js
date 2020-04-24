import { Component } from 'react';
import { loadModules } from 'esri-loader';
import { point, polygon } from '@turf/helpers';
import calcCircle from '@turf/circle';
import isPointInsidePolygin from '@turf/boolean-point-in-polygon';
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
    this.userRadius = 3;

    this.createGraphicContainer = this.createGraphicContainer.bind(this);
    this.queryUnMoveEnemies = this.queryUnMoveEnemies.bind(this);
    this.queryEnemyById = this.queryEnemyById.bind(this);
    this.getUserCircle = this.getUserCircle.bind(this);
    this.createUserCircleGraphic = this.createUserCircleGraphic.bind(this);
    this.queryEnemies = this.queryEnemies.bind(this);
    // this.computeViewshed = this.computeViewshed.bind(this);
    this.sendLocation = this.sendLocation.bind(this);
    this.updateDeploy = this.updateDeploy.bind(this);
    this.drawViewshed = this.drawViewshed.bind(this);
    this.updateViewshed = this.updateViewshed.bind(this);
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

      this.gp = new Geoprocessor(gpUrl);
      this.gp.outSpatialReference = {
        wkid: 102100,
      };

      const { features: enemyDeploys } = await this.queryEnemies();
      const inputGraphicContainer = this.createGraphicContainer(enemyDeploys);

      var featureSet = new this.esriModules.FeatureSet();
      featureSet.features = inputGraphicContainer;

      var vsDistance = new this.esriModules.LinearUnit();
      vsDistance.distance = 10;
      vsDistance.units = 'kilometers';

      var params = {
        Input_Observation_Point: featureSet,
        Viewshed_Distance: vsDistance,
      };
      const result = await this.gp.execute(params);
      await this.drawViewshed(result);
      this.props.socketio.on('SEND_LOCATION', this.updateDeploy);
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

  async queryUnMoveEnemies(deployId) {
    const res = await this.deployLayer.queryFeatures({
      where: `deployType = 'Enemy' AND deployId <> '${deployId}'`,
      outFields: ['*'],
      returnGeometry: true,
    });
    return res;
  }

  async queryEnemyById(enemyId) {
    const res = await this.deployLayer.queryFeatures({
      where: `deployId = '${enemyId}'`,
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

  async updateDeploy(deploy) {
    try {
      const deployId = deploy.deployId;
      let deployToUpdate = await this.queryEnemyById(deployId);
      deployToUpdate = deployToUpdate.features[0];
      deployToUpdate.geometry['latitude'] = deploy.location.coordinates[1];
      deployToUpdate.geometry['longitude'] = deploy.location.coordinates[0];
      deployToUpdate.geometry['z'] = deploy.location.elevation;
      const edits = { updateFeatures: [deployToUpdate] };

      if (deploy.deployType === 'Enemy') {
        const { features: enemyDeploys } = await this.queryUnMoveEnemies(deployId);
        const inputGraphicContainer = this.createGraphicContainer([...enemyDeploys, deployToUpdate]);
        await this.updateViewshed(inputGraphicContainer);
      }
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

  async updateViewshed(inputGraphicContainer) {
    const featureSet = new this.esriModules.FeatureSet();
    featureSet.features = inputGraphicContainer;

    const vsDistance = new this.esriModules.LinearUnit();
    vsDistance.distance = 10;
    vsDistance.units = 'kilometers';

    var params = {
      Input_Observation_Point: featureSet,
      Viewshed_Distance: vsDistance,
    };

    const result = await this.gp.execute(params);
    await this.drawViewshed(result);
  }

  async drawViewshed(items) {
    const userCircle = await this.getUserCircle();
    const circlePolygon = polygon(userCircle.geometry.coordinates);

    const features = items.results[0].value.features;
    const viewshedGraphics = features.filter((feature) => {
      const lon = feature.geometry.centroid.longitude;
      const lat = feature.geometry.centroid.latitude;
      const viewshedPoint = point([lon, lat]);
      let result = isPointInsidePolygin(viewshedPoint, circlePolygon);
      if (result) {
        feature.symbol = viewshedMarker;
        return feature;
      }
      return false;
    });
    this.graphicsLayer.removeAll(); //remove prev viewshed from map
    const userCircleGraphic = await this.createUserCircleGraphic();
    this.graphicsLayer.add(userCircleGraphic);
    this.graphicsLayer.addMany(viewshedGraphics);
  }

  async getUserCircle() {
    const user = await this.queryCurrentUser();
    const { longitude, latitude } = user.features[0].geometry;
    const center = [longitude, latitude];
    return calcCircle(center, this.userRadius);
  }

  async createUserCircleGraphic() {
    const circle = await this.getUserCircle();
    const circleGraphic = new this.esriModules.Graphic({
      geometry: {
        type: 'polygon',
        rings: circle.geometry.coordinates,
      },
      symbol: circleMarker,
    });
    return circleGraphic;
  }

  sendLocation(event) {
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
