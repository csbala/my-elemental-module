/**
 * Dynamically generates and positions visual nodes in a circular layout around a central point.
 *
 * This function creates nodes with interactable input fields in their centers to represent
 * elemental bonuses. It supports drag-and-drop for adding/removing features, displaying feature
 * images as circular backgrounds, animations for node creation, removal, and position changes,
 * and toggling between awakened/dormant states via double-click.
 *
 * @function createTriangleNodes
 * @param {HTMLElement} container - The DOM element that will contain the circular node layout.
 * @param {number} nodeCount - The number of nodes to generate and arrange around the center.
 * @param {number[]} nodeValues - The values for each node (default to 0 if not provided).
 * @param {string|null[]} nodeFeatures - The feature IDs for each node (null if no feature).
 * @param {boolean[]} nodeStates - The states for each node (true = awakened, false = dormant).
 * @param {number} previousNodeCount - The previous number of nodes for animation purposes.
 * @param {Object} options - Additional options.
 * @param {Object} options.app - The character sheet application.
 * @param {Function} options.onFeatureDrop - Callback when a feature is dropped onto a node.
 * @param {Function} options.onFeatureRemove - Callback when a feature is dragged out of a node.
 * @param {Function} options.onStateToggle - Callback when a node's state is toggled.
 *
 * Behavior:
 * - Animates removal of nodes if nodeCount decreases.
 * - Animates creation of new nodes if nodeCount increases.
 * - Transitions existing nodes to their new positions.
 * - Enables drag-and-drop for adding/removing features.
 * - Displays feature images as circular backgrounds when assigned.
 * - Toggles between awakened and dormant states on double-click.
 */
export function createTriangleNodes(
  container,
  nodeCount,
  nodeValues = [],
  nodeFeatures = [],
  nodeStates = [],
  previousNodeCount = 0,
  { app, onFeatureDrop, onFeatureRemove, onStateToggle } = {}
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
    // Update the input value and feature if they exist
    const input = node.querySelector("input");
    if (input) {
      input.value = nodeValues[i] ?? 0;
      input.dataset.nodeIndex = i;
    }
    const featureId = nodeFeatures[i] || null;
    if (featureId) {
      const feature =
        game.items.get(featureId) || app?.actor?.items.get(featureId);
      if (
        feature &&
        feature.img &&
        feature.img !== "icons/svg/mystery-man.svg"
      ) {
        console.log(
          `Setting background for node ${i} with feature image: ${feature.img}`
        );
        node.style.background = `url(${feature.img}) center center / cover no-repeat`;
        node.style.border = "none";
        node.style.boxShadow = "0 0 20px #00ffff";
        node.dataset.featureId = featureId;
      } else {
        console.log(
          `Feature ${featureId} not found or has default image for node ${i}`
        );
        // Clear the feature if it no longer exists or has the default image
        node.style.background =
          "radial-gradient(circle at center, rgba(0, 255, 255, 0.2), transparent)";
        node.style.border = "4px solid #00ffff";
        node.style.boxShadow = "0 0 20px #00ffff, 0 0 40px #00ffff inset";
        delete node.dataset.featureId;
      }
    } else {
      node.style.background =
        "radial-gradient(circle at center, rgba(0, 255, 255, 0.2), transparent)";
      node.style.border = "4px solid #00ffff";
      node.style.boxShadow = "0 0 20px #00ffff, 0 0 40px #00ffff inset";
      delete node.dataset.featureId;
    }
    // Update the node's state (awakened/dormant)
    const isAwakened = nodeStates[i] || false;
    if (isAwakened) {
      node.classList.remove("node-dormant");
    } else {
      node.classList.add("node-dormant");
    }
    // Re-attach drag-and-drop and double-click handlers
    attachNodeHandlers(
      node,
      i,
      app,
      onFeatureDrop,
      onFeatureRemove,
      onStateToggle
    );
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

      const featureId = nodeFeatures[i] || null;
      if (featureId) {
        const feature =
          game.items.get(featureId) || app?.actor?.items.get(featureId);
        if (
          feature &&
          feature.img &&
          feature.img !== "icons/svg/mystery-man.svg"
        ) {
          console.log(
            `Setting background for new node ${i} with feature image: ${feature.img}`
          );
          node.style.background = `url(${feature.img}) center center / cover no-repeat`;
          node.style.border = "none";
          node.style.boxShadow = "0 0 20px #00ffff";
          node.dataset.featureId = featureId;
        }
      }

      // Set the node's state (default to dormant)
      const isAwakened = nodeStates[i] || false;
      if (!isAwakened) {
        node.classList.add("node-dormant");
      }

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

      // Attach drag-and-drop and double-click handlers
      attachNodeHandlers(
        node,
        i,
        app,
        onFeatureDrop,
        onFeatureRemove,
        onStateToggle
      );
    }
  }
}

/**
 * Attaches drag-and-drop and double-click event listeners to a node.
 *
 * @param {HTMLElement} node - The node element.
 * @param {number} nodeIndex - The index of the node.
 * @param {Object} app - The character sheet application.
 * @param {Function} onFeatureDrop - Callback when a feature is dropped onto the node.
 * @param {Function} onFeatureRemove - Callback when a feature is dragged out of the node.
 * @param {Function} onStateToggle - Callback when a node's state is toggled.
 */
function attachNodeHandlers(
  node,
  nodeIndex,
  app,
  onFeatureDrop,
  onFeatureRemove,
  onStateToggle
) {
  // Allow dropping items onto the node
  node.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    console.log(`Drag over node ${nodeIndex}`);
  });

  node.addEventListener("drop", async (event) => {
    event.preventDefault();
    console.log(`Drop on node ${nodeIndex}`);
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      console.log("Dropped data:", data);
    } catch (e) {
      console.error("Failed to parse drag data:", e);
      return;
    }
    if (data.type !== "Item") {
      console.log("Dropped data is not an Item:", data.type);
      return;
    }

    const item =
      (await fromUuid(data.uuid)) ||
      game.items.get(data.id) ||
      app?.actor?.items.get(data.id);
    if (!item) {
      console.log("Item not found:", data.id);
      return;
    }
    if (item.type !== "feat") {
      console.log("Item is not a feat:", item.type);
      return;
    }

    await onFeatureDrop(nodeIndex, item);
  });

  // Allow dragging features out of the node
  node.addEventListener("dragstart", (event) => {
    const featureId = node.dataset.featureId;
    if (!featureId) {
      console.log(`No feature to drag from node ${nodeIndex}`);
      return;
    }

    console.log(`Dragging feature ${featureId} from node ${nodeIndex}`);
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "Item",
        uuid: `Actor.${app.actor.id}.Item.${featureId}`,
        id: featureId,
        nodeIndex: nodeIndex,
      })
    );
    event.dataTransfer.effectAllowed = "move";

    // Notify the removal after drag
    setTimeout(async () => {
      await onFeatureRemove(nodeIndex);
    }, 0);
  });

  // Add double-click handler to toggle awakened/dormant state
  node.addEventListener("dblclick", async () => {
    const isAwakened = !node.classList.contains("node-dormant");
    if (isAwakened) {
      node.classList.add("node-dormant");
    } else {
      node.classList.remove("node-dormant");
    }
    await onStateToggle(nodeIndex, !isAwakened);
  });

  // Make the node draggable if it has a feature
  node.draggable = !!node.dataset.featureId;
}
