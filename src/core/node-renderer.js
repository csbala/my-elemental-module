import {
  getThemeColor,
  getNodeCorruptionStates,
  setNodeCorruptionState,
} from "../core/node-store.js";
import { logger } from "../logger.js";

/**
 * Generates the node configuration with a dynamic theme color.
 *
 * @param {string} themeColor - The theme color in hex format.
 * @returns {Object} The node configuration.
 */
function getNodeConfig(themeColor) {
  return {
    layout: {
      centerX: 192.5, // Adjusted to true center of 385px container (385 / 2)
      centerY: 192.5, // Adjusted to true center of 385px container (385 / 2)
      radius: 180, // Slightly reduced to fit within 385px container
    },
    vortex: {
      circleCount: 20,
      minPos: 40,
      posRange: 25,
      maxSize: 170,
      sizeStep: 3,
    },
    animation: {
      durationMs: 500,
    },
    styles: {
      defaultNode: {
        background:
          "radial-gradient(circle at center, rgba(0, 255, 255, 0.2), transparent)",
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

  const { circleCount, minPos, posRange, maxSize, sizeStep } =
    getNodeConfig(themeColor).vortex;
  const circleStyles = [];

  for (let i = 0; i < circleCount; i++) {
    const posX = minPos + Math.random() * posRange;
    const posY = minPos + Math.random() * posRange;
    const size = maxSize - i * sizeStep;
    const gradient = `radial-gradient(circle at ${posX}% ${posY}%, transparent 0, transparent 20px, ${themeColor}33 ${size}px, transparent 22px)`;
    circleStyles.push(gradient);
  }

  vortexCircles.style.background = circleStyles.join(",");
  logger.debug(`Generated vortex circles with theme color: ${themeColor}`);
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

  logger.debug(`Calculated positions for ${nodeCount} nodes:`, positions);
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
    const feature =
      game.items.get(featureId) || app?.actor?.items.get(featureId);
    if (feature && feature.img && feature.img !== "icons/svg/mystery-man.svg") {
      logger.debug(
        `Setting background for node with feature image: ${feature.img}`
      );
      node.style.background = `url(${feature.img}) center center / cover no-repeat`;
      node.style.border = config.styles.featureNode.border;
      node.style.boxShadow = config.styles.featureNode.boxShadow;
      node.dataset.featureId = featureId;
      featureName = feature.name || "";
    } else {
      logger.debug(`Feature ${featureId} not found or has default image`);
      applyDefaultNodeStyles(node, config);
      delete node.dataset.featureId;
    }
  } else {
    applyDefaultNodeStyles(node, config);
    delete node.dataset.featureId;
  }

  logger.debug(
    `Styled node with feature ID ${featureId}, name: ${featureName}`
  );
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
  logger.debug(`Applied default styles to node:`, {
    background,
    border,
    boxShadow,
  });
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
function updateExistingNode(
  node,
  index,
  position,
  value,
  featureId,
  isAwakened,
  isCorrupted,
  app,
  callbacks,
  config
) {
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

  attachNodeHandlers(
    node,
    index,
    app,
    callbacks.onFeatureDrop,
    callbacks.onFeatureRemove,
    callbacks.onStateToggle
  );
  logger.debug(
    `Updated node ${index}: Position (${position.x}, ${position.y}), Value: ${value}, Feature: ${featureId}, Awakened: ${isAwakened}, Corrupted: ${isCorrupted}`
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
 * @param {boolean} isCorrupted - The node's corruption state (true = corrupted, false = not corrupted).
 * @param {Object} app - The character sheet application.
 * @param {Object} callbacks - Callback functions for drag-and-drop and state toggle.
 * @param {Object} config - The node configuration.
 * @returns {HTMLElement} The created node element.
 */
function createNewNode(
  index,
  position,
  value,
  featureId,
  isAwakened,
  isCorrupted,
  app,
  callbacks,
  config
) {
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

  attachNodeHandlers(
    node,
    index,
    app,
    callbacks.onFeatureDrop,
    callbacks.onFeatureRemove,
    callbacks.onStateToggle
  );

  logger.debug(
    `Created new node ${index}: Position (${position.x}, ${position.y}), Value: ${value}, Feature: ${featureId}, Awakened: ${isAwakened}, Corrupted: ${isCorrupted}`
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
 * @param {boolean[]} nodeCorruptedStates - The corruption states for each node (true = corrupted, false = not corrupted).
 * @param {number} previousNodeCount - The previous number of nodes for animation purposes.
 * @param {string} themeColor - The theme color in hex format.
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
  nodeCorruptedStates = [],
  previousNodeCount = 0,
  themeColor,
  { app, onFeatureDrop, onFeatureRemove, onStateToggle } = {}
) {
  const config = getNodeConfig(themeColor);
  const existingNodes = Array.from(
    container.querySelectorAll(".circle:not(.center)")
  );
  const existingNodeCount = existingNodes.length;

  if (nodeCount < existingNodeCount) {
    for (let i = nodeCount; i < existingNodeCount; i++) {
      existingNodes[i].classList.add("node-remove");
    }
    setTimeout(() => {
      existingNodes.slice(nodeCount).forEach((node) => node.remove());
    }, config.animation.durationMs);
    logger.debug(`Removed ${existingNodeCount - nodeCount} excess nodes.`);
  }

  const vortexCircles = container.querySelector(".vortex-circles");
  generateVortexCircles(vortexCircles, themeColor);

  const newPositions = calculateNodePositions(nodeCount, config);

  const callbacks = { onFeatureDrop, onFeatureRemove, onStateToggle };
  for (let i = 0; i < Math.min(nodeCount, existingNodeCount); i++) {
    updateExistingNode(
      existingNodes[i],
      i,
      newPositions[i],
      nodeValues[i],
      nodeFeatures[i] || null,
      nodeStates[i] || false,
      nodeCorruptedStates[i] || false,
      app,
      callbacks,
      config
    );
  }

  if (nodeCount > existingNodeCount) {
    for (let i = existingNodeCount; i < nodeCount; i++) {
      const newNode = createNewNode(
        i,
        newPositions[i],
        nodeValues[i],
        nodeFeatures[i] || null,
        nodeStates[i] || false,
        nodeCorruptedStates[i] || false,
        app,
        callbacks,
        config
      );
      container.appendChild(newNode);
    }
  }

  logger.debug(
    `Created/Updated ${nodeCount} nodes with theme color: ${themeColor}`
  );
}

/**
 * Attaches drag-and-drop, double-click, element name click, and hover event listeners to a node.
 *
 * @param {HTMLElement} node - The node element.
 * @param {number} nodeIndex - The index of the node.
 * @param {Object} app - The character sheet application.
 * @param {Function} onFeatureDrop - Callback when a feature is dropped onto a node.
 * @param {Function} onFeatureRemove - Callback when a feature is dragged out of a node.
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
  // Variables for double-right-click detection
  let lastRightClickTime = 0;
  const doubleClickThreshold = 500; // 500ms window for double right-click
  let hoverPad = null;
  let hoverTimeout = null;

  // Function to remove the hover pad
  const removeHoverPad = () => {
    if (hoverPad) {
      hoverPad.remove();
      hoverPad = null;
      logger.debug(`Removed hover pad for node ${nodeIndex}`);
    }
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
  };

  // Allow dropping items onto the node
  node.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    logger.debug(`Drag over node ${nodeIndex}`);
  });

  node.addEventListener("drop", async (event) => {
    event.preventDefault();
    logger.debug(`Drop on node ${nodeIndex}`);
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      logger.debug("Dropped data:", data);
    } catch (e) {
      logger.error("Failed to parse drag data:", e);
      return;
    }
    if (data.type !== "Item") {
      logger.debug("Dropped data is not an Item:", data.type);
      return;
    }

    const item =
      (await fromUuid(data.uuid)) ||
      game.items.get(data.id) ||
      app?.actor?.items.get(data.id);
    if (!item) {
      logger.debug("Item not found:", data.id);
      return;
    }
    if (item.type !== "feat") {
      logger.debug("Item is not a feat:", item.type);
      return;
    }

    await onFeatureDrop(nodeIndex, item);
    removeHoverPad(); // Remove the hover pad after dropping a feature
    logger.debug(`Dropped feature ${item.id} onto node ${nodeIndex}`);
  });

  // Allow dragging features out of the node
  node.addEventListener("dragstart", (event) => {
    const featureId = node.dataset.featureId;
    if (!featureId) {
      logger.debug(`No feature to drag from node ${nodeIndex}`);
      return;
    }

    logger.debug(`Dragging feature ${featureId} from node ${nodeIndex}`);
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

    // Remove the hover pad when dragging out
    removeHoverPad();

    setTimeout(async () => {
      await onFeatureRemove(nodeIndex);
      logger.debug(
        `Feature ${featureId} removed from node ${nodeIndex} via dragstart`
      );
    }, 0);
  });

  // Add double-click handler to toggle awakened/dormant state
  node.addEventListener("dblclick", async () => {
    removeHoverPad(); // Remove the hover pad on double-click
    const isAwakened = !node.classList.contains("node-dormant");
    if (isAwakened) {
      node.classList.add("node-dormant");
    } else {
      node.classList.remove("node-dormant");
    }
    await onStateToggle(nodeIndex, !isAwakened);
    logger.debug(
      `Toggled node ${nodeIndex} to ${
        !isAwakened ? "awakened" : "dormant"
      } state via double-click`
    );
  });

  // Add right-click handler to toggle corruption state with double right-click
  node.addEventListener("contextmenu", async (event) => {
    event.preventDefault(); // Prevent the default context menu

    const currentTime = Date.now();
    if (currentTime - lastRightClickTime <= doubleClickThreshold) {
      // Double right-click detected
      removeHoverPad(); // Remove the hover pad on double-right-click
      const isCorrupted = !node.classList.contains("node-corrupted");
      node.classList.toggle("node-corrupted", isCorrupted);
      await setNodeCorruptionState(app.actor, nodeIndex, isCorrupted);
      logger.debug(
        `Toggled corruption state for node ${nodeIndex} to ${
          isCorrupted ? "corrupted" : "not corrupted"
        }`
      );
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
        logger.debug(`Cannot roll for node ${nodeIndex}: Element is dormant`);
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
      const chatContent = await renderTemplate(
        "modules/my-elemental-module/templates/elemental-roll.hbs",
        {
          elementName: elementName,
          rollFormula: `1d6 + ${bonus}`,
          rollResult: roll.total,
          themeColor: themeColor,
        }
      );

      // Send the roll to chat with the custom template
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: app.actor }),
        content: chatContent,
      });

      logger.debug(
        `Rolled 1d6 + ${bonus} for node ${nodeIndex} (${elementName}): ${roll.total}`
      );
    });
  }

  // Add hover handler to display the node information pad
  node.addEventListener("mouseover", async (event) => {
    // Only show the hover pad if a feature is linked
    const featureId = node.dataset.featureId;
    if (!featureId) {
      logger.debug(
        `No feature linked to node ${nodeIndex}, skipping hover pad.`
      );
      return;
    }

    // Remove any existing hover pad to prevent overlap
    removeHoverPad();

    // Delay the hover pad appearance to prevent flickering
    hoverTimeout = setTimeout(async () => {
      // Get the node's information
      const elementName = nameElement.textContent || "Unknown Element";
      const isAwakened = !node.classList.contains("node-dormant");
      const isCorrupted = node.classList.contains("node-corrupted");
      let state = isAwakened ? "Awakened" : "Dormant";
      if (isCorrupted) {
        state += " (Corrupted)";
      }

      let featSummary = "No feat linked.";
      let description = "No description available.";
      if (featureId) {
        const feat =
          game.items.get(featureId) || app?.actor?.items.get(featureId);
        if (feat) {
          featSummary = feat.name || "Unknown Feat";
          description =
            feat.system?.description?.value || "No description available.";
          // Strip HTML tags from description for display
          description = description.replace(/<[^>]+>/g, "");
          // Truncate description if too long
          if (description.length > 100) {
            description = description.substring(0, 97) + "...";
          }
        }
      }

      // Create the hover pad
      hoverPad = document.createElement("div");
      hoverPad.classList.add("node-hover-pad");
      if (!isAwakened) {
        hoverPad.classList.add("node-dormant");
      }
      if (isCorrupted) {
        hoverPad.classList.add("node-corrupted");
      }
      hoverPad.style.setProperty(
        "--theme-color",
        await getThemeColor(app.actor)
      );
      hoverPad.innerHTML = `
        <div class="hover-pad-close">×</div>
        <div class="hover-pad-header">${elementName}</div>
        <div class="hover-pad-content">
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Feat:</strong> ${featSummary}</p>
          <p><strong>State:</strong> ${state}</p>
        </div>
      `;

      // Position the hover pad to the right of the node
      const rect = node.getBoundingClientRect();
      hoverPad.style.position = "absolute";
      hoverPad.style.left = `${rect.right + 10}px`;
      hoverPad.style.top = `${rect.top}px`;
      document.body.appendChild(hoverPad);
      logger.debug(`Displayed hover pad for node ${nodeIndex}:`, {
        elementName,
        description,
        featSummary,
        state,
      });

      // Add click event listener to the close button
      const closeButton = hoverPad.querySelector(".hover-pad-close");
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          removeHoverPad();
          logger.debug(
            `Hover pad for node ${nodeIndex} closed via close button`
          );
        });
      }

      // Remove the hover pad if the mouse leaves the hover pad itself
      hoverPad.addEventListener("mouseleave", () => {
        removeHoverPad();
        logger.debug(
          `Hover pad for node ${nodeIndex} removed via mouseleave on hover pad`
        );
      });
    }, 200); // 200ms delay to prevent flickering
  });

  // Remove the hover pad when the mouse leaves the node
  node.addEventListener("mouseout", (event) => {
    // Only remove the hover pad if the mouse is not moving into the hover pad itself
    const relatedTarget = event.relatedTarget;
    if (hoverPad && relatedTarget && hoverPad.contains(relatedTarget)) {
      return; // Mouse moved into the hover pad, don't remove it yet
    }
    removeHoverPad();
  });

  // Make the node draggable if it has a feature
  node.draggable = !!node.dataset.featureId;
}
