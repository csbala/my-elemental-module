/**
 * Retrieve the stored node count for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<number>} The node count for the actor. Defaults to 3 if not found.
 */
export async function getNodeCount(actor) {
  return (await actor.getFlag("my-elemental-module", "nodeCount")) ?? 3;
}

/**
 * Set or update the node count for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {number} count - The number of nodes to store for the actor.
 * @returns {Promise<void>}
 */
export async function setNodeCount(actor, count) {
  await actor.setFlag("my-elemental-module", "nodeCount", count);
}

/**
 * Retrieve the stored node values for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<number[]>} The node values for the actor. Defaults to an array of zeros based on node count.
 */
export async function getNodeValues(actor) {
  const nodeCount = await getNodeCount(actor);
  const values =
    (await actor.getFlag("my-elemental-module", "nodeValues")) || [];
  // Ensure the array has the correct length, filling with 0 for new nodes
  return Array(nodeCount)
    .fill(0)
    .map((_, index) => values[index] ?? 0);
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
  const values = await getNodeValues(actor);
  values[nodeIndex] = value;
  await actor.setFlag("my-elemental-module", "nodeValues", values);
}

/**
 * Retrieve the stored feature IDs for each node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<(string|null)[]>} The feature IDs for each node. Defaults to an array of nulls based on node count.
 */
export async function getNodeFeatures(actor) {
  const nodeCount = await getNodeCount(actor);
  const features =
    (await actor.getFlag("my-elemental-module", "nodeFeatures")) || [];
  // Ensure the array has the correct length, filling with null for nodes without features
  return Array(nodeCount)
    .fill(null)
    .map((_, index) => features[index] ?? null);
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
  const features = await getNodeFeatures(actor);
  features[nodeIndex] = featureId;
  await actor.setFlag("my-elemental-module", "nodeFeatures", features);
}

/**
 * Retrieve the stored states (awakened/dormant) for each node.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<boolean[]>} The states for each node (true = awakened, false = dormant). Defaults to an array of false based on node count.
 */
export async function getNodeStates(actor) {
  const nodeCount = await getNodeCount(actor);
  const states =
    (await actor.getFlag("my-elemental-module", "nodeStates")) || [];
  // Ensure the array has the correct length, filling with false (dormant) for new nodes
  return Array(nodeCount)
    .fill(false)
    .map((_, index) => states[index] ?? false);
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
  const states = await getNodeStates(actor);
  states[nodeIndex] = isAwakened;
  await actor.setFlag("my-elemental-module", "nodeStates", states);
}
