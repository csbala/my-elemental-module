import { debounce } from "../utils/debounce.js";
import {
  injectTabButton,
  injectTabContent,
} from "../elements-tab/tab-injector.js";
import { configureNodeUI } from "../elements-tab/node-ui.js";
import { restoreTabState } from "../elements-tab/tab-state.js";

/**
 * Controls the Elements tab in the character sheet, managing its injection and state.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} html - The jQuery-wrapped HTML content of the sheet.
 */
export const controlElementsTab = debounce(async (app, html) => {
  console.log("🛠️ Setting up Elements Tab...");

  const tabs = html.find('.tabs[data-group="primary"]');
  const tabBody = html.find(".tab-body");

  // Inject the tab button if it doesn't exist
  await injectTabButton(app, tabs);

  // Inject the tab content if it doesn't exist
  const tabContent = await injectTabContent(app, tabBody);

  // Configure the node UI (circle, input, button) if the content was injected
  if (tabContent) {
    await configureNodeUI(app, tabContent, tabs);
  }

  // Restore the active tab state
  await restoreTabState(app, html, tabs, tabBody);
}, 100);
