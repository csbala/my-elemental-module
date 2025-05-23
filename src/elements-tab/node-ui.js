import { createTriangleNodes } from "../core/node-renderer.js";
import {
  getNodeCount,
  setNodeCount,
  getNodeValues,
  setNodeValue,
  getNodeFeatures,
  setNodeFeature,
  getNodeStates,
  setNodeState,
  getThemeColor,
  setThemeColor,
  getNodeCorruptionStates,
  getBurnLevel,
  setBurnLevel,
} from "../core/node-store.js";
import { logger } from "../logger.js";

/**
 * Configuration for the node UI, centralizing constants and defaults.
 */
const UI_CONFIG = {
  moduleName: "my-elemental-module",
  nodeCount: {
    min: 1,
    max: 12,
  },
  styles: {
    button: {
      loadingText: "Updating...",
      defaultText: "Update",
    },
  },
};

/**
 * Ensures required DOM elements are present.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {HTMLElement} nodeCountInput - The input field for node count.
 * @param {HTMLElement} burnLevelInput - The input field for burn level.
 * @param {HTMLElement} button - The update button.
 * @param {HTMLElement} colorPicker - The color picker input.
 * @throws {Error} If any required element is missing.
 */
function validateDomElements(
  mainCircle,
  nodeCountInput,
  burnLevelInput,
  button,
  colorPicker
) {
  if (
    !mainCircle ||
    !nodeCountInput ||
    !burnLevelInput ||
    !button ||
    !colorPicker
  ) {
    throw new Error("Missing required DOM elements", {
      mainCircle,
      nodeCountInput,
      burnLevelInput,
      button,
      colorPicker,
    });
  }
}

/**
 * Sets up the vortex-circles layer if it doesn't exist.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 */
function setupVortexLayer(mainCircle) {
  let vortexCircles = mainCircle.querySelector(".vortex-circles");
  if (!vortexCircles) {
    vortexCircles = document.createElement("div");
    vortexCircles.classList.add("vortex-circles");
    mainCircle.appendChild(vortexCircles);
  }
}

/**
 * Forces a re-render of the actor sheet without changing the active tab.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 */
async function forceRender(app) {
  await app.render();
  logger.debug(
    `Re-rendered ${app.actor.type} sheet: ${app.actor.name} without changing active tab`
  );
}

/**
 * Attaches change event listeners to node input fields.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {ActorSheet} app - The application rendering the sheet.
 */
function attachNodeInputListeners(mainCircle, app) {
  const nodeInputs = mainCircle.querySelectorAll(
    ".circle input[type='number']"
  );
  nodeInputs.forEach((nodeInput) => {
    nodeInput.addEventListener("change", async (event) => {
      const nodeIndex = parseInt(event.target.dataset.nodeIndex, 10);
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value)) {
        await setNodeValue(app.actor, nodeIndex, value);
        logger.debug(
          `Node ${nodeIndex} bonus updated to ${value} for ${app.actor.type} sheet: ${app.actor.name}`
        );
      } else {
        // Reset to the last valid value if the input is invalid
        const savedValue = (await getNodeValues(app.actor))[nodeIndex] || 0;
        nodeInput.value = savedValue;
        logger.debug(
          `Invalid node bonus input for node ${nodeIndex}, reset to ${savedValue} for ${app.actor.type} sheet: ${app.actor.name}`
        );
      }
    });
  });
}

/**
 * Sets up the burn level input's change handler.
 *
 * @param {HTMLElement} burnLevelInput - The burn level input field.
 * @param {ActorSheet} app - The application rendering the sheet.
 */
function setupBurnLevelInput(burnLevelInput, app) {
  burnLevelInput.addEventListener("change", async (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      await setBurnLevel(app.actor, value);
      logger.debug(
        `Burn level updated to ${value} for ${app.actor.type} sheet: ${app.actor.name}`
      );
    } else {
      // Reset to the last valid value if the input is invalid
      const savedBurnLevel = await getBurnLevel(app.actor);
      burnLevelInput.value = savedBurnLevel;
      logger.debug(
        `Invalid burn level input, reset to ${savedBurnLevel} for ${app.actor.type} sheet: ${app.actor.name}`
      );
    }
  });
}

