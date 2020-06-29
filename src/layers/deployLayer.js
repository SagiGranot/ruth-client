import { deployMarkers } from '../markers/deploy';

export const deployLayerOpt = {
  title: 'deployments',
  objectIdField: 'OBJECTID',
  geometryType: 'point',
  spatialReference: { wkid: 4326 },
  fields: [
    {
      name: 'tag',
      alias: 'TAG',
      type: 'string',
    },
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
      name: 'amount',
      alias: 'AMOUNT',
      type: 'integer',
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
    field2: 'tag',
    fieldDelimiter: ', ',
    uniqueValueInfos: [
      deployMarkers.FriendlyTank,
      deployMarkers.FriendlyMissle,
      deployMarkers.FriendlyCar,
      deployMarkers.FriendlyTroop,
      deployMarkers.EnemyTank,
      deployMarkers.EnemyMissle,
      deployMarkers.EnemyCar,
      deployMarkers.EnemyTroop,
      // deployMarkers.User,
      deployMarkers.EnemyRPG,
      deployMarkers.FriendlyRPG,
      deployMarkers.EnemyHuman,
      deployMarkers.FriendlyHuman,
      deployMarkers.EnemyJeep,
      deployMarkers.FriendlyJeep,
    ],
  },
  labelingInfo: [deployMarkers.amountLabel],
  popupTemplate: deployMarkers.popupTemplate,
};
