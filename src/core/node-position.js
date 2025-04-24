/**
 * Calculates the positions of nodes in a circular layout.
 *
 * @param {number} nodeCount - The number of nodes to position.
 * @param {Object} config - The node configuration.
 * @returns {Array<{x: number, y: number}>} Array of position objects.
 */
export function calculateNodePositions(nodeCount, config) {
  const { centerX, centerY, radius } = config.layout;
  const positions = [];

  for (let i = 0; i < nodeCount; i++) {
    const angleDeg = 90 + (360 / nodeCount) * i;
    const angleRad = angleDeg * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY - radius * Math.sin(angleRad);
    positions.push({ x, y });
  }

  return positions;
}
