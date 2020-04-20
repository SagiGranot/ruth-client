const ObjectsMarker = {
  BuildingMarker: {
    value: "Building",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "extrude",
          size: 0, // extrude by 10 meters
          material: {
            color: [255, 255, 255, 0.8],
          },
          edges: {
            type: "solid",
            size: "3px",
            color: [82, 82, 122, 0.9],
          },
        },
      ],
    },
  },
};

export { ObjectsMarker };
