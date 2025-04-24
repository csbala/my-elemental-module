/**
 * Configuration object for the node renderer, centralizing constants and styles.
 */
const NODE_CONFIG = {
  layout: {
    centerX: 200, // Center X position of the circular layout
    centerY: 200, // Center Y position of the circular layout
    radius: 180, // Radius of the circular layout
  },
  vortex: {
    circleCount: 25, // Number of spinning circles in the vortex layer
    minPos: 35, // Minimum position percentage for vortex circles (40% to 55%)
    posRange: 25, // Range of position variation
    maxSize: 170, // Maximum circle size in pixels
    sizeStep: 3, // Size decrease per circle
  },
  animation: {
    durationMs: 500, // Duration of node creation/removal animations
  },
  styles: {
    defaultNode: {
      background:
        "radial-gradient(circle at center, rgba(0, 255, 255, 0.2), transparent)",
      border: "4px solid #00ffff",
      boxShadow: "0 0 20px #00ffff, 0 0 40px #00ffff inset",
    },
    featureNode: {
      border: "none",
      boxShadow: "0 0 20px #00ffff",
    },
    input: {
      border: "none",
      background: "none",
      color: "white",
      textAlign: "center",
      fontSize: "13px",
      padding: "0",
      outline: "none",
      width: "30px",
      height: "30px",
      fontWeight: "bold",
      fontFamily: "Arial, sans-serif",
      pointerEvents: "auto",
      textShadow: "0 0 5px black",
      transition: "border-color 0.3s",
    },
    node: {
      width: "160px",
      height: "160px",
      borderRadius: "50%",
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      transform: "translate(-50%, -50%)",
    },
  },
};

/**
 * Generates the spinning circles effect for the vortex-circles layer.
 *
 * @param {HTMLElement} vortexCircles - The vortex-circles DOM element.
 */
function generateVortexCircles(vortexCircles) {
  if (!vortexCircles) return;

  const { circleCount, minPos, posRange, maxSize, sizeStep } =
    NODE_CONFIG.vortex;
  const circleStyles = [];

  for (let i = 0; i < circleCount; i++) {
    const posX = minPos + Math.random() * posRange;
    const posY = minPos + Math.random() * posRange;
    const size = maxSize - i * sizeStep;
    const gradient = `radial-gradient(circle at ${posX}% ${posY}%, transparent 0, transparent 20px, rgba(0, 255, 255, 0.13) ${size}px, transparent 22px)`;
    circleStyles.push(gradient);
  }

  vortexCircles.style.background = circleStyles.join(",");
}

/**
 * Calculates the positions of nodes in a circular layout.
 *
 * @param {number} nodeCount - The number of nodes to position.
 * @returns {Array<{x: number, y: number}>} Array of position objects.
 */
function calculateNodePositions(nodeCount) {
  const { centerX, centerY, radius } = NODE_CONFIG.layout;
  const positions = [];

  for (let i = 0; i < nodeCount; i++) {
    const angleDeg = 90 + (360 / nodeCount) * i;
    const angleRad = angleDeg * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY - radius * Math.sin(angleRad);
    positions.push({ x, y });
  }

  return positions;
}

/**
 * Applies styles and feature data to a node.
 *
 * @param {HTMLElement} node - The node element to style.
 * @param {string|null} featureId - The ID of the feature associated with the node.
 * @param {Object} app - The character sheet application.
 * @returns {string} The feature name, or empty string if no feature.
 */
function styleNodeWithFeature(node, featureId, app) {
  let featureName = "";

  if (featureId) {
    const feature =
      game.items.get(featureId) || app?.actor?.items.get(featureId);
    if (feature && feature.img && feature.img !== "icons/svg/mystery-man.svg") {
      console.log(
        `Setting background for node with feature image: ${feature.img}`
      );
      node.style.background = `url(${feature.img}) center center / cover no-repeat`;
      node.style.border = NODE_CONFIG.styles.featureNode.border;
      node.style.boxShadow = NODE_CONFIG.styles.featureNode.boxShadow;
      node.dataset.featureId = featureId;
      featureName = feature.name || "";
    } else {
      console.log(`Feature ${featureId} not found or has default image`);
      applyDefaultNodeStyles(node);
      delete node.dataset.featureId;
    }
  } else {
    applyDefaultNodeStyles(node);
    delete node.dataset.featureId;
  }

  return featureName;
}

/**
 * Applies default styles to a node when no feature is assigned.
 *
 * @param {HTMLElement} node - The node element to style.
 */
function applyDefaultNodeStyles(node) {
  const { background, border, boxShadow } = NODE_CONFIG.styles.defaultNode;
  node.style.background = background;
  node.style.border = border;
  node.style.boxShadow = boxShadow;
}

