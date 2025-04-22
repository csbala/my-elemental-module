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
