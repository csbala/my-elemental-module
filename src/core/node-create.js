import { styleNodeWithFeature } from "./node-styling.js";
import { attachNodeHandlers } from "./node-handlers.js";

/**
 * Creates a new node with the given properties.
 *
 * @param {number} index - The index of the node.
 * @param {Object} position - The position {x, y} of the node.
 * @param {number} value - The node's value.
 * @param {string|null} featureId - The feature ID for the node.
 * @param {boolean} isAwakened - The node's state (true = awakened, false = dormant).
 * @param {boolean} isCorrupted - The node's corruption state (true = corrupted, false = not corrupted).
 * @param {Object} app - The character sheet application.
 * @param {Object} callbacks - Callback functions for drag-and-drop and state toggle.
 * @param {Object} config - The node configuration.
 * @returns {HTMLElement} The created node element.
 */
export function createNewNode(index, position, value, featureId, isAwakened, isCorrupted, app, callbacks, config) {
  const node = document.createElement("div");
  node.classList.add("circle", `node-${index + 1}`, "node-create");

  Object.assign(node.style, config.styles.node, {
    left: `${position.x}px`,
    top: `${position.y}px`,
  });

  const featureName = styleNodeWithFeature(node, featureId, app, config);

  if (!isAwakened) {
    node.classList.add("node-dormant");
  }
  if (isCorrupted) {
    node.classList.add("node-corrupted");
  }

  const input = document.createElement("input");
  input.type = "number";
  Object.assign(input.style, config.styles.input);
  input.value = value ?? 0;
  input.dataset.nodeIndex = index;
  input.disabled = !isAwakened; // Disable input if node is dormant

  const nameElement = document.createElement("span");
  nameElement.classList.add("element-name");
  nameElement.textContent = featureName;

  node.appendChild(input);
  node.appendChild(nameElement);

  attachNodeHandlers(node, index, app, callbacks.onFeatureDrop, callbacks.onFeatureRemove, callbacks.onStateToggle);

  return node;
}
