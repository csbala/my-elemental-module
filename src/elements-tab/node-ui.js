import { createTriangleNodes } from "../core/node-renderer.js";
import { getNodeCount, setNodeCount, getNodeValues, setNodeValue, getNodeFeatures, setNodeFeature, getNodeStates, setNodeState, getThemeColor, setThemeColor, getNodeCorruptionStates } from "../core/node-store.js";

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
 * @param {HTMLElement} input - The input field for node count.
 * @param {HTMLElement} button - The update button.
 * @param {HTMLElement} colorPicker - The color picker input.
 * @throws {Error} If any required element is missing.
 */
function validateDomElements(mainCircle, input, button, colorPicker) {
  if (!mainCircle || !input || !button || !colorPicker) {
    throw new Error("Missing required DOM elements", { mainCircle, input, button, colorPicker });
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
 * Forces a re-render of the actor sheet with the elements tab active.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 */
async function forceRender(app) {
  await app.actor.setFlag(UI_CONFIG.moduleName, "activeTab", "elements");
  await app.render();
  console.log("Re-rendered sheet.");
}

/**
 * Attaches input event listeners to node input fields.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {ActorSheet} app - The application rendering the sheet.
 */
function attachNodeInputListeners(mainCircle, app) {
  const nodeInputs = mainCircle.querySelectorAll(".circle input[type='number']");
  nodeInputs.forEach((nodeInput) => {
    nodeInput.addEventListener("input", async (event) => {
      const nodeIndex = parseInt(event.target.dataset.nodeIndex, 10);
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value)) {
        await setNodeValue(app.actor, nodeIndex, value);
      }
    });
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
    console.log(`🔽 Dropping feature ${item.name} (ID: ${item.id}) onto node ${nodeIndex}`);

    // Remove existing feature if present
    const currentFeatures = await getNodeFeatures(app.actor);
    console.log(`Current features on actor:`, currentFeatures);
    if (currentFeatures[nodeIndex]) {
      console.log(`Node ${nodeIndex} already has a feature with ID: ${currentFeatures[nodeIndex]}. Replacing it.`);
      const existingFeature = app.actor.items.get(currentFeatures[nodeIndex]);
      if (existingFeature) {
        try {
          await app.actor.deleteEmbeddedDocuments("Item", [currentFeatures[nodeIndex]]);
          console.log(`Successfully deleted existing feature ${currentFeatures[nodeIndex]} from character sheet.`);
        } catch (error) {
          console.error(`Failed to delete existing feature ${currentFeatures[nodeIndex]} from character sheet:`, error);
        }
      } else {
        console.log(`Existing feature ${currentFeatures[nodeIndex]} not found on character sheet, skipping deletion.`);
      }
    }

    // Check if the item already exists on the character sheet
    let featureId = item.id;
    const existingItem = app.actor.items.find((i) => i.id === item.id || (i.name === item.name && i.type === item.type));
    console.log(`Checking for existing item on character sheet:`, existingItem);

    if (existingItem) {
      // Item already exists on the character sheet, use its ID
      featureId = existingItem.id;
      console.log(`Feature ${item.name} (ID: ${featureId}) already exists on character sheet. Using existing feature.`);
    } else if (item.parent && item.parent !== app.actor) {
      // Item is owned by another actor; create a copy but don't add to Features tab
      console.log("Item is owned by another actor. Creating a copy without adding to Features tab.");
      const itemData = item.toObject();
      featureId = itemData._id;
    } else {
      // Item is unowned (e.g., from the Items Directory); use its ID directly
      console.log("Item is unowned. Using directly without adding to Features tab.");
      featureId = item.id;
    }

    // Log the current state of the Features tab
    const featuresTabItems = app.actor.items.filter((i) => i.type === "feat").map((i) => ({ id: i.id, name: i.name }));
    console.log(`Features tab contents after drop (before setting feature):`, featuresTabItems);

    // Update the node's feature ID without adding to Features tab
    await setNodeFeature(app.actor, nodeIndex, featureId);
    console.log(`Feature ID ${featureId} set for node ${nodeIndex}`);

    // Log the Features tab again to confirm no addition
    const updatedFeaturesTabItems = app.actor.items.filter((i) => i.type === "feat").map((i) => ({ id: i.id, name: i.name }));
    console.log(`Features tab contents after drop (after setting feature):`, updatedFeaturesTabItems);

    await forceRender(app);
  };

  const onFeatureRemove = async (nodeIndex) => {
    console.log(`🔼 Removing feature from node ${nodeIndex}`);
    const features = await getNodeFeatures(app.actor);
    console.log(`Current features on actor:`, features);
    const featureId = features[nodeIndex];
    if (!featureId) {
      console.log(`No feature to remove from node ${nodeIndex}`);
      return;
    }

    // Log the current state of the Features tab
    const featuresTabItems = app.actor.items.filter((i) => i.type === "feat").map((i) => ({ id: i.id, name: i.name }));
    console.log(`Features tab contents before removal:`, featuresTabItems);

    // Try to find the feature by its ID
    let feature = app.actor.items.get(featureId);
    let featureName = "Unknown";

    if (feature) {
      featureName = feature.name;
      try {
        await app.actor.deleteEmbeddedDocuments("Item", [featureId]);
        console.log(`Feature ${featureId} (Name: ${featureName}) successfully removed from character sheet by ID.`);
        ui.notifications.info(`Removed feature "${featureName}" from character sheet.`);
      } catch (error) {
        console.error(`Failed to remove feature ${featureId} (Name: ${featureName}) from character sheet by ID:`, error);
        ui.notifications.error(`Failed to remove feature from character sheet: ${error.message}`);
      }
    } else {
      console.log(`Feature ${featureId} not found on character sheet by ID, attempting to find by name...`);
      // If the feature isn't found by ID, try to find it by name
      const featToRemove = game.items.get(featureId) || app.actor.items.find((i) => i.id === featureId);
      if (featToRemove) {
        featureName = featToRemove.name;
        const matchingFeature = app.actor.items.find((i) => i.name === featToRemove.name && i.type === "feat");
        if (matchingFeature) {
          try {
            await app.actor.deleteEmbeddedDocuments("Item", [matchingFeature.id]);
            console.log(`Feature ${matchingFeature.id} (Name: ${featureName}) successfully removed from character sheet by name.`);
            ui.notifications.info(`Removed feature "${featureName}" from character sheet.`);
          } catch (error) {
            console.error(`Failed to remove feature ${matchingFeature.id} (Name: ${featureName}) from character sheet by name:`, error);
            ui.notifications.error(`Failed to remove feature from character sheet: ${error.message}`);
          }
        } else {
          console.log(`No feature with name ${featureName} found on character sheet.`);
        }
      } else {
        console.log(`Could not retrieve feature details for ID ${featureId} to match by name.`);
      }
    }

    // Clear the feature from the node
    await setNodeFeature(app.actor, nodeIndex, null);
    console.log(`Feature cleared from node ${nodeIndex}`);

    // Log the Features tab again to confirm removal
    const updatedFeaturesTabItems = app.actor.items.filter((i) => i.type === "feat").map((i) => ({ id: i.id, name: i.name }));
    console.log(`Features tab contents after removal:`, updatedFeaturesTabItems);

    await forceRender(app);
  };

  const onStateToggle = async (nodeIndex, isAwakened) => {
    console.log(`🔄 Toggling state for node ${nodeIndex} to ${isAwakened ? "awakened" : "dormant"}`);
    await setNodeState(app.actor, nodeIndex, isAwakened);
    console.log(`Node ${nodeIndex} state updated to ${isAwakened ? "awakened" : "dormant"}`);
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
    console.log(`Theme color updated to ${newColor}`);
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
function setupUpdateButton(button, input, mainCircle, app, callbacks, themeColor) {
  button.removeEventListener("click", button._updateHandler);

  button._updateHandler = async (event) => {
    event.preventDefault();

    const count = parseInt(input.value);
    if (Number.isNaN(count) || count < UI_CONFIG.nodeCount.min || count > UI_CONFIG.nodeCount.max) {
      input.style.borderColor = themeColor;
      console.log(`Invalid node count: ${count}. Must be between ${UI_CONFIG.nodeCount.min} and ${UI_CONFIG.nodeCount.max}`);
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

    createTriangleNodes(mainCircle, count, updatedValues, updatedFeatures, updatedStates, updatedCorruptedStates, previousCount, themeColor, { app, ...callbacks });

    Hooks.call("elementalCircleUpdated", { container: mainCircle, nodeCount: count });

    attachNodeInputListeners(mainCircle, app);

    await forceRender(app);

    button.disabled = false;
    button.innerHTML = UI_CONFIG.styles.button.defaultText;
    console.log(`Updated node count to ${count}`);
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
      console.log("Tab state set to 'elements'");
    });

  tabs
    .find('a[data-tab!="elements"]')
    .off("click.tabState")
    .on("click.tabState", async (event) => {
      const tab = $(event.currentTarget).attr("data-tab");
      await app.actor.setFlag(UI_CONFIG.moduleName, "activeTab", tab);
      console.log(`Tab state set to '${tab}'`);
    });
}

/**
 * Applies the theme color to the DOM elements.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {HTMLElement} input - The input field for node count.
 * @param {string} themeColor - The theme color in hex format.
 */
function applyThemeColor(mainCircle, input, themeColor) {
  mainCircle.style.setProperty("--theme-color", themeColor);
  input.style.borderColor = themeColor;
  console.log(`Applied theme color: ${themeColor}`);
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
    const mainCircle = tabContent[0].querySelector(".elemental-circle-container");
    const input = tabContent[0].querySelector("#nodeCountInput");
    const button = tabContent[0].querySelector("#updateNodesButton");
    const colorPicker = tabContent[0].querySelector("#themeColorPicker");
    validateDomElements(mainCircle, input, button, colorPicker);

    // Step 2: Load initial node data, theme color, and corruption states
    const savedCount = await getNodeCount(app.actor);
    const nodeValues = await getNodeValues(app.actor);
    const nodeFeatures = await getNodeFeatures(app.actor);
    const nodeStates = await getNodeStates(app.actor);
    const nodeCorruptedStates = await getNodeCorruptionStates(app.actor);
    const themeColor = await getThemeColor(app.actor);
    console.log(`Loaded node data - Count: ${savedCount}, Values: ${nodeValues}, Features: ${nodeFeatures}, States: ${nodeStates}, Corrupted States: ${nodeCorruptedStates}, Theme Color: ${themeColor}`);

    // Step 3: Setup the vortex layer
    setupVortexLayer(mainCircle);

    // Step 4: Create node interaction callbacks
    const callbacks = createNodeCallbacks(app);

    // Step 5: Apply theme color to DOM
    applyThemeColor(mainCircle, input, themeColor);

    // Step 6: Render initial nodes with theme color and corruption states
    createTriangleNodes(mainCircle, savedCount, nodeValues, nodeFeatures, nodeStates, nodeCorruptedStates, savedCount, themeColor, { app, ...callbacks });
    input.value = savedCount;
    colorPicker.value = themeColor;

    // Step 7: Attach event listeners
    attachNodeInputListeners(mainCircle, app);
    setupUpdateButton(button, input, mainCircle, app, callbacks, themeColor);
    setupColorPicker(colorPicker, app);
    setupTabHandlers(tabs, app);
    console.log("Node UI configured successfully");
  } catch (error) {
    console.error("Failed to configure node UI:", error);
  }
}
