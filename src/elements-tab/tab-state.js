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

  // Prioritize the current active tab from the UI if it exists; otherwise, use the stored tab or app._activeTab
  const finalActiveTab = currentActiveTab || app._activeTab || storedActiveTab;

  console.log(
    `Restoring active tab: ${finalActiveTab} (Current: ${currentActiveTab}, Stored: ${storedActiveTab}, App: ${app._activeTab})`
  );
  tabs.find("a").removeClass("active");
  tabBody.find(".tab").removeClass("active");
  tabs.find(`a[data-tab="${finalActiveTab}"]`).addClass("active");
  tabBody.find(`.tab[data-tab="${finalActiveTab}"]`).addClass("active");

  app.activateTabs?.();
}
