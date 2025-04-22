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

  // Get the stored active tab from the Actor's flags
  const storedActiveTab =
    (await app.actor.getFlag("my-elemental-module", "activeTab")) || "details";
  // Determine the currently active tab from the DOM, falling back to the stored value
  const activeTab =
    html.find('.tabs[data-group="primary"] a.active').attr("data-tab") ||
    storedActiveTab;

  const tabs = html.find('.tabs[data-group="primary"]');
  const tabBody = html.find(".tab-body");

  // Add the tab button if it doesn't exist
  if (!tabs.find('[data-tab="elements"]').length) {
    const tabButton = $(`
      <a class="item control" data-tab="elements" data-tooltip="DND5E.Elements" aria-label="Elements">
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
          await app.actor.setFlag(
            "my-elemental-module",
            "activeTab",
            "elements"
          );
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

  // Restore the active tab state
  const finalActiveTab = app._activeTab || activeTab;
  console.log("Restoring active tab:", finalActiveTab);
  tabs.find("a").removeClass("active");
  tabBody.find(".tab").removeClass("active");
  tabs.find(`a[data-tab="${finalActiveTab}"]`).addClass("active");
  tabBody.find(`.tab[data-tab="${finalActiveTab}"]`).addClass("active");

  app.activateTabs?.();
}, 100);

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

/**
 * Hook: closeActorSheet5eCharacter
 *
 * Fired when the character sheet is closed.
 * Ensures the active tab state is saved.
 */
Hooks.on("closeActorSheet5eCharacter", async (app, html) => {
  const activeTab =
    html.find('.tabs[data-group="primary"] a.active').attr("data-tab") ||
    "details";
  console.log("Sheet closing, saving active tab:", activeTab);
  await app.actor.setFlag("my-elemental-module", "activeTab", activeTab);
});
