import { getThemeColor, getNodeCorruptionStates, setNodeCorruptionState } from "../core/node-store.js";

/**
 * Generates the node configuration with a dynamic theme color.
 *
 * @param {string} themeColor - The theme color in hex format.
 * @returns {Object} The node configuration.
 */
function getNodeConfig(themeColor) {
  return {
    layout: {
      centerX: 200,
      centerY: 200,
      radius: 180,
    },
    vortex: {
      circleCount: 25,
      minPos: 35,
      posRange: 25,
      maxSize: 170,
      sizeStep: 3,
    },
    animation: {
      durationMs: 500,
    },
    styles: {
      defaultNode: {
        background: "radial-gradient(circle at center, rgba(0, 255, 255, 0.2), transparent)",
        border: `4px solid ${themeColor}`,
        boxShadow: `0 0 20px ${themeColor}, 0 0 40px ${themeColor} inset`,
      },
      featureNode: {
        border: "none",
        boxShadow: `0 0 20px ${themeColor}`,
      },
      input: {
        border: "none",
        background: "none",
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
}

/**
 * Generates the spinning circles effect for the vortex-circles layer.
 *
 * @param {HTMLElement} vortexCircles - The vortex-circles DOM element.
 * @param {string} themeColor - The theme color in hex format.
 */
function generateVortexCircles(vortexCircles, themeColor) {
  if (!vortexCircles) return;

  const { circleCount, minPos, posRange, maxSize, sizeStep } = getNodeConfig(themeColor).vortex;
  const circleStyles = [];

  for (let i = 0; i < circleCount; i++) {
    const posX = minPos + Math.random() * posRange;
    const posY = minPos + Math.random() * posRange;
    const size = maxSize - i * sizeStep;
    const gradient = `radial-gradient(circle at ${posX}% ${posY}%, transparent 0, transparent 20px, ${themeColor}33 ${size}px, transparent 22px)`;
    circleStyles.push(gradient);
  }

  vortexCircles.style.background = circleStyles.join(",");
}

/**
 * Calculates the positions of nodes in a circular layout.
 *
 * @param {number} nodeCount - The number of nodes to position.
 * @param {Object} config - The node configuration.
 * @returns {Array<{x: number, y: number}>} Array of position objects.
 */
function calculateNodePositions(nodeCount, config) {
  const { centerX, centerY, radius } = config.layout;
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
 * @param {Object} config - The node configuration.
 * @returns {string} The feature name, or empty string if no feature.
 */
function styleNodeWithFeature(node, featureId, app, config) {
  let featureName = "";

  if (featureId) {
    const feature = game.items.get(featureId) || app?.actor?.items.get(featureId);
    if (feature && feature.img && feature.img !== "icons/svg/mystery-man.svg") {
      console.log(`Setting background for node with feature image: ${feature.img}`);
      node.style.background = `url(${feature.img}) center center / cover no-repeat`;
      node.style.border = config.styles.featureNode.border;
      node.style.boxShadow = config.styles.featureNode.boxShadow;
      node.dataset.featureId = featureId;
      featureName = feature.name || "";
    } else {
      console.log(`Feature ${featureId} not found or has default image`);
      applyDefaultNodeStyles(node, config);
      delete node.dataset.featureId;
    }
  } else {
    applyDefaultNodeStyles(node, config);
    delete node.dataset.featureId;
  }

  return featureName;
}

/**
 * Applies default styles to a node when no feature is assigned.
 *
 * @param {HTMLElement} node - The node element to style.
 * @param {Object} config - The node configuration.
 */
function applyDefaultNodeStyles(node, config) {
  const { background, border, boxShadow } = config.styles.defaultNode;
  node.style.background = background;
  node.style.border = border;
  node.style.boxShadow = boxShadow;
}

/**
 * Updates an existing node's position, value, feature, state, and corruption.
 *
 * @param {HTMLElement} node - The node element to update.
 * @param {number} index - The index of the node.
 * @param {Object} position - The new position {x, y}.
 * @param {number} value - The node's value.
 * @param {string|null} featureId - The feature ID for the node.
 * @param {boolean} isAwakened - The node's state (true = awakened, false = dormant).
 * @param {boolean} isCorrupted - The node's corruption state (true = corrupted, false = not corrupted).
 * @param {Object} app - The character sheet application.
 * @param {Object} callbacks - Callback functions for drag-and-drop and state toggle.
 * @param {Object} config - The node configuration.
 */
function updateExistingNode(node, index, position, value, featureId, isAwakened, isCorrupted, app, callbacks, config) {
  node.style.left = `${position.x}px`;
  node.style.top = `${position.y}px`;

  const input = node.querySelector("input");
  if (input) {
    input.value = value ?? 0;
    input.dataset.nodeIndex = index;
    input.disabled = !isAwakened; // Disable input if node is dormant
  }

  const featureName = styleNodeWithFeature(node, featureId, app, config);

  let nameElement = node.querySelector(".element-name");
  if (!nameElement) {
    nameElement = document.createElement("span");
    nameElement.classList.add("element-name");
    node.appendChild(nameElement);
  }
  nameElement.textContent = featureName;

  node.classList.toggle("node-dormant", !isAwakened);
  node.classList.toggle("node-corrupted", isCorrupted);

  attachNodeHandlers(node, index, app, callbacks.onFeatureDrop, callbacks.onFeatureRemove, callbacks.onStateToggle);
}

/**
 * Creates a new node with the given properties.
 *
 * @param {number} index - The index of the node.
 * @param {Object} position - The position {x, y} of the node.
 * @param {number} value - The node's value.
 * @param {string|null} featureId - The feature ID for the node.
 * @param {boolean} isAwakened - The node's state (true = awakened, false = dormant).
 * @param {boolean} isCorrupted - The node's corruption state (true = corrupted, false = not corrupted).
 * @param {Object} app - The character sheet application.
 * @param {Object} callbacks - Callback functions for drag-and-drop and state toggle.
 * @param {Object} config - The node configuration.
 * @returns {HTMLElement} The created node element.
 */
function createNewNode(index, position, value, featureId, isAwakened, isCorrupted, app, callbacks, config) {
  const node = document.createElement("div");
  node.classList.add("circle", `node-${index + 1}`, "node-create");

  Object.assign(node.style, config.styles.node, {
    left: `${position.x}px`,
    top: `${position.y}px`,
  });

  const featureName = styleNodeWithFeature(node, featureId, app, config);

  if (!isAwakened) {
    node.classList.add("node-dormant");
  }
  if (isCorrupted) {
    node.classList.add("node-corrupted");
  }

  const input = document.createElement("input");
  input.type = "number";
  Object.assign(input.style, config.styles.input);
  input.value = value ?? 0;
  input.dataset.nodeIndex = index;
  input.disabled = !isAwakened; // Disable input if node is dormant

  const nameElement = document.createElement("span");
  nameElement.classList.add("element-name");
  nameElement.textContent = featureName;

  node.appendChild(input);
  node.appendChild(nameElement);

  attachNodeHandlers(node, index, app, callbacks.onFeatureDrop, callbacks.onFeatureRemove, callbacks.onStateToggle);

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
 * @param {boolean[]} nodeCorruptedStates - The corruption states for each node (true = corrupted, false = not corrupted).
 * @param {number} previousNodeCount - The previous number of nodes for animation purposes.
 * @param {string} themeColor - The theme color in hex format.
 * @param {Object} options - Additional options.
 * @param {Object} options.app - The character sheet application.
 * @param {Function} options.onFeatureDrop - Callback when a feature is dropped onto a node.
 * @param {Function} options.onFeatureRemove - Callback when a feature is dragged out of a node.
 * @param {Function} options.onStateToggle - Callback when a node's state is toggled.
 */
export function createTriangleNodes(container, nodeCount, nodeValues = [], nodeFeatures = [], nodeStates = [], nodeCorruptedStates = [], previousNodeCount = 0, themeColor, { app, onFeatureDrop, onFeatureRemove, onStateToggle } = {}) {
  const config = getNodeConfig(themeColor);
  const existingNodes = Array.from(container.querySelectorAll(".circle:not(.center)"));
  const existingNodeCount = existingNodes.length;

  if (nodeCount < existingNodeCount) {
    for (let i = nodeCount; i < existingNodeCount; i++) {
      existingNodes[i].classList.add("node-remove");
    }
    setTimeout(() => {
      existingNodes.slice(nodeCount).forEach((node) => node.remove());
    }, config.animation.durationMs);
  }

  const vortexCircles = container.querySelector(".vortex-circles");
  generateVortexCircles(vortexCircles, themeColor);

  const newPositions = calculateNodePositions(nodeCount, config);

  const callbacks = { onFeatureDrop, onFeatureRemove, onStateToggle };
  for (let i = 0; i < Math.min(nodeCount, existingNodeCount); i++) {
    updateExistingNode(existingNodes[i], i, newPositions[i], nodeValues[i], nodeFeatures[i] || null, nodeStates[i] || false, nodeCorruptedStates[i] || false, app, callbacks, config);
  }

  if (nodeCount > existingNodeCount) {
    for (let i = existingNodeCount; i < nodeCount; i++) {
      const newNode = createNewNode(i, newPositions[i], nodeValues[i], nodeFeatures[i] || null, nodeStates[i] || false, nodeCorruptedStates[i] || false, app, callbacks, config);
      container.appendChild(newNode);
    }
  }
}

/**
 * Attaches drag-and-drop, double-click, and element name click event listeners to a node.
 *
 * @param {HTMLElement} node - The node element.
 * @param {number} nodeIndex - The index of the node.
 * @param {Object} app - The character sheet application.
 * @param {Function} onFeatureDrop - Callback when a feature is dropped onto a node.
 * @param {Function} onFeatureRemove - Callback when a feature is dragged out of a node.
 * @param {Function} onStateToggle - Callback when a node's state is toggled.
 */
function attachNodeHandlers(node, nodeIndex, app, onFeatureDrop, onFeatureRemove, onStateToggle) {
  // Variables for double-right-click detection
  let lastRightClickTime = 0;
  const doubleClickThreshold = 500; // 500ms window for double right-click

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

    const item = (await fromUuid(data.uuid)) || game.items.get(data.id) || app?.actor?.items.get(data.id);
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

  // Add right-click handler to toggle corruption state with double right-click
  node.addEventListener("contextmenu", async (event) => {
    event.preventDefault(); // Prevent the default context menu

    const currentTime = Date.now();
    if (currentTime - lastRightClickTime <= doubleClickThreshold) {
      // Double right-click detected
      const isCorrupted = !node.classList.contains("node-corrupted");
      node.classList.toggle("node-corrupted", isCorrupted);
      await setNodeCorruptionState(app.actor, nodeIndex, isCorrupted);
      console.log(`Toggled corruption state for node ${nodeIndex} to ${isCorrupted ? "corrupted" : "not corrupted"}`);
      lastRightClickTime = 0; // Reset the timer
    } else {
      lastRightClickTime = currentTime;
    }
  });

  // Add click handler to the element name to roll 1d6 + bonus if awakened
  const nameElement = node.querySelector(".element-name");
  if (nameElement) {
    nameElement.addEventListener("click", async () => {
      if (node.classList.contains("node-dormant")) {
        console.log(`Cannot roll for node ${nodeIndex}: Element is dormant`);
        return;
      }

      const input = node.querySelector("input");
      const bonus = parseInt(input.value, 10) || 0;
      const elementName = nameElement.textContent || "Element";

      // Roll 1d6 + bonus
      const roll = new Roll(`1d6 + ${bonus}`);
      await roll.evaluate();

      // Fetch the theme color
      const themeColor = await getThemeColor(app.actor);

      // Render the custom chat message template
      const chatContent = await renderTemplate("modules/my-elemental-module/templates/elemental-roll.hbs", {
        elementName: elementName,
        rollFormula: `1d6 + ${bonus}`,
        rollResult: roll.total,
        themeColor: themeColor,
      });

      // Send the roll to chat with the custom template
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: app.actor }),
        content: chatContent,
      });

      console.log(`Rolled 1d6 + ${bonus} for node ${nodeIndex} (${elementName}): ${roll.total}`);
    });
  }

  // Make the node draggable if it has a feature
  node.draggable = !!node.dataset.featureId;
}
