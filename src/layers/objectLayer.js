import { objectMarker } from '../markers/object';

export const objectLayerOpt = {
  title: 'objects',
  objectIdField: 'OBJECTID',
  geometryType: 'polygon',
  elevationInfo: { mode: 'relative-to-scene' },
  spatialReference: { wkid: 4326 },
  fields: [
    {
      name: 'objectType',
      alias: 'TYPE',
      type: 'string',
    },
    {
      name: 'height',
      alias: 'SIZE',
      type: 'integer',
    },
    {
      name: 'additionalInfo',
      alias: 'INFO',
      type: 'string',
    },
    {
      name: 'tag',
      alias: 'TAG',
      type: 'string',
    },
  ],
  renderer: {
    type: 'unique-value',
    field: 'objectType',
    visualVariables: [
      {
        type: 'size',
        axis: 'height', // specify which axis to apply the data values to
        field: 'height',
        valueUnit: 'feet',
      },
      {
        type: 'rotation',
        field: 'ROTATION',
      },
    ],
    uniqueValueInfos: [objectMarker.BuildingMarker],
  },
  // labelingInfo: [Marker.amountLabel],
};
