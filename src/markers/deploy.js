const deployMarkers = {
  Friendly: {
    value: 'Friendly',
    symbol: {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'icon',
          anchor: 'center',
          resource: {
            href: 'https://i.imgur.com/qT34iLD.png',
          },
          size: 36,
        },
      ],
      styleOrigin: {
        styleName: 'EsriRecreationStyle',
        name: 'Slide',
      },
    },
  },
  Enemy: {
    value: 'Enemy',
    symbol: {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'icon',
          anchor: 'center',
          width: 100,
          height: 100,
          resource: {
            href: 'https://i.imgur.com/JmcioEL.png',
          },
          size: 36,
        },
      ],
    },
  },
  User: {
    value: 'User',
    symbol: {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'icon',
          anchor: 'center',
          width: 60,
          height: 60,
          resource: {
            href: 'https://i.imgur.com/lb9cyRR.png',
          },
          size: 32,
        },
      ],
    },
  },
  popupTemplate: {
    title: '{deployType}',
    content: [
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'deployId',
            label: 'Deploy Id',
          },
          {
            fieldName: 'additionalInfo',
            label: 'Description',
          },
          {
            fieldName: 'reportingUserId',
            label: 'Reporting User',
          },
        ],
      },
    ],
  },
  amountLabel: {
    symbol: {
      type: 'text',
      color: 'white',
      haloColor: 'black',
      haloSize: '4px',
      text: 'You are here',
      font: {
        size: 13,
        family: 'Josefin Slab',
      },
    },
    labelPlacement: 'center-right',
    labelExpressionInfo: {
      expression: '$feature.totalAmount',
    },
  },
  fillSymbol: {
    type: 'simple-fill',
    color: [255, 0, 0, 0.4],
    outline: {
      color: [255, 255, 255, 0.0],
      width: 0,
    },
  },
}

export { deployMarkers }
