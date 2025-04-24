/**
 * Generates the node configuration with a dynamic theme color.
 *
 * @param {string} themeColor - The theme color in hex format.
 * @returns {Object} The node configuration.
 */
export function getNodeConfig(themeColor) {
  return {
    layout: {
      centerX: 200,
      centerY: 200,
      radius: 180,
    },
    vortex: {
      circleCount: 25,
      minPos: 35,
      posRange: 25,
      maxSize: 170,
      sizeStep: 3,
    },
    animation: {
      durationMs: 500,
    },
    styles: {
      defaultNode: {
        background: "radial-gradient(circle at center, rgba(0, 255, 255, 0.2), transparent)",
        border: `4px solid ${themeColor}`,
        boxShadow: `0 0 20px ${themeColor}, 0 0 40px ${themeColor} inset`,
      },
      featureNode: {
        border: "none",
        boxShadow: `0 0 20px ${themeColor}`,
      },
      input: {
        border: "none",
        background: "none",
        textAlign: "center",
        fontSize: "13px",
        padding: "0",
        outline: "none",
        width: "30px",
        height: "30px",
        fontWeight: "bold",
        fontFamily: "Arial, sans-serif",
        pointerEvents: "auto",
        textShadow: "0 0 5px black",
        transition: "border-color 0.3s",
      },
      node: {
        width: "160px",
        height: "160px",
        borderRadius: "50%",
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        transform: "translate(-50%, -50%)",
      },
    },
  };
}
