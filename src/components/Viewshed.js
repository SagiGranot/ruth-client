import { Component } from 'react';
import { loadModules } from 'esri-loader';
import { viewshedMarker } from '../markers/viewshed';

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

    this.createGraphicContainer = this.createGraphicContainer.bind(this);
    this.queryUnMoveEnemies = this.queryUnMoveEnemies.bind(this);
    this.queryEnemyById = this.queryEnemyById.bind(this);
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
      this.drawViewshed(result);
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
    this.drawViewshed(result);
  }

  drawViewshed(items) {
    const features = items.results[0].value.features;
    const viewshedGraphics = features.map((feature) => {
      feature.symbol = viewshedMarker;
      return feature;
    });
    this.graphicsLayer.removeAll(); //remove prev viewshed from map
    this.graphicsLayer.addMany(viewshedGraphics);
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
