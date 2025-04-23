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
