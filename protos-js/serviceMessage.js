module.exports = {
    options: {
      "(.android.msg_privacy).dest": "DEST_AUTOMATIC"
    },
    fields: {
      policy: {
        type: "WindowManagerPolicyProto",
        id: 1
      },
      rootWindowContainer: {
        type: "RootWindowContainerProto",
        id: 2
      },
      focusedWindow: {
        type: "IdentifierProto",
        id: 3
      },
      focusedApp: {
        type: "string",
        id: 4
      },
      inputMethodWindow: {
        type: "IdentifierProto",
        id: 5
      },
      displayFrozen: {
        type: "bool",
        id: 6
      },
      rotation: {
        type: "int32",
        id: 7
      },
      lastOrientation: {
        type: "int32",
        id: 8
      }
    }
  }