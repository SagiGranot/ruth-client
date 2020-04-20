import { Marker } from "../resources/markers";

export const deployLayerOpt = {
  title: "deployments",
  objectIdField: "OBJECTID",
  geometryType: "point",
  spatialReference: { wkid: 4326 },
  fields: [
    {
      name: "deployType",
      alias: "TYPE",
      type: "string",
    },
    {
      name: "additionalInfo",
      alias: "INFO",
      type: "string",
    },
    {
      name: "totalAmount",
      alias: "AMOUNT",
      type: "string",
    },
    {
      name: "deployId",
      alias: "ID",
      type: "string",
    },
    {
      name: "reportingUserId",
      alias: "Reporting User",
      type: "string",
    },
  ],
  renderer: {
    type: "unique-value",
    field: "deployType",
    uniqueValueInfos: [
      Marker.FriendlyMarker,
      Marker.EnemyMarker,
      Marker.meMarker,
    ],
  },
  labelingInfo: [Marker.amountLabel],
  popupTemplate: Marker.popupTemplate,
};
