import { createTriangleNodes } from "../core/node-renderer.js";
import { getNodeCount, setNodeCount } from "../core/node-store.js";

/**
 * Sets up the node UI (circle, input, button) in the Elements tab.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} tabContent - The jQuery-wrapped tab content element.
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 */
export async function setupNodeUI(app, tabContent, tabs) {
  const mainCircle = tabContent[0].querySelector(".elemental-circle-container");
  const input = tabContent[0].querySelector("#nodeCountInput");
  const button = tabContent[0].querySelector("#updateNodesButton");

  if (mainCircle && input && button) {
    const savedCount = await getNodeCount(app.actor);
    createTriangleNodes(mainCircle, savedCount);
    input.value = savedCount;

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

      createTriangleNodes(mainCircle, count);
      await setNodeCount(app.actor, count);

      Hooks.call("elementalCircleUpdated", {
        container: mainCircle,
        nodeCount: count,
      });

      // Store the active tab state and force re-render
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