/**
 * Updates an existing node's position, value, feature, and state.
 *
 * @param {HTMLElement} node - The node element to update.
 * @param {number} index - The index of the node.
 * @param {Object} position - The new position {x, y}.
 * @param {number} value - The node's value.
 * @param {string|null} featureId - The feature ID for the node.
 * @param {boolean} isAwakened - The node's state (true = awakened, false = dormant).
 * @param {Object} app - The character sheet application.
 * @param {Object} callbacks - Callback functions for drag-and-drop and state toggle.
 */
function updateExistingNode(
  node,
  index,
  position,
  value,
  featureId,
  isAwakened,
  app,
  callbacks
) {
  // Update position
  node.style.left = `${position.x}px`;
  node.style.top = `${position.y}px`;

  // Update input value
  const input = node.querySelector("input");
  if (input) {
    input.value = value ?? 0;
    input.dataset.nodeIndex = index;
  }

  // Update feature and style
  const featureName = styleNodeWithFeature(node, featureId, app);

  // Update element name
  let nameElement = node.querySelector(".element-name");
  if (!nameElement) {
    nameElement = document.createElement("span");
    nameElement.classList.add("element-name");
    node.appendChild(nameElement);
  }
  nameElement.textContent = featureName;

  // Update state
  node.classList.toggle("node-dormant", !isAwakened);

  // Re-attach event handlers
  attachNodeHandlers(
    node,
    index,
    app,
    callbacks.onFeatureDrop,
    callbacks.onFeatureRemove,
    callbacks.onStateToggle
  );
}

/**
 * Creates a new node with the given properties.
 *
 * @param {number} index - The index of the node.
 * @param {Object} position - The position {x, y} of the node.
 * @param {number} value - The node's value.
 * @param {string|null} featureId - The feature ID for the node.
 * @param {boolean} isAwakened - The node's state (true = awakened, false = dormant).
 * @param {Object} app - The character sheet application.
 * @param {Object} callbacks - Callback functions for drag-and-drop and state toggle.
 * @returns {HTMLElement} The created node element.
 */
function createNewNode(
  index,
  position,
  value,
  featureId,
  isAwakened,
  app,
  callbacks
) {
  const node = document.createElement("div");
  node.classList.add("circle", `node-${index + 1}`, "node-create");

  // Apply base styles
  Object.assign(node.style, NODE_CONFIG.styles.node, {
    left: `${position.x}px`,
    top: `${position.y}px`,
  });

  // Apply feature and style
  const featureName = styleNodeWithFeature(node, featureId, app);

  // Set state
  if (!isAwakened) {
    node.classList.add("node-dormant");
  }

  // Create input field
  const input = document.createElement("input");
  input.type = "number";
  Object.assign(input.style, NODE_CONFIG.styles.input);
  input.value = value ?? 0;
  input.dataset.nodeIndex = index;

  // Create element name display
  const nameElement = document.createElement("span");
  nameElement.classList.add("element-name");
  nameElement.textContent = featureName;

  // Append children
  node.appendChild(input);
  node.appendChild(nameElement);

  // Attach event handlers
  attachNodeHandlers(
    node,
    index,
    app,
    callbacks.onFeatureDrop,
    callbacks.onFeatureRemove,
    callbacks.onStateToggle
  );

  return node;
}

/**
 * Dynamically generates and positions visual nodes in a circular layout around a central point.
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
  // Step 1: Get existing nodes
  const existingNodes = Array.from(
    container.querySelectorAll(".circle:not(.center)")
  );
  const existingNodeCount = existingNodes.length;

  // Step 2: Animate removal of excess nodes
  if (nodeCount < existingNodeCount) {
    for (let i = nodeCount; i < existingNodeCount; i++) {
      existingNodes[i].classList.add("node-remove");
    }
    setTimeout(() => {
      existingNodes.slice(nodeCount).forEach((node) => node.remove());
    }, NODE_CONFIG.animation.durationMs);
  }

  // Step 3: Generate vortex circles
  const vortexCircles = container.querySelector(".vortex-circles");
  generateVortexCircles(vortexCircles);

  // Step 4: Calculate new positions for all nodes
  const newPositions = calculateNodePositions(nodeCount);

  // Step 5: Update existing nodes
  const callbacks = { onFeatureDrop, onFeatureRemove, onStateToggle };
  for (let i = 0; i < Math.min(nodeCount, existingNodeCount); i++) {
    updateExistingNode(
      existingNodes[i],
      i,
      newPositions[i],
      nodeValues[i],
      nodeFeatures[i] || null,
      nodeStates[i] || false,
      app,
      callbacks
    );
  }

  // Step 6: Create new nodes if needed
  if (nodeCount > existingNodeCount) {
    for (let i = existingNodeCount; i < nodeCount; i++) {
      const newNode = createNewNode(
        i,
        newPositions[i],
        nodeValues[i],
        nodeFeatures[i] || null,
        nodeStates[i] || false,
        app,
        callbacks
      );
      container.appendChild(newNode);
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