/**
 * Creates the callback handlers for drag-and-drop and state toggle.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @returns {Object} The callback functions.
 */
function createNodeCallbacks(app) {
  const onFeatureDrop = async (nodeIndex, item) => {
    logger.debug(
      `🔽 Dropping feature ${item.name} (ID: ${item.id}) onto node ${nodeIndex} for ${app.actor.type} sheet: ${app.actor.name}`
    );

    // Remove existing feature if present
    const currentFeatures = await getNodeFeatures(app.actor);
    logger.debug(`Current features on actor:`, currentFeatures);
    if (currentFeatures[nodeIndex]) {
      logger.debug(
        `Node ${nodeIndex} already has a feature with ID: ${currentFeatures[nodeIndex]}. Replacing it.`
      );
      const existingFeature = app.actor.items.get(currentFeatures[nodeIndex]);
      if (existingFeature) {
        try {
          await app.actor.deleteEmbeddedDocuments("Item", [
            currentFeatures[nodeIndex],
          ]);
          logger.debug(
            `Successfully deleted existing feature ${currentFeatures[nodeIndex]} from ${app.actor.type} sheet.`
          );
        } catch (error) {
          logger.error(
            `Failed to delete existing feature ${currentFeatures[nodeIndex]} from ${app.actor.type} sheet:`,
            error
          );
        }
      } else {
        logger.debug(
          `Existing feature ${currentFeatures[nodeIndex]} not found on ${app.actor.type} sheet, skipping deletion.`
        );
      }
    }

    // Check if the item already exists on the character sheet
    let featureId = item.id;
    const existingItem = app.actor.items.find(
      (i) => i.id === item.id || (i.name === item.name && i.type === item.type)
    );
    logger.debug(
      `Checking for existing item on ${app.actor.type} sheet:`,
      existingItem
    );

    if (existingItem) {
      // Item already exists on the character sheet, use its ID
      featureId = existingItem.id;
      logger.debug(
        `Feature ${item.name} (ID: ${featureId}) already exists on ${app.actor.type} sheet. Using existing feature.`
      );
    } else if (item.parent && item.parent !== app.actor) {
      // Item is owned by another actor; create a copy but don't add to Features tab
      logger.debug(
        "Item is owned by another actor. Creating a copy without adding to Features tab."
      );
      const itemData = item.toObject();
      featureId = itemData._id;
    } else {
      // Item is unowned (e.g., from the Items Directory); use its ID directly
      logger.debug(
        "Item is unowned. Using directly without adding to Features tab."
      );
      featureId = item.id;
    }

    // Log the current state of the Features tab
    const featuresTabItems = app.actor.items
      .filter((i) => i.type === "feat")
      .map((i) => ({ id: i.id, name: i.name }));
    logger.debug(
      `Features tab contents after drop (before setting feature) for ${app.actor.type} sheet:`,
      featuresTabItems
    );

    // Update the node's feature ID without adding to Features tab
    await setNodeFeature(app.actor, nodeIndex, featureId);
    logger.debug(`Feature ID ${featureId} set for node ${nodeIndex}`);

    // Log the Features tab again to confirm no addition
    const updatedFeaturesTabItems = app.actor.items
      .filter((i) => i.type === "feat")
      .map((i) => ({ id: i.id, name: i.name }));
    logger.debug(
      `Features tab contents after drop (after setting feature) for ${app.actor.type} sheet:`,
      updatedFeaturesTabItems
    );

    await forceRender(app);
  };

  const onFeatureRemove = async (nodeIndex) => {
    logger.debug(
      `🔼 Removing feature from node ${nodeIndex} for ${app.actor.type} sheet: ${app.actor.name}`
    );
    const features = await getNodeFeatures(app.actor);
    logger.debug(`Current features on actor:`, features);
    const featureId = features[nodeIndex];
    if (!featureId) {
      logger.debug(`No feature to remove from node ${nodeIndex}`);
      return;
    }

    // Log the current state of the Features tab
    const featuresTabItems = app.actor.items
      .filter((i) => i.type === "feat")
      .map((i) => ({ id: i.id, name: i.name }));
    logger.debug(
      `Features tab contents before removal for ${app.actor.type} sheet:`,
      featuresTabItems
    );

    // Try to find the feature by its ID
    let feature = app.actor.items.get(featureId);
    let featureName = "Unknown";

    if (feature) {
      featureName = feature.name;
      try {
        await app.actor.deleteEmbeddedDocuments("Item", [featureId]);
        logger.debug(
          `Feature ${featureId} (Name: ${featureName}) successfully removed from ${app.actor.type} sheet by ID.`
        );
        ui.notifications.info(
          `Removed feature "${featureName}" from ${app.actor.type} sheet.`
        );
      } catch (error) {
        logger.error(
          `Failed to remove feature ${featureId} (Name: ${featureName}) from ${app.actor.type} sheet by ID:`,
          error
        );
        ui.notifications.error(
          `Failed to remove feature from ${app.actor.type} sheet: ${error.message}`
        );
      }
    } else {
      logger.debug(
        `Feature ${featureId} not found on ${app.actor.type} sheet by ID, attempting to find by name...`
      );
      // If the feature isn't found by ID, try to find it by name
      const featToRemove =
        game.items.get(featureId) ||
        app.actor.items.find((i) => i.id === featureId);
      if (featToRemove) {
        featureName = featToRemove.name;
        const matchingFeature = app.actor.items.find(
          (i) => i.name === featToRemove.name && i.type === "feat"
        );
        if (matchingFeature) {
          try {
            await app.actor.deleteEmbeddedDocuments("Item", [
              matchingFeature.id,
            ]);
            logger.debug(
              `Feature ${matchingFeature.id} (Name: ${featureName}) successfully removed from ${app.actor.type} sheet by name.`
            );
            ui.notifications.info(
              `Removed feature "${featureName}" from ${app.actor.type} sheet.`
            );
          } catch (error) {
            logger.error(
              `Failed to remove feature ${matchingFeature.id} (Name: ${featureName}) from ${app.actor.type} sheet by name:`,
              error
            );
            ui.notifications.error(
              `Failed to remove feature from ${app.actor.type} sheet: ${error.message}`
            );
          }
        } else {
          logger.debug(
            `No feature with name ${featureName} found on ${app.actor.type} sheet.`
          );
        }
      } else {
        logger.debug(
          `Could not retrieve feature details for ID ${featureId} to match by name.`
        );
      }
    }

    // Clear the feature from the node
    await setNodeFeature(app.actor, nodeIndex, null);
    logger.debug(`Feature cleared from node ${nodeIndex}`);

    // Log the Features tab again to confirm removal
    const updatedFeaturesTabItems = app.actor.items
      .filter((i) => i.type === "feat")
      .map((i) => ({ id: i.id, name: i.name }));
    logger.debug(
      `Features tab contents after removal for ${app.actor.type} sheet:`,
      updatedFeaturesTabItems
    );

    await forceRender(app);
  };

  const onStateToggle = async (nodeIndex, isAwakened) => {
    logger.debug(
      `🔄 Toggling state for node ${nodeIndex} to ${
        isAwakened ? "awakened" : "dormant"
      } on ${app.actor.type} sheet: ${app.actor.name}`
    );
    await setNodeState(app.actor, nodeIndex, isAwakened);
    logger.debug(
      `Node ${nodeIndex} state updated to ${
        isAwakened ? "awakened" : "dormant"
      }`
    );
    await forceRender(app);
  };

  return { onFeatureDrop, onFeatureRemove, onStateToggle };
}

