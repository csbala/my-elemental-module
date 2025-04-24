import { setNodeValue } from "../store/index.js";

/**
 * Attaches input event listeners to node input fields.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {ActorSheet} app - The application rendering the sheet.
 */
export function attachNodeInputListeners(mainCircle, app) {
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
