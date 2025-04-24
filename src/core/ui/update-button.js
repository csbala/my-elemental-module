import { UI_CONFIG } from "./ui-config.js";
import { getNodeCount, setNodeCount, getNodeValues, getNodeFeatures, getNodeStates, getNodeCorruptionStates } from "../store/index.js";
import { createTriangleNodes } from "../node-renderer.js";
import { attachNodeInputListeners } from "./input-handlers.js";
import { forceRender } from "./render-utils.js";

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
export function setupUpdateButton(button, input, mainCircle, app, callbacks, themeColor) {
  button.removeEventListener("click", button._updateHandler);

  button._updateHandler = async (event) => {
    event.preventDefault();

    const count = parseInt(input.value);
    if (Number.isNaN(count) || count < UI_CONFIG.nodeCount.min || count > UI_CONFIG.nodeCount.max) {
      input.style.borderColor = themeColor;
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
  };

  button.addEventListener("click", button._updateHandler);
}