/**
 * Sets up the color picker's change handler.
 *
 * @param {HTMLElement} colorPicker - The color picker input.
 * @param {ActorSheet} app - The application rendering the sheet.
 */
function setupColorPicker(colorPicker, app) {
  colorPicker.addEventListener("change", async (event) => {
    const newColor = event.target.value;
    await setThemeColor(app.actor, newColor);
    logger.debug(
      `Theme color updated to ${newColor} for ${app.actor.type} sheet: ${app.actor.name}`
    );
    await forceRender(app);
  });
}

/**
 * Sets up the update button's click handler.
 *
 * @param {HTMLElement} button - The update button.
 * @param {HTMLElement} input - The input field for node count.
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {Object} callbacks - The callback functions for node interactions.
 * @param {string} themeColor - The current theme color.
 */
function setupUpdateButton(
  button,
  input,
  mainCircle,
  app,
  callbacks,
  themeColor
) {
  button.removeEventListener("click", button._updateHandler);

  button._updateHandler = async (event) => {
    event.preventDefault();

    const count = parseInt(input.value);
    if (
      Number.isNaN(count) ||
      count < UI_CONFIG.nodeCount.min ||
      count > UI_CONFIG.nodeCount.max
    ) {
      input.style.borderColor = themeColor;
      logger.debug(
        `Invalid node count: ${count}. Must be between ${UI_CONFIG.nodeCount.min} and ${UI_CONFIG.nodeCount.max} for ${app.actor.type} sheet: ${app.actor.name}`
      );
      return;
    }
    input.style.borderColor = themeColor;

    button.disabled = true;
    button.innerHTML = UI_CONFIG.styles.button.loadingText;

    const previousCount = await getNodeCount(app.actor);
    await setNodeCount(app.actor, count);
    const updatedValues = await getNodeValues(app.actor);
    const updatedFeatures = await getNodeFeatures(app.actor);
    const updatedStates = await getNodeStates(app.actor);
    const updatedCorruptedStates = await getNodeCorruptionStates(app.actor);

    createTriangleNodes(
      mainCircle,
      count,
      updatedValues,
      updatedFeatures,
      updatedStates,
      updatedCorruptedStates,
      previousCount,
      themeColor,
      { app, ...callbacks }
    );

    Hooks.call("elementalCircleUpdated", {
      container: mainCircle,
      nodeCount: count,
    });

    attachNodeInputListeners(mainCircle, app);

    await forceRender(app);

    button.disabled = false;
    button.innerHTML = UI_CONFIG.styles.button.defaultText;
    logger.debug(
      `Updated node count to ${count} for ${app.actor.type} sheet: ${app.actor.name}`
    );
  };

  button.addEventListener("click", button._updateHandler);
}

