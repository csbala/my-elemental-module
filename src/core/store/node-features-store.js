import { STORE_CONFIG, getFlag, setFlag, normalizeArray, validateNodeIndex } from "./store-config.js";
import { getNodeCount } from "./node-count-store.js";

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
    throw new Error(`Invalid feature ID: ${featureId}. Must be a string or null`);
  }

  const features = await getNodeFeatures(actor);
  features[nodeIndex] = featureId;
  await setFlag(actor, "nodeFeatures", features);
}
