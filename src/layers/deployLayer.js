import { deployMarkers } from '../markers/deploy'

export const deployLayerOpt = {
  title: 'deployments',
  objectIdField: 'OBJECTID',
  geometryType: 'point',
  spatialReference: { wkid: 4326 },
  fields: [
    {
      name: 'deployType',
      alias: 'TYPE',
      type: 'string',
    },
    {
      name: 'additionalInfo',
      alias: 'INFO',
      type: 'string',
    },
    {
      name: 'totalAmount',
      alias: 'AMOUNT',
      type: 'string',
    },
    {
      name: 'deployId',
      alias: 'ID',
      type: 'string',
    },
    {
      name: 'reportingUserId',
      alias: 'Reporting User',
      type: 'string',
    },
  ],
  renderer: {
    type: 'unique-value',
    field: 'deployType',
    uniqueValueInfos: [deployMarkers.Friendly, deployMarkers.Enemy, deployMarkers.User],
  },
  labelingInfo: [deployMarkers.amountLabel],
  popupTemplate: deployMarkers.popupTemplate,
}
