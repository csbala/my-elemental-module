import { logger } from "../logger.js";
/**
 * Injects the Elements tab button into the sheet's tab navigation.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 */
export async function injectTabButton(app, tabs) {
  if (!tabs.find('[data-tab="elements"]').length) {
    const tabButton = $(`
        <a class="item control" data-tab="elements" data-tooltip="Elemental Attributes" aria-label="Elements">
          <i class="fas fa-gem"></i>
        </a>
      `);
    tabs.append(tabButton);
    logger.debug(
      `✨ Tab button added to ${app.actor.type} sheet: ${app.actor.name}`
    );
  } else {
    logger.debug(
      `Tab button already exists on ${app.actor.type} sheet: ${app.actor.name}`
    );
  }
}

/**
 * Injects the Elements tab content into the sheet's tab body.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} tabBody - The jQuery-wrapped tab body container.
 * @returns {jQuery|null} - The injected tab content, or null if already present.
 */
export async function injectTabContent(app, tabBody) {
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
    logger.debug(
      `✅ Tab content added to .tab-body for ${app.actor.type} sheet: ${app.actor.name}`
    );
    return tabContent;
  }
  logger.debug(
    `Tab content already exists on ${app.actor.type} sheet: ${app.actor.name}`
  );
  return null;
}
