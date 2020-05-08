import objectSchema from './GeoObject.json';
import { saveGeoObject } from '../api/saveGeoObject';
const clone = require('rfdc')();
let geoObject = clone(objectSchema);

class GeoObject {
  constructor(attributes, rings) {
    console.log('create new object');
    this.geoObject = geoObject;
    this.geoObject.objectId = attributes.objectId;
    this.geoObject.location.elevation = attributes.height;
    this.geoObject.height = attributes.height;
    this.geoObject.additionalInfo = attributes.additionalInfo;
    this.geoObject.location.coordinates[0] = rings;
  }

  save() {
    saveGeoObject(this.geoObject);
  }
}

export default GeoObject;
