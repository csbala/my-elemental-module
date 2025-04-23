/**
 * Dynamically generates and positions visual nodes in a circular layout around a central point.
 *
 * This function creates nodes with interactable input fields in their centers to represent
 * elemental bonuses. Each node starts with a default value of 0, and the values are passed
 * as an array to initialize the input fields.
 *
 * @function createTriangleNodes
 * @param {HTMLElement} container - The DOM element that will contain the circular node layout.
 * @param {number} nodeCount - The number of nodes to generate and arrange around the center.
 * @param {number[]} nodeValues - The values for each node (default to 0 if not provided).
 *
 * Behavior:
 * - Clears all `.circle` nodes from the container except the one with class `.center`.
 * - Calculates evenly spaced angles around a circle to position nodes.
 * - Appends new `.circle.node-{i}` div elements with an input field in the center.
 * - Each node is positioned using absolute coordinates and centered using CSS transforms.
 * - The input field is styled to have no border or background, showing only the number.
 */
export function createTriangleNodes(container, nodeCount, nodeValues = []) {
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

    // Create the node container
    const node = document.createElement("div");
    node.classList.add("circle", `node-${i + 1}`);
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.transform = "translate(-50%, -50%)";
    node.style.position = "absolute";
    node.style.alignItems = "center";
    node.style.justifyContent = "center";

    // Create the input field
    const input = document.createElement("input");
    input.type = "number";
    input.value = nodeValues[i] ?? 0;
    input.style.border = "none";
    input.style.background = "none";
    input.style.color = "white"; // Adjust color as needed
    input.style.textAlign = "center";
    input.style.width = "100%";
    input.style.height = "100%";
    input.style.fontSize = "12px"; // Adjust font size as needed
    input.style.padding = "0";
    input.style.outline = "none";
    input.dataset.nodeIndex = i; // Store the node index for event handling

    node.appendChild(input);
    container.appendChild(node);
  }
}
