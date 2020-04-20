import { Marker } from "../resources/markers";
import { ObjectsMarker } from "../resources/objectsMarker";

export const objectLayerOpt = {
  title: "objects",
  objectIdField: "OBJECTID",
  geometryType: "polygon",
  elevationInfo: { mode: "relative-to-scene" },
  spatialReference: { wkid: 4326 },
  fields: [
    {
      name: "objectType",
      alias: "TYPE",
      type: "string",
    },
    {
      name: "height",
      alias: "SIZE",
      type: "string",
    },
    {
      name: "additionalInfo",
      alias: "INFO",
      type: "string",
    },
    {
      name: "reportingUserId",
      alias: "Reporting User",
      type: "string",
    },
    {
      name: "totalAmount",
      alias: "AMOUNT",
      type: "string",
    },
  ],
  renderer: {
    type: "unique-value",
    field: "objectType",
    visualVariables: [
      {
        type: "size",
        axis: "height", // specify which axis to apply the data values to
        field: "height",
        valueUnit: "feet",
      },
      {
        // rotation can be modified with the interactive handle
        type: "rotation",
        field: "ROTATION",
      },
    ],
    uniqueValueInfos: [ObjectsMarker.BuildingMarker],
  },
  // labelingInfo: [Marker.amountLabel],
  popupTemplate: Marker.popupTemplate,
};
