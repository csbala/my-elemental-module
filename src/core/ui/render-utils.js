import { UI_CONFIG } from "./ui-config.js";

/**
 * Forces a re-render of the actor sheet with the elements tab active.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 */
export async function forceRender(app) {
  await app.actor.setFlag(UI_CONFIG.moduleName, "activeTab", "elements");
  await app.render();
  console.log("Re-rendered sheet.");
}

/**
 * Applies the theme color to the DOM elements.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {HTMLElement} input - The input field for node count.
 * @param {string} themeColor - The theme color in hex format.
 */
export function applyThemeColor(mainCircle, input, themeColor) {
  mainCircle.style.setProperty("--theme-color", themeColor);
  input.style.borderColor = themeColor;
}