/**
 * Sets up tab click handlers to store the active tab state.
 *
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 * @param {ActorSheet} app - The application rendering the sheet.
 */
function setupTabHandlers(tabs, app) {
  tabs
    .find('a[data-tab="elements"]')
    .off("click.tabState")
    .on("click.tabState", async () => {
      await app.actor.setFlag(UI_CONFIG.moduleName, "activeTab", "elements");
      logger.debug(
        `Tab state set to 'elements' for ${app.actor.type} sheet: ${app.actor.name}`
      );
    });

  tabs
    .find('a[data-tab!="elements"]')
    .off("click.tabState")
    .on("click.tabState", async (event) => {
      const tab = $(event.currentTarget).attr("data-tab");
      await app.actor.setFlag(UI_CONFIG.moduleName, "activeTab", tab);
      logger.debug(
        `Tab state set to '${tab}' for ${app.actor.type} sheet: ${app.actor.name}`
      );
    });
}

/**
 * Applies the theme color to the DOM elements.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {HTMLElement} nodeCountInput - The input field for node count.
 * @param {string} themeColor - The theme color in hex format.
 */
function applyThemeColor(mainCircle, nodeCountInput, themeColor) {
  mainCircle.style.setProperty("--theme-color", themeColor);
  nodeCountInput.style.borderColor = themeColor;
  logger.debug(`Applied theme color: ${themeColor}`);
}

