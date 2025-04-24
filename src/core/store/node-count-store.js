import { STORE_CONFIG, getFlag, setFlag } from "./store-config.js";

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
