import { getNodeConfig } from "./node-config.js";
import { generateVortexCircles } from "./vortex-circles.js";
import { calculateNodePositions } from "./node-position.js";
import { updateExistingNode } from "./node-update.js";
import { createNewNode } from "./node-create.js";

/**
 * Dynamically generates and positions visual nodes in a circular layout around a central point.
 *
 * @function createTriangleNodes
 * @param {HTMLElement} container - The DOM element that will contain the circular node layout.
 * @param {number} nodeCount - The number of nodes to generate and arrange around the center.
 * @param {number[]} nodeValues - The values for each node (default to 0 if not provided).
 * @param {string|null[]} nodeFeatures - The feature IDs for each node (null if no feature).
 * @param {boolean[]} nodeStates - The states for each node (true = awakened, false = dormant).
 * @param {boolean[]} nodeCorruptedStates - The corruption states for each node (true = corrupted, false = not corrupted).
 * @param {number} previousNodeCount - The previous number of nodes for animation purposes.
 * @param {string} themeColor - The theme color in hex format.
 * @param {Object} options - Additional options.
 * @param {Object} options.app - The character sheet application.
 * @param {Function} options.onFeatureDrop - Callback when a feature is dropped onto a node.
 * @param {Function} options.onFeatureRemove - Callback when a feature is dragged out of a node.
 * @param {Function} options.onStateToggle - Callback when a node's state is toggled.
 */
export function createTriangleNodes(container, nodeCount, nodeValues = [], nodeFeatures = [], nodeStates = [], nodeCorruptedStates = [], previousNodeCount = 0, themeColor, { app, onFeatureDrop, onFeatureRemove, onStateToggle } = {}) {
  const config = getNodeConfig(themeColor);
  const existingNodes = Array.from(container.querySelectorAll(".circle:not(.center)"));
  const existingNodeCount = existingNodes.length;

  if (nodeCount < existingNodeCount) {
    for (let i = nodeCount; i < existingNodeCount; i++) {
      existingNodes[i].classList.add("node-remove");
    }
    setTimeout(() => {
      existingNodes.slice(nodeCount).forEach((node) => node.remove());
    }, config.animation.durationMs);
  }

  const vortexCircles = container.querySelector(".vortex-circles");
  generateVortexCircles(vortexCircles, themeColor);

  const newPositions = calculateNodePositions(nodeCount, config);

  const callbacks = { onFeatureDrop, onFeatureRemove, onStateToggle };
  for (let i = 0; i < Math.min(nodeCount, existingNodeCount); i++) {
    updateExistingNode(existingNodes[i], i, newPositions[i], nodeValues[i], nodeFeatures[i] || null, nodeStates[i] || false, nodeCorruptedStates[i] || false, app, callbacks, config);
  }

  if (nodeCount > existingNodeCount) {
    for (let i = existingNodeCount; i < nodeCount; i++) {
      const newNode = createNewNode(i, newPositions[i], nodeValues[i], nodeFeatures[i] || null, nodeStates[i] || false, nodeCorruptedStates[i] || false, app, callbacks, config);
      container.appendChild(newNode);
    }
  }
}
