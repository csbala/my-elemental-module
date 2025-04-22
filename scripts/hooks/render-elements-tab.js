/**
 * Import utility function to add a new tab button for the Elemental Tab.
 * @module utils/add-tab-button
 */
import { addTabButton } from "../utils/add-tab-button.js";

/**
 * Import utility function to inject the HTML content of the Elemental Tab.
 * @module utils/add-tab-content
 */
import { addTabContent } from "../utils/add-tab-content.js";

/**
 * Hook handler to set up the Elemental Tab on an actor sheet.
 *
 * This function:
 * - Adds the tab navigation button to the tab bar
 * - Injects the custom tab content into the `.tab-body` container
 * - Rebinds the tab switching logic so the new tab can be interacted with
 *
 * @function setupElementsTabHook
 * @param {Application} app - The application instance of the ActorSheet being rendered
 * @param {JQuery} html - jQuery-wrapped HTML content of the actor sheet
 * @param {Object} data - Data context used for rendering the sheet
 */
export function setupElementsTabHook(app, html, data) {
  console.log("🛠️ Setting up Elements Tab...");

  const tabs = html.find('.tabs[data-group="primary"]');
  const tabBody = html.find(".tab-body");

  addTabButton(tabs);
  addTabContent(tabBody, app.actor);
}
