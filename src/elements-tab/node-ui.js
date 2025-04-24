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
} from "../core/node-store.js";

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
    input: {
      validBorder: "#00ffff",
      invalidBorder: "red",
    },
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
 * @throws {Error} If any required element is missing.
 */
function validateDomElements(mainCircle, input, button) {
  if (!mainCircle || !input || !button) {
    throw new Error("Missing required DOM elements", {
      mainCircle,
      input,
      button,
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
  const nodeInputs = mainCircle.querySelectorAll(
    ".circle input[type='number']"
  );
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
    console.log(
      `Dropping feature ${item.name} (ID: ${item.id}) onto node ${nodeIndex}`
    );

    // Remove existing feature if present
    const currentFeatures = await getNodeFeatures(app.actor);
    if (currentFeatures[nodeIndex]) {
      console.log(`Node ${nodeIndex} already has a feature. Replacing it.`);
      await app.actor.deleteEmbeddedDocuments("Item", [
        currentFeatures[nodeIndex],
      ]);
    }

    // Add the feature to the character sheet
    const ownedItem = await app.actor.createEmbeddedDocuments("Item", [
      item.toObject(),
    ]);
    const featureId = ownedItem[0].id;
    console.log(`Feature added to character sheet with ID: ${featureId}`);

    // Update the node's feature ID
    await setNodeFeature(app.actor, nodeIndex, featureId);
    console.log(`Feature ID ${featureId} set for node ${nodeIndex}`);

    await forceRender(app);
  };

  const onFeatureRemove = async (nodeIndex) => {
    console.log(`Removing feature from node ${nodeIndex}`);
    const features = await getNodeFeatures(app.actor);
    const featureId = features[nodeIndex];
    if (!featureId) {
      console.log(`No feature to remove from node ${nodeIndex}`);
      return;
    }

    // Remove the feature from the character sheet
    await app.actor.deleteEmbeddedDocuments("Item", [featureId]);
    console.log(`Feature ${featureId} removed from character sheet.`);

    // Clear the feature from the node
    await setNodeFeature(app.actor, nodeIndex, null);
    console.log(`Feature cleared from node ${nodeIndex}`);

    await forceRender(app);
  };

  const onStateToggle = async (nodeIndex, isAwakened) => {
    console.log(
      `Toggling state for node ${nodeIndex} to ${
        isAwakened ? "awakened" : "dormant"
      }`
    );
    await setNodeState(app.actor, nodeIndex, isAwakened);
    await forceRender(app);
  };

  return { onFeatureDrop, onFeatureRemove, onStateToggle };
}

/**
 * Sets up the update button's click handler.
 *
 * @param {HTMLElement} button - The update button.
 * @param {HTMLElement} input - The input field for node count.
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {Object} callbacks - The callback functions for node interactions.
 */
function setupUpdateButton(button, input, mainCircle, app, callbacks) {
  // Remove any existing listener
  button.removeEventListener("click", button._updateHandler);

  button._updateHandler = async (event) => {
    event.preventDefault();

    const count = parseInt(input.value);
    if (
      Number.isNaN(count) ||
      count < UI_CONFIG.nodeCount.min ||
      count > UI_CONFIG.nodeCount.max
    ) {
      input.style.borderColor = UI_CONFIG.styles.input.invalidBorder;
      return;
    }
    input.style.borderColor = UI_CONFIG.styles.input.validBorder;

    // Show loading state
    button.disabled = true;
    button.innerHTML = UI_CONFIG.styles.button.loadingText;

    const previousCount = await getNodeCount(app.actor);
    await setNodeCount(app.actor, count);
    const updatedValues = await getNodeValues(app.actor);
    const updatedFeatures = await getNodeFeatures(app.actor);
    const updatedStates = await getNodeStates(app.actor);

    createTriangleNodes(
      mainCircle,
      count,
      updatedValues,
      updatedFeatures,
      updatedStates,
      previousCount,
      { app, ...callbacks }
    );

    Hooks.call("elementalCircleUpdated", {
      container: mainCircle,
      nodeCount: count,
    });

    // Re-attach event listeners to new input fields
    attachNodeInputListeners(mainCircle, app);

    // Force re-render
    await forceRender(app);

    // Reset button state
    button.disabled = false;
    button.innerHTML = UI_CONFIG.styles.button.defaultText;
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
    });

  tabs
    .find('a[data-tab!="elements"]')
    .off("click.tabState")
    .on("click.tabState", async (event) => {
      const tab = $(event.currentTarget).attr("data-tab");
      await app.actor.setFlag(UI_CONFIG.moduleName, "activeTab", tab);
    });
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
    const input = tabContent[0].querySelector("#nodeCountInput");
    const button = tabContent[0].querySelector("#updateNodesButton");
    validateDomElements(mainCircle, input, button);

    // Step 2: Load initial node data
    const savedCount = await getNodeCount(app.actor);
    const nodeValues = await getNodeValues(app.actor);
    const nodeFeatures = await getNodeFeatures(app.actor);
    const nodeStates = await getNodeStates(app.actor);

    // Step 3: Setup the vortex layer
    setupVortexLayer(mainCircle);

    // Step 4: Create node interaction callbacks
    const callbacks = createNodeCallbacks(app);

    // Step 5: Render initial nodes
    createTriangleNodes(
      mainCircle,
      savedCount,
      nodeValues,
      nodeFeatures,
      nodeStates,
      savedCount,
      { app, ...callbacks }
    );
    input.value = savedCount;

    // Step 6: Attach event listeners
    attachNodeInputListeners(mainCircle, app);
    setupUpdateButton(button, input, mainCircle, app, callbacks);
    setupTabHandlers(tabs, app);
  } catch (error) {
    console.error("Failed to configure node UI:", error);
  }
}
