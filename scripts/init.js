console.log("✅ Elemental Module loaded");

import { createTriangleNodes } from "./utils/load-circle-ui.js";
import { getNodeCount, setNodeCount } from "./utils/node-store.js";

/**
 * Hook: init
 *
 * This hook runs once when Foundry VTT initializes the game environment.
 */
Hooks.once("init", async function () {
  console.log("🌟 Elemental System | Initializing...");
});

// Debounce function to prevent multiple rapid re-renders
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Function to inject the Elements tab into the character sheet and manage active state.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} html - The jQuery-wrapped HTML content of the sheet.
 */
const injectElementsTab = debounce(async (app, html) => {
  console.log("🛠️ Setting up Elements Tab...");

  // Determine the currently active tab
  const activeTab =
    html.find('.tabs[data-group="primary"] a.active').attr("data-tab") ||
    "details";

  const tabs = html.find('.tabs[data-group="primary"]');
  const tabBody = html.find(".tab-body");

  // Add the tab button if it doesn't exist
  if (!tabs.find('[data-tab="elements"]').length) {
    const tabButton = $(`
      <a class="item control" data-tab="elements" title="Elements">
        <i class="fas fa-gem"></i>
      </a>
    `);
    tabs.append(tabButton);
    console.log("✨ Tab button added");
  }

  // Add the tab content if it doesn't exist
  if (!tabBody.find('.tab[data-tab="elements"]').length) {
    const htmlContent = await renderTemplate(
      "modules/my-elemental-module/templates/elements-tab.hbs"
    );
    const tabContent = $(`
      <div class="tab" data-tab="elements" data-group="primary">
        ${htmlContent}
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

        // Force re-render and preserve the active tab
        app._activeTab = "elements"; // Store the active tab state
        await app.render();

        // Reset button state
        button.disabled = false;
        button.innerHTML = "Update";
      };
      button.addEventListener("click", button._updateHandler);
    } else {
      console.error("Failed to find required elements in tab content:", {
        mainCircle,
        input,
        button,
      });
    }
  }

  // Restore the active tab state
  tabs.find("a").removeClass("active");
  tabBody.find(".tab").removeClass("active");
  tabs.find(`a[data-tab="${app._activeTab || activeTab}"]`).addClass("active");
  tabBody
    .find(`.tab[data-tab="${app._activeTab || activeTab}"]`)
    .addClass("active");

  app.activateTabs?.();
}, 50);

/**
 * Hook: renderActorSheet5eCharacter
 *
 * Fired each time a 5e character sheet is rendered.
 */
Hooks.on("renderActorSheet5eCharacter", async (app, html, data) => {
  await injectElementsTab(app, html);
});

/**
 * Hook: updateActor
 *
 * Fired when an Actor document is updated (e.g., after setFlag).
 * Forces a re-render to ensure the Elements tab persists.
 */
Hooks.on("updateActor", async (actor, updateData, options, userId) => {
  const sheet = actor.sheet;
  if (sheet && sheet.rendered) {
    console.log("Actor updated, forcing re-render to preserve Elements tab...");
    await sheet.render();
  }
});
