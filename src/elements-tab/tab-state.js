import { logger } from "../logger.js";

/**
 * Restores the active tab state in the character sheet.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} html - The jQuery-wrapped HTML content of the sheet.
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 * @param {jQuery} tabBody - The jQuery-wrapped tab body container.
 */
export async function restoreTabState(app, html, tabs, tabBody) {
  // Get the currently active tab from the UI
  const currentActiveTab = html
    .find('.tabs[data-group="primary"] a.active')
    .attr("data-tab");

  // Get the stored tab state from the actor's flags
  const storedActiveTab =
    (await app.actor.getFlag("my-elemental-module", "activeTab")) || "details";

  // Use Foundry's internal tab state (app._tabs) to determine the default tab
  const defaultTab = app._tabs?.[0]?.active || "details";

  // On the initial render, prioritize the default tab (usually "details") unless the user has explicitly set the tab in this session
  const finalActiveTab = currentActiveTab || app._activeTab || defaultTab;

  // Only use the stored tab if the default tab is "elements" and the stored tab matches (indicating a user preference)
  if (finalActiveTab !== "elements" || storedActiveTab !== "elements") {
    logger.debug(
      `Restoring active tab: ${finalActiveTab} (Default: ${defaultTab}, Current: ${currentActiveTab}, Stored: ${storedActiveTab}, App: ${app._activeTab})`
    );
    tabs.find("a").removeClass("active");
    tabBody.find(".tab").removeClass("active");
    tabs.find(`a[data-tab="${finalActiveTab}"]`).addClass("active");
    tabBody.find(`.tab[data-tab="${finalActiveTab}"]`).addClass("active");

    // Update the stored tab state to reflect the current tab
    await app.actor.setFlag("my-elemental-module", "activeTab", finalActiveTab);
  } else {
    logger.debug(
      `Restoring stored active tab: ${storedActiveTab} (Default: ${defaultTab}, Current: ${currentActiveTab}, App: ${app._activeTab})`
    );
    tabs.find("a").removeClass("active");
    tabBody.find(".tab").removeClass("active");
    tabs.find(`a[data-tab="${storedActiveTab}"]`).addClass("active");
    tabBody.find(`.tab[data-tab="${storedActiveTab}"]`).addClass("active");
  }

  app.activateTabs?.();
}
