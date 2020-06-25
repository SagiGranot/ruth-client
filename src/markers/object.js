const objectMarker = {
  BuildingMarker: {
    value: 'Building',
    symbol: {
      type: 'polygon-3d',
      symbolLayers: [
        {
          type: 'extrude',
          size: 0, // extrude by 10 meters
          material: {
            color: [255, 255, 255, 0.8],
          },
          edges: {
            type: 'solid',
            size: '3px',
            color: [82, 82, 122, 0.9],
          },
        },
      ],
    },
  },
  SuspiciousMarker: {
    value: 'Suspicious',
    symbol: {
      type: 'polygon-3d',
      symbolLayers: [
        {
          type: 'extrude',
          size: 0, // extrude by 10 meters
          material: {
            color: [255, 0, 0, 0.8],
          },
          edges: {
            type: 'solid',
            size: '3px',
            color: [82, 82, 122, 0.9],
          },
        },
      ],
    },
  },

  popupTemplate: {
    title: '{category}',
    content: [
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'objectId',
            label: 'Building Id',
          },
          {
            fieldName: 'height',
            label: 'Height',
          },
          {
            fieldName: 'additionalInfo',
            label: 'Description',
          },
          {
            fieldName: 'tag',
            label: 'Tag',
          },
          {
            fieldName: 'deploys',
            label: 'Enemies inside',
          },
        ],
      },
    ],
  },
};

export { objectMarker };
