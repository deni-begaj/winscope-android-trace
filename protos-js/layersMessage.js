module.exports = {
    fields: {
      layers: {
        rule: "repeated",
        type: "LayerProto",
        id: 1
      },
      resolution: {
        type: "SizeProto",
        id: 2
      },
      colorMode: {
        type: "string",
        id: 3
      },
      colorTransform: {
        type: "string",
        id: 4
      },
      globalTransform: {
        type: "int32",
        id: 5
      }
    }
  }