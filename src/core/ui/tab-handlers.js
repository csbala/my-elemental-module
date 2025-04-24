import { UI_CONFIG } from "./ui-config.js";

/**
 * Sets up tab click handlers to store the active tab state.
 *
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 * @param {ActorSheet} app - The application rendering the sheet.
 */
export function setupTabHandlers(tabs, app) {
  tabs
    .find('a[data-tab="elements"]')
    .off("click.tabState")
    .on("click.tabState", async () => {
      await app.actor.setFlag(UI_CONFIG.moduleName, "activeTab", "elements");
    });

  tabs
    .find('a[data-tab!="elements"]')
    .off("click.tabState")
    .on("click.tabState", async (event) => {
      const tab = $(event.currentTarget).attr("data-tab");
      await app.actor.setFlag(UI_CONFIG.moduleName, "activeTab", tab);
    });
}
