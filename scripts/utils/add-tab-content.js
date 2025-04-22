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
 *
 * Behavior:
 * - Renders the `elements-tab.hbs` template and wraps it in a `.tab[data-tab="elements"]` container.
 * - Appends the content to the actor sheet.
 * - Initializes the visual node circle using the saved node count.
 * - Updates the node display and storage when the user interacts with the "Update" button.
 * - Fires the `elementalCircleUpdated` hook to allow other modules to respond to the update.
 */
export async function addTabContent(tabBody, actor) {
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

  // Now dynamically generate the nodes based on input
  const mainCircle = tabContent[0].querySelector(".elemental-circle-container");
  const input = tabContent[0].querySelector("#nodeCountInput");
  const button = tabContent[0].querySelector("#updateNodesButton");

  const actorId = actor.uuid;
  const savedCount = getNodeCount(actorId);

  // Initial render
  createTriangleNodes(mainCircle, savedCount);
  input.value = savedCount;

  button.addEventListener("click", () => {
    const count = parseInt(input.value);
    if (Number.isNaN(count) || count < 1 || count > 12) return;
    createTriangleNodes(mainCircle, count);
    setNodeCount(actorId, count);

    Hooks.call("elementalCircleUpdated", {
      container: mainCircle,
      nodeCount: count,
    });
  });
}
