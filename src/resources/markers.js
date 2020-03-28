const Marker = {
  Enemy: {
    type: "simple-marker",
    color: [255, 0, 0],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  },
  Friend: {
    type: "simple-marker",
    color: [0, 255, 128],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  },
  friendly: {
    type: "simple-marker",
    color: [0, 255, 128],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  },
  amountLabel: {
    symbol: {
      type: "text",
      color: "white",
      haloColor: "black",
      haloSize: "4px",
      text: "You are here",
      font: {
        size: 13,
        family: "Josefin Slab"
      }
    },
    labelPlacement: "center-right",
    labelExpressionInfo: {
      expression: "$feature.totalAmount"
    }
  },
  FriendlyMarker: {
    value: "Friendly",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          resource: {
            href: "https://image.flaticon.com/icons/svg/1693/1693487.svg"
          },
          size: 36
        }
      ]
    }
  },
  EnemyMarker: {
    value: "Enemy",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 100,
          height: 100,
          resource: {
            href: "https://i.imgur.com/UPDzknj.png"
          },
          size: 36
        }
      ]
    }
  },
  meMarker: {
    value: "me",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 60,
          height: 60,
          resource: {
            // href: 'https://i.imgur.com/NowMtcF.png'
            href: "https://i.imgur.com/lb9cyRR.png"
          },
          size: 32
        }
      ]
    }
  },
  popupTemplate: {
    title: "{deployType}",
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "deployId",
            label: "Deploy Id"
          },
          {
            fieldName: "additionalInfo",
            label: "Description"
          },
          {
            fieldName: "reportingUserId",
            label: "Reporting User"
          }
        ]
      }
    ]
  },
  fillSymbol: {
    type: "simple-fill",
    color: [255, 0, 0, 0.4],
    outline: {
      color: [255, 255, 255, 0.0],
      width: 0
    }
  }
};

export { Marker };