/**
 * Configures the node UI (circle, input, button) in the Elements tab.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} tabContent - The jQuery-wrapped tab content element.
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 */
export async function configureNodeUI(app, tabContent, tabs) {
  try {
    // Step 1: Retrieve DOM elements
    const mainCircle = tabContent[0].querySelector(
      ".elemental-circle-container"
    );
    const nodeCountInput = tabContent[0].querySelector("#nodeCountInput");
    const burnLevelInput = tabContent[0].querySelector("#burnLevelInput");
    const button = tabContent[0].querySelector("#updateNodesButton");
    const colorPicker = tabContent[0].querySelector("#themeColorPicker");
    const rulesInfo = tabContent[0].querySelector("#element-rules-info");
    validateDomElements(
      mainCircle,
      nodeCountInput,
      burnLevelInput,
      button,
      colorPicker
    );

    // Step 2: Load initial node data, theme color, burn level, and corruption states
    const savedCount = await getNodeCount(app.actor);
    const nodeValues = await getNodeValues(app.actor);
    const nodeFeatures = await getNodeFeatures(app.actor);
    const nodeStates = await getNodeStates(app.actor);
    const nodeCorruptedStates = await getNodeCorruptionStates(app.actor);
    const themeColor = await getThemeColor(app.actor);
    const burnLevel = await getBurnLevel(app.actor);
    logger.debug(
      `Loaded node data for ${app.actor.type} sheet: ${app.actor.name} - Count: ${savedCount}, Values: ${nodeValues}, Features: ${nodeFeatures}, States: ${nodeStates}, Corrupted States: ${nodeCorruptedStates}, Theme Color: ${themeColor}, Burn Level: ${burnLevel}`
    );

    // Step 3: Check if any Elements are awakened and toggle the rules info bubble
    const hasAwakenedElement = nodeStates.some((state) => state === true);
    if (rulesInfo) {
      rulesInfo.style.display = hasAwakenedElement ? "block" : "none";
      logger.debug(
        `Rules info bubble ${
          hasAwakenedElement ? "shown" : "hidden"
        } - Has awakened element: ${hasAwakenedElement} for ${
          app.actor.type
        } sheet: ${app.actor.name}`
      );
    }

    // Step 4: Setup the vortex layer
    setupVortexLayer(mainCircle);

    // Step 5: Create node interaction callbacks
    const callbacks = createNodeCallbacks(app);

    // Step 6: Apply theme color to DOM
    applyThemeColor(mainCircle, nodeCountInput, themeColor);

    // Step 7: Render initial nodes with theme color and corruption states
    createTriangleNodes(
      mainCircle,
      savedCount,
      nodeValues,
      nodeFeatures,
      nodeStates,
      nodeCorruptedStates,
      savedCount,
      themeColor,
      { app, ...callbacks }
    );
    nodeCountInput.value = savedCount;
    burnLevelInput.value = burnLevel;
    colorPicker.value = themeColor;

    // Step 8: Attach event listeners
    attachNodeInputListeners(mainCircle, app);
    setupUpdateButton(
      button,
      nodeCountInput,
      mainCircle,
      app,
      callbacks,
      themeColor
    );
    setupBurnLevelInput(burnLevelInput, app);
    setupColorPicker(colorPicker, app);
    setupTabHandlers(tabs, app);
    logger.debug(
      `Node UI configured successfully for ${app.actor.type} sheet: ${app.actor.name}`
    );
  } catch (error) {
    logger.error(
      `Failed to configure node UI for ${app.actor.type} sheet: ${app.actor.name}:`,
      error
    );
  }
}
