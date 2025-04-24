import { createTriangleNodes } from "../node-renderer.js";
import { getNodeCount, getNodeValues, getNodeFeatures, getNodeStates, getNodeCorruptionStates, getThemeColor } from "../store/index.js";
import { validateDomElements } from "./ui-config.js";
import { setupVortexLayer } from "./vortex-layer.js";
import { applyThemeColor } from "./render-utils.js";
import { createNodeCallbacks } from "./node-callbacks.js";
import { attachNodeInputListeners } from "./input-handlers.js";
import { setupColorPicker } from "./color-picker.js";
import { setupUpdateButton } from "./update-button.js";
import { setupTabHandlers } from "./tab-handlers.js";

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
  } catch (error) {
    console.error("Failed to configure node UI:", error);
  }
}
