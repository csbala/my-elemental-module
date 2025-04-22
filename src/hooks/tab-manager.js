import { debounce } from "../utils/debounce.js";
import { injectTabButton, injectTabContent } from "../tab/tab-injector.js";
import { setupNodeUI } from "../tab/node-ui-manager.js";
import { manageTabState } from "../tab/tab-state-manager.js";

/**
 * Injects the Elements tab into the character sheet and manages its state.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} html - The jQuery-wrapped HTML content of the sheet.
 */
export const manageElementsTab = debounce(async (app, html) => {
  console.log("🛠️ Setting up Elements Tab...");

  const tabs = html.find('.tabs[data-group="primary"]');
  const tabBody = html.find(".tab-body");

  // Inject the tab button if it doesn't exist
  await injectTabButton(app, tabs);

  // Inject the tab content if it doesn't exist
  const tabContent = await injectTabContent(app, tabBody);

  // Setup the node UI (circle, input, button) if the content was injected
  if (tabContent) {
    await setupNodeUI(app, tabContent, tabs);
  }

  // Manage the active tab state
  await manageTabState(app, html, tabs, tabBody);
}, 100);
