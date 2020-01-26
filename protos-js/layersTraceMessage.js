module.exports = {
    fields: {
      magicNumber: {
        type: "fixed64",
        id: 1
      },
      entry: {
        rule: "repeated",
        type: "LayersTraceProto",
        id: 2
      }
    },
    nested: {
      MagicNumber: {
        values: {
          INVALID: 0,
          MAGIC_NUMBER_L: 1414682956,
          MAGIC_NUMBER_H: 1162035538
        }
      }
    }
  }