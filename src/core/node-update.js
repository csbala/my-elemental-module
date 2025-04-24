import { styleNodeWithFeature } from "./node-styling.js";
import { attachNodeHandlers } from "./node-handlers.js";

/**
 * Updates an existing node's position, value, feature, state, and corruption.
 *
 * @param {HTMLElement} node - The node element to update.
 * @param {number} index - The index of the node.
 * @param {Object} position - The new position {x, y}.
 * @param {number} value - The node's value.
 * @param {string|null} featureId - The feature ID for the node.
 * @param {boolean} isAwakened - The node's state (true = awakened, false = dormant).
 * @param {boolean} isCorrupted - The node's corruption state (true = corrupted, false = not corrupted).
 * @param {Object} app - The character sheet application.
 * @param {Object} callbacks - Callback functions for drag-and-drop and state toggle.
 * @param {Object} config - The node configuration.
 */
export function updateExistingNode(node, index, position, value, featureId, isAwakened, isCorrupted, app, callbacks, config) {
  node.style.left = `${position.x}px`;
  node.style.top = `${position.y}px`;

  const input = node.querySelector("input");
  if (input) {
    input.value = value ?? 0;
    input.dataset.nodeIndex = index;
    input.disabled = !isAwakened; // Disable input if node is dormant
  }

  const featureName = styleNodeWithFeature(node, featureId, app, config);

  let nameElement = node.querySelector(".element-name");
  if (!nameElement) {
    nameElement = document.createElement("span");
    nameElement.classList.add("element-name");
    node.appendChild(nameElement);
  }
  nameElement.textContent = featureName;

  node.classList.toggle("node-dormant", !isAwakened);
  node.classList.toggle("node-corrupted", isCorrupted);

  attachNodeHandlers(node, index, app, callbacks.onFeatureDrop, callbacks.onFeatureRemove, callbacks.onStateToggle);
}
