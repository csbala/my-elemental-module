/**
 * Dynamically generates and positions visual nodes in a circular layout around a central point.
 *
 * This function is used to visually represent a number of nodes (elemental points) in a radial
 * pattern around a fixed center inside the specified container. The nodes are evenly spaced
 * in a circular pattern, and any previously created nodes (excluding the center) are removed.
 *
 * @function createTriangleNodes
 * @param {HTMLElement} container - The DOM element that will contain the circular node layout.
 * @param {number} [nodeCount=3] - The number of nodes to generate and arrange around the center.
 *
 * Behavior:
 * - Clears all `.circle` nodes from the container except the one with class `.center`.
 * - Calculates evenly spaced angles around a circle to position nodes.
 * - Appends new `.circle.node-{i}` div elements to represent each node visually.
 * - Each node is positioned using absolute coordinates and centered using CSS transforms.
 */
export function createTriangleNodes(container, nodeCount = 3) {
  const centerX = 200;
  const centerY = 200;
  const radius = 180;

  // Remove existing nodes
  container
    .querySelectorAll(".circle:not(.center)")
    .forEach((node) => node.remove());

  for (let i = 0; i < nodeCount; i++) {
    const angleDeg = 90 + (360 / nodeCount) * i;
    const angleRad = angleDeg * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY - radius * Math.sin(angleRad);

    const node = document.createElement("div");
    node.classList.add("circle", `node-${i + 1}`);
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.transform = "translate(-50%, -50%)";

    container.appendChild(node);
  }
}
