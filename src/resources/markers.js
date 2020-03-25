const Marker = {
  Enemy: {
    type: 'simple-marker',
    color: [255, 0, 0],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  },
  Friend: {
    type: 'simple-marker',
    color: [0, 255, 128],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  },
  friendly: {
    type: 'simple-marker',
    color: [0, 255, 128],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
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
        family: 'Josefin Slab'
      }
    },
    labelPlacement: 'center-right',
    labelExpressionInfo: {
      expression: '$feature.totalAmount'
    }
  },
  FriendlyMarker: {
    value: 'Friendly',
    symbol: {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'icon',
          anchor: 'center',
          resource: {
            href: 'https://image.flaticon.com/icons/svg/1693/1693487.svg'
          },
          size: 48
        }
      ]
    }
  },
  EnemyMarker: {
    value: 'Enemy',
    symbol: {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'icon',
          anchor: 'center',
          width:100,
          height:100,
          resource: {
            href: 'https://i.imgur.com/UPDzknj.png'
          },
          size: 48
        }
      ]
    }
  },
  meMarker: {
    value: 'me',
    symbol: {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'icon',
          anchor: 'center',
          width:100,
          height:100,
          resource: {
            href: 'https://i.imgur.com/NowMtcF.png'
          },
          size: 48
        }
      ]
    }
  },
  popupTemplate: {
    title: '{deployType}',
    content: [
      {
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'additionalInfo',
            label: 'Description'
          }
        ]
      }
    ]
  },
  fillSymbol: {
    type: "simple-fill",
    color: [255, 0, 0, 0.40],
    outline: {
      color: [255, 255, 255, 0.00],
      width: 0
    }
  }
};

export { Marker };
