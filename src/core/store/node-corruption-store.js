import { STORE_CONFIG, getFlag, setFlag, normalizeArray, validateNodeIndex } from "./store-config.js";
import { getNodeCount } from "./node-count-store.js";

/**
 * Retrieve the stored corruption states for each node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<boolean[]>} The corruption states for each node (true = corrupted, false = not corrupted).
 */
export async function getNodeCorruptionStates(actor) {
  const nodeCount = await getNodeCount(actor);
  const corruptedStates = await getFlag(actor, "nodeCorruptedStates", []);
  return normalizeArray(corruptedStates, nodeCount, STORE_CONFIG.defaults.nodeCorrupted);
}

/**
 * Set or update the corruption state for a specific node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {number} nodeIndex - The index of the node to update.
 * @param {boolean} isCorrupted - The corruption state to set (true = corrupted, false = not corrupted).
 * @returns {Promise<void>}
 */
export async function setNodeCorruptionState(actor, nodeIndex, isCorrupted) {
  const nodeCount = await getNodeCount(actor);
  validateNodeIndex(nodeIndex, nodeCount);

  if (typeof isCorrupted !== "boolean") {
    throw new Error(`Invalid corruption state: ${isCorrupted}. Must be a boolean`);
  }

  const corruptedStates = await getNodeCorruptionStates(actor);
  corruptedStates[nodeIndex] = isCorrupted;
  await setFlag(actor, "nodeCorruptedStates", corruptedStates);
}
