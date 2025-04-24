/**
 * Configuration for the node store, centralizing constants and defaults.
 */
const STORE_CONFIG = {
  moduleName: "my-elemental-module",
  defaults: {
    nodeCount: 3,
    nodeValue: 0,
    nodeFeature: null,
    nodeState: false,
    themeColor: "#00ffff", // Default theme color (cyan)
  },
};

/**
 * Generic helper to get a flag from an actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {string} key - The flag key to retrieve.
 * @param {any} defaultValue - The default value if the flag is not set.
 * @returns {Promise<any>} The flag value or the default.
 * @throws {Error} If actor is invalid.
 */
async function getFlag(actor, key, defaultValue = null) {
  if (!actor || typeof actor.getFlag !== "function") {
    throw new Error("Invalid actor provided");
  }
  return (await actor.getFlag(STORE_CONFIG.moduleName, key)) ?? defaultValue;
}

/**
 * Generic helper to set a flag on an actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {string} key - The flag key to set.
 * @param {any} value - The value to set.
 * @returns {Promise<void>}
 * @throws {Error} If actor is invalid.
 */
async function setFlag(actor, key, value) {
  if (!actor || typeof actor.setFlag !== "function") {
    throw new Error("Invalid actor provided");
  }
  await actor.setFlag(STORE_CONFIG.moduleName, key, value);
}

/**
 * Ensures an array matches the expected length, filling with a default value.
 *
 * @param {Array} array - The input array.
 * @param {number} length - The desired length.
 * @param {any} defaultValue - The default value to fill with.
 * @returns {Array} The resized array.
 */
function normalizeArray(array, length, defaultValue) {
  return Array(length)
    .fill(defaultValue)
    .map((def, index) => array[index] ?? def);
}

/**
 * Validates a node index against the node count.
 *
 * @param {number} nodeIndex - The index to validate.
 * @param {number} nodeCount - The total number of nodes.
 * @throws {Error} If the index is invalid.
 */
function validateNodeIndex(nodeIndex, nodeCount) {
  if (!Number.isInteger(nodeIndex) || nodeIndex < 0 || nodeIndex >= nodeCount) {
    throw new Error(
      `Invalid node index: ${nodeIndex}. Must be between 0 and ${nodeCount - 1}`
    );
  }
}

/**
 * Retrieve the stored node count for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<number>} The node count for the actor.
 */
export async function getNodeCount(actor) {
  return await getFlag(actor, "nodeCount", STORE_CONFIG.defaults.nodeCount);
}

/**
 * Set or update the node count for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {number} count - The number of nodes to store.
 * @returns {Promise<void>}
 */
export async function setNodeCount(actor, count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Invalid node count: ${count}. Must be a positive integer`);
  }
  await setFlag(actor, "nodeCount", count);
}

/**
 * Retrieve the stored node values for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<number[]>} The node values for the actor.
 */
export async function getNodeValues(actor) {
  const nodeCount = await getNodeCount(actor);
  const values = await getFlag(actor, "nodeValues", []);
  return normalizeArray(values, nodeCount, STORE_CONFIG.defaults.nodeValue);
}

/**
 * Set or update the value for a specific node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {number} nodeIndex - The index of the node to update.
 * @param {number} value - The value to set for the node.
 * @returns {Promise<void>}
 */
export async function setNodeValue(actor, nodeIndex, value) {
  const nodeCount = await getNodeCount(actor);
  validateNodeIndex(nodeIndex, nodeCount);

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid node value: ${value}. Must be a finite number`);
  }

  const values = await getNodeValues(actor);
  values[nodeIndex] = value;
  await setFlag(actor, "nodeValues", values);
}

/**
 * Retrieve the stored feature IDs for each node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<(string|null)[]>} The feature IDs for each node.
 */
export async function getNodeFeatures(actor) {
  const nodeCount = await getNodeCount(actor);
  const features = await getFlag(actor, "nodeFeatures", []);
  return normalizeArray(features, nodeCount, STORE_CONFIG.defaults.nodeFeature);
}

/**
 * Set or update the feature ID for a specific node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {number} nodeIndex - The index of the node to update.
 * @param {string|null} featureId - The ID of the feature to set (or null to clear).
 * @returns {Promise<void>}
 */
export async function setNodeFeature(actor, nodeIndex, featureId) {
  const nodeCount = await getNodeCount(actor);
  validateNodeIndex(nodeIndex, nodeCount);

  if (featureId !== null && typeof featureId !== "string") {
    throw new Error(
      `Invalid feature ID: ${featureId}. Must be a string or null`
    );
  }

  const features = await getNodeFeatures(actor);
  features[nodeIndex] = featureId;
  await setFlag(actor, "nodeFeatures", features);
}

/**
 * Retrieve the stored states (awakened/dormant) for each node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<boolean[]>} The states for each node (true = awakened, false = dormant).
 */
export async function getNodeStates(actor) {
  const nodeCount = await getNodeCount(actor);
  const states = await getFlag(actor, "nodeStates", []);
  return normalizeArray(states, nodeCount, STORE_CONFIG.defaults.nodeState);
}

/**
 * Set or update the state (awakened/dormant) for a specific node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {number} nodeIndex - The index of the node to update.
 * @param {boolean} isAwakened - The state to set (true = awakened, false = dormant).
 * @returns {Promise<void>}
 */
export async function setNodeState(actor, nodeIndex, isAwakened) {
  const nodeCount = await getNodeCount(actor);
  validateNodeIndex(nodeIndex, nodeCount);

  if (typeof isAwakened !== "boolean") {
    throw new Error(`Invalid state: ${isAwakened}. Must be a boolean`);
  }

  const states = await getNodeStates(actor);
  states[nodeIndex] = isAwakened;
  await setFlag(actor, "nodeStates", states);
}

/**
 * Retrieve the stored theme color for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<string>} The theme color in hex format (e.g., "#00ffff").
 */
export async function getThemeColor(actor) {
  return await getFlag(actor, "themeColor", STORE_CONFIG.defaults.themeColor);
}

/**
 * Set or update the theme color for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {string} color - The color in hex format (e.g., "#00ffff").
 * @returns {Promise<void>}
 */
export async function setThemeColor(actor, color) {
  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    throw new Error(
      `Invalid color: ${color}. Must be a hex color (e.g., "#00ffff")`
    );
  }
  await setFlag(actor, "themeColor", color);
}
