import { STORE_CONFIG, getFlag, setFlag, normalizeArray, validateNodeIndex } from "./store-config.js";
import { getNodeCount } from "./node-count-store.js";

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
