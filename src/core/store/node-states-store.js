import { STORE_CONFIG, getFlag, setFlag, normalizeArray, validateNodeIndex } from "./store-config.js";
import { getNodeCount } from "./node-count-store.js";

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
