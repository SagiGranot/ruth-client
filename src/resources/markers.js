const Marker = {
  Enemy :{
    type: "simple-marker",
    color: [255, 0, 0],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  },
  Friend :{
    type: "simple-marker",
    color: [0, 255, 128],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  },
  friendly :{
    type: "simple-marker",
    color: [0, 255, 128],
    outline: {
      color: [255, 255, 255],
      width: 2
    }
  }
}

export {Marker};