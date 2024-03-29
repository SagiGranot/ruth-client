import { Component } from 'react';
import { loadModules } from 'esri-loader';

export class ObjectEditor extends Component {
  constructor() {
    super();
    this.setObjectsSuspicious = this.setObjectsSuspicious.bind(this);
    this.setBuildingRisk = this.setBuildingRisk.bind(this);
    this.queryObjectById = this.queryObjectById.bind(this);
  }
  componentDidMount() {
    loadModules(['esri/widgets/Editor', 'esri/widgets/Expand'], {
      css: false,
    }).then(([Editor, Expand]) => {
      this.props.view.when(() => {
        this.props.socketio.on('SUSPECT-BUILDING', this.setObjectsSuspicious); //deprecated
        this.props.socketio.on('SUSPECT_BUILDINGS', this.setBuildingRisk);
        this.objectsLayer = this.props.view.map.allLayers.find((layer) => layer.title === 'objects');

        // this.props.view.popup.autoOpenEnabled = false;
        const editor = new Editor({
          view: this.props.view,
        });

        const expand = new Expand({
          expandTooltip: 'Expand object editor widget',
          view: this.props.view,
          content: editor,
          expanded: false,
        });

        this.props.view.ui.add(expand, 'top-right');
      });
    });
  }

  async setObjectsSuspicious(objectsId) {
    const objects = await this.queryObjectById(objectsId);
    objects.forEach((obj) => (obj.attributes.tag = 'Suspicious'));
    const edits = { updateFeatures: objects };
    await this.objectsLayer.applyEdits(edits);
  }

  async setBuildingRisk(buildings) {
    const buildingsId = buildings.map((building) => building.objectId);
    const objects = await this.queryObjectById(buildingsId);
    objects.forEach((obj) => {
      const bld = buildings.find((build) => build.objectId === obj.attributes.buildingId);
      obj.attributes.tag = bld.riskLevel;
    });
    const edits = { updateFeatures: objects };
    await this.objectsLayer.applyEdits(edits);
  }

  async queryObjectById(objectsId) {
    const objectIds = objectsId.map((i) => `'${i}'`);
    const res = await this.objectsLayer.queryFeatures({
      where: `buildingId IN (${objectIds})`,
      outFields: ['*'],
      returnGeometry: true,
    });
    return res.features;
  }

  render() {
    return null;
  }
}
