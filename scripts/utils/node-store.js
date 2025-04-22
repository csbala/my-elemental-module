const STORAGE_KEY = "elementalNodeData";

/**
 * Load node count data for all actors from localStorage.
 *
 * @returns {Object<string, number>} An object mapping actor UUIDs to their node counts.
 */
function loadNodeData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

/**
 * Save the provided node count map to localStorage.
 *
 * @param {Object<string, number>} data - An object mapping actor UUIDs to their node counts.
 */
function saveNodeData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Retrieve the stored node count for a specific actor.
 *
 * @param {string} actorId - The unique identifier (UUID) of the actor.
 * @returns {number} The node count for the actor. Defaults to 3 if not found.
 */
export function getNodeCount(actorId) {
  const data = loadNodeData();
  return data[actorId] ?? 3;
}

/**
 * Set or update the node count for a specific actor in storage.
 *
 * @param {string} actorId - The unique identifier (UUID) of the actor.
 * @param {number} count - The number of nodes to store for the actor.
 */
export function setNodeCount(actorId, count) {
  const data = loadNodeData();
  data[actorId] = count;
  saveNodeData(data);
}
