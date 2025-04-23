import { createTriangleNodes } from "../core/node-renderer.js";
import {
  getNodeCount,
  setNodeCount,
  getNodeValues,
  setNodeValue,
} from "../core/node-store.js";

/**
 * Configures the node UI (circle, input, button) in the Elements tab.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} tabContent - The jQuery-wrapped tab content element.
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 */
export async function configureNodeUI(app, tabContent, tabs) {
  const mainCircle = tabContent[0].querySelector(".elemental-circle-container");
  const input = tabContent[0].querySelector("#nodeCountInput");
  const button = tabContent[0].querySelector("#updateNodesButton");

  if (mainCircle && input && button) {
    const savedCount = await getNodeCount(app.actor);
    const nodeValues = await getNodeValues(app.actor);
    createTriangleNodes(mainCircle, savedCount, nodeValues, savedCount);
    input.value = savedCount;

    // Add event listeners to node input fields
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

    button.removeEventListener("click", button._updateHandler); // Remove any existing listener
    button._updateHandler = async (event) => {
      event.preventDefault(); // Prevent form submission
      const count = parseInt(input.value);
      if (Number.isNaN(count) || count < 1 || count > 12) {
        input.style.borderColor = "red";
        return;
      }
      input.style.borderColor = "#00ffff";

      // Show loading state
      button.disabled = true;
      button.innerHTML = "Updating...";

      const previousCount = await getNodeCount(app.actor); // Get the previous node count
      await setNodeCount(app.actor, count);
      const updatedValues = await getNodeValues(app.actor); // Get updated values after node count change
      createTriangleNodes(mainCircle, count, updatedValues, previousCount);

      Hooks.call("elementalCircleUpdated", {
        container: mainCircle,
        nodeCount: count,
      });

      // Re-attach event listeners to new input fields
      const newNodeInputs = mainCircle.querySelectorAll(
        ".circle input[type='number']"
      );
      newNodeInputs.forEach((nodeInput) => {
        nodeInput.addEventListener("input", async (event) => {
          const nodeIndex = parseInt(event.target.dataset.nodeIndex, 10);
          const value = parseInt(event.target.value, 10);
          if (!isNaN(value)) {
            await setNodeValue(app.actor, nodeIndex, value);
          }
        });
      });

      // Force re-render
      await app.actor.setFlag("my-elemental-module", "activeTab", "elements");
      await app.render();

      // Reset button state
      button.disabled = false;
      button.innerHTML = "Update";
    };
    button.addEventListener("click", button._updateHandler);

    // Add a click handler to the tab button to store the active tab state
    tabs
      .find('a[data-tab="elements"]')
      .off("click.tabState")
      .on("click.tabState", async () => {
        await app.actor.setFlag("my-elemental-module", "activeTab", "elements");
      });
    // Add click handlers to other tabs to update the stored state
    tabs
      .find('a[data-tab!="elements"]')
      .off("click.tabState")
      .on("click.tabState", async (event) => {
        const tab = $(event.currentTarget).attr("data-tab");
        await app.actor.setFlag("my-elemental-module", "activeTab", tab);
      });
  } else {
    console.error("Failed to find required elements in tab content:", {
      mainCircle,
      input,
      button,
    });
  }
}
