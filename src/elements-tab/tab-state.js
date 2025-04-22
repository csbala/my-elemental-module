/**
 * Restores the active tab state in the character sheet.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} html - The jQuery-wrapped HTML content of the sheet.
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 * @param {jQuery} tabBody - The jQuery-wrapped tab body container.
 */
export async function restoreTabState(app, html, tabs, tabBody) {
  const storedActiveTab =
    (await app.actor.getFlag("my-elemental-module", "activeTab")) || "details";
  const activeTab =
    html.find('.tabs[data-group="primary"] a.active').attr("data-tab") ||
    storedActiveTab;
  const finalActiveTab = app._activeTab || activeTab;

  console.log("Restoring active tab:", finalActiveTab);
  tabs.find("a").removeClass("active");
  tabBody.find(".tab").removeClass("active");
  tabs.find(`a[data-tab="${finalActiveTab}"]`).addClass("active");
  tabBody.find(`.tab[data-tab="${finalActiveTab}"]`).addClass("active");

  app.activateTabs?.();
}
