const STORAGE_KEY = "elementalNodeData";

/**
 * Loads node count map from localStorage
 */
function loadNodeData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

/**
 * Saves node count map to localStorage
 */
function saveNodeData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Gets node count for a specific actor
 */
export function getNodeCount(actorId) {
  const data = loadNodeData();
  return data[actorId] ?? 3;
}

/**
 * Sets node count for a specific actor
 */
export function setNodeCount(actorId, count) {
  const data = loadNodeData();
  data[actorId] = count;
  saveNodeData(data);
}
