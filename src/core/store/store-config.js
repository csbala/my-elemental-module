/**
 * Configuration for the node store, centralizing constants and defaults.
 */
export const STORE_CONFIG = {
  moduleName: "my-elemental-module",
  defaults: {
    nodeCount: 3,
    nodeValue: 0,
    nodeFeature: null,
    nodeState: false,
    themeColor: "#00ffff",
    nodeCorrupted: false, // Default corruption state (false = not corrupted)
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
export async function getFlag(actor, key, defaultValue = null) {
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
export async function setFlag(actor, key, value) {
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
export function normalizeArray(array, length, defaultValue) {
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
export function validateNodeIndex(nodeIndex, nodeCount) {
  if (!Number.isInteger(nodeIndex) || nodeIndex < 0 || nodeIndex >= nodeCount) {
    throw new Error(`Invalid node index: ${nodeIndex}. Must be between 0 and ${nodeCount - 1}`);
  }
}
