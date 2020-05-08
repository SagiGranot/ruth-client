const deployMarkers = {
  FriendlyTank: {
    value: "Friendly, Tank",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 200,
          height: 200,
          resource: {
            // origin:
            href: "https://i.imgur.com/qT34iLD.png",
            //href: "https://i.imgur.com/fri8Mo0.png",
          },
          size: 40,
        },
      ],
      styleOrigin: {
        styleName: "EsriRecreationStyle",
        name: "Slide",
      },
    },
  },
  EnemyTank: {
    value: "Enemy, Tank",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 100,
          height: 100,
          resource: {
            href: "https://i.imgur.com/JmcioEL.png",
          },
          size: 40,
        },
      ],
    },
  },
  User: {
    value: "Friendly, User",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 60,
          height: 60,
          resource: {
            href: "https://i.imgur.com/lb9cyRR.png",
          },
          size: 32,
        },
      ],
    },
  },
  EnemyRPG: {
    value: "Enemy, RPG",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 100,
          height: 100,
          resource: {
            href: "https://i.imgur.com/qmGNgjB.png",
          },
          size: 70,
        },
      ],
    },
  },
  FriendlyRPG: {
    value: "Friendly, RPG",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 100,
          height: 100,
          resource: {
            href: "https://i.imgur.com/KC6FhVG.png",
          },
          size: 70,
        },
      ],
    },
  },
  FriendlyHuman: {
    value: "Friendly, Human",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 100,
          height: 100,
          resource: {
            href: "https://i.imgur.com/oU24X3Y.png",
          },
          size: 80,
        },
      ],
    },
  },
  EnemyHuman: {
    value: "Enemy, Human",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 100,
          height: 100,
          resource: {
            href: "https://i.imgur.com/PSp774f.png",
          },
          size: 80,
        },
      ],
    },
  },
  EnemyJeep: {
    value: "Enemy, Jeep",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 100,
          height: 100,
          resource: {
            href: "https://i.imgur.com/Bt0clWa.png",
          },
          size: 80,
        },
      ],
    },
  },
  FriendlyJeep: {
    value: "Friendly, Jeep",
    symbol: {
      type: "point-3d",
      symbolLayers: [
        {
          type: "icon",
          anchor: "center",
          width: 100,
          height: 100,
          resource: {
            href: "https://i.imgur.com/fri8Mo0.png",
          },
          size: 80,
        },
      ],
    },
  },

  popupTemplate: {
    title: "{deployType}",
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "deployId",
            label: "Deploy Id",
          },
          {
            fieldName: "additionalInfo",
            label: "Description",
          },
          {
            fieldName: "reportingUserId",
            label: "Reporting User",
          },
        ],
      },
    ],
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
        family: "Josefin Slab",
      },
    },
    labelPlacement: "center-right",
    labelExpressionInfo: {
      expression: "$feature.amount",
    },
  },
  fillSymbol: {
    type: "simple-fill",
    color: [255, 0, 0, 0.4],
    outline: {
      color: [255, 255, 255, 0.0],
      width: 0,
    },
  },
};

export { deployMarkers };
