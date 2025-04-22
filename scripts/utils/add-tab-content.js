import { createTriangleNodes } from "./load-circle-ui.js";
import { getNodeCount, setNodeCount } from "./node-store.js";

const MODULE_PATH = "modules/my-elemental-module";

/**
 * Injects the "Elements" tab content into the actor sheet and initializes the interactive UI.
 *
 * This function renders the Handlebars template for the Elements tab, appends it to the `.tab-body`
 * container, and sets up the node UI based on the actor's saved element count. It also binds an
 * event listener to the update button to allow dynamic node rendering and persistence.
 *
 * @async
 * @function addTabContent
 * @param {JQuery} tabBody - The jQuery-wrapped element representing the `.tab-body` container
 *                           where new tab content should be injected.
 * @param {Actor5e} actor - The Foundry VTT actor object whose node count is stored and modified.
 */
export async function addTabContent(tabBody, actor) {
  try {
    const html = await renderTemplate(
      `${MODULE_PATH}/templates/elements-tab.hbs`
    );
    const tabContent = $(`
      <div class="tab" data-tab="elements" data-group="primary">
        ${html}
      </div>
    `);

    tabBody.append(tabContent);
    console.log("✅ Tab content added to .tab-body");

    // Dynamically generate the nodes based on input
    const mainCircle = tabContent[0].querySelector(
      ".elemental-circle-container"
    );
    const input = tabContent[0].querySelector("#nodeCountInput");
    const button = tabContent[0].querySelector("#updateNodesButton");

    if (!mainCircle || !input || !button) {
      console.error("Failed to find required elements in tab content:", {
        mainCircle,
        input,
        button,
      });
      return;
    }

    const savedCount = await getNodeCount(actor);

    // Initial render
    createTriangleNodes(mainCircle, savedCount);
    input.value = savedCount;

    button.addEventListener("click", async () => {
      const count = parseInt(input.value);
      if (Number.isNaN(count) || count < 1 || count > 12) {
        console.warn("Invalid node count:", count);
        input.style.borderColor = "red";
        return;
      }
      input.style.borderColor = "#00ffff"; // Reset to default
      createTriangleNodes(mainCircle, count);
      await setNodeCount(actor, count);

      Hooks.call("elementalCircleUpdated", {
        container: mainCircle,
        nodeCount: count,
      });
    });
  } catch (error) {
    console.error("Failed to render Elements tab content:", error);
  }
}
