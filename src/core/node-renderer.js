/**
 * Dynamically generates and positions visual nodes in a circular layout around a central point.
 *
 * This function creates nodes with interactable input fields in their centers to represent
 * elemental bonuses. It supports animations for node creation, removal, and position changes.
 *
 * @function createTriangleNodes
 * @param {HTMLElement} container - The DOM element that will contain the circular node layout.
 * @param {number} nodeCount - The number of nodes to generate and arrange around the center.
 * @param {number[]} nodeValues - The values for each node (default to 0 if not provided).
 * @param {number} previousNodeCount - The previous number of nodes for animation purposes.
 *
 * Behavior:
 * - Animates removal of nodes if nodeCount decreases.
 * - Animates creation of new nodes if nodeCount increases.
 * - Transitions existing nodes to their new positions.
 * - Each node is positioned using absolute coordinates and centered using CSS transforms.
 * - The input field is styled to have no border or background, showing only the number.
 */
export function createTriangleNodes(
  container,
  nodeCount,
  nodeValues = [],
  previousNodeCount = 0
) {
  const centerX = 200;
  const centerY = 200;
  const radius = 180;

  // Get existing nodes
  const existingNodes = Array.from(
    container.querySelectorAll(".circle:not(.center)")
  );
  const existingNodeCount = existingNodes.length;

  // Animate removal of nodes if nodeCount decreases
  if (nodeCount < existingNodeCount) {
    for (let i = nodeCount; i < existingNodeCount; i++) {
      const node = existingNodes[i];
      node.classList.add("node-remove");
    }
    // Wait for the animation to complete before removing nodes
    setTimeout(() => {
      existingNodes.slice(nodeCount).forEach((node) => node.remove());
    }, 500); // Match the animation duration (0.5s)
  }

  // Calculate new positions for all nodes (even existing ones)
  const newPositions = [];
  for (let i = 0; i < nodeCount; i++) {
    const angleDeg = 90 + (360 / nodeCount) * i;
    const angleRad = angleDeg * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY - radius * Math.sin(angleRad);
    newPositions.push({ x, y });
  }

  // Update positions of existing nodes (if any)
  for (let i = 0; i < Math.min(nodeCount, existingNodeCount); i++) {
    const node = existingNodes[i];
    node.style.left = `${newPositions[i].x}px`;
    node.style.top = `${newPositions[i].y}px`;
    // Update the input value if it exists
    const input = node.querySelector("input");
    if (input) {
      input.value = nodeValues[i] ?? 0;
      input.dataset.nodeIndex = i;
    }
  }

  // Create new nodes if nodeCount increases
  if (nodeCount > existingNodeCount) {
    for (let i = existingNodeCount; i < nodeCount; i++) {
      const node = document.createElement("div");
      node.classList.add("circle", `node-${i + 1}`, "node-create");
      node.style.left = `${newPositions[i].x}px`;
      node.style.top = `${newPositions[i].y}px`;
      node.style.transform = "translate(-50%, -50%)";
      node.style.position = "absolute";
      node.style.display = "flex";
      node.style.alignItems = "center";
      node.style.justifyContent = "center";

      // Create the input field
      const input = document.createElement("input");
      input.type = "number";
      input.value = nodeValues[i] ?? 0;
      input.style.border = "none";
      input.style.background = "none";
      input.style.color = "white";
      input.style.textAlign = "center";
      input.style.fontSize = "12px";
      input.style.padding = "0";
      input.style.outline = "none";
      input.style.width = "20px";
      input.style.height = "20px";
      input.style.fontWeight = "bold";
      input.style.fontFamily = "Arial, sans-serif";
      input.style.pointerEvents = "auto";
      input.style.textShadow = "0 0 5px black";
      input.style.transition = "border-color 0.3s";
      input.dataset.nodeIndex = i;

      node.appendChild(input);
      container.appendChild(node);
    }
  }
}
