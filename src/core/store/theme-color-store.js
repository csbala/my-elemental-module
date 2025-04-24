import { STORE_CONFIG, getFlag, setFlag } from "./store-config.js";

/**
 * Retrieve the stored theme color for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @returns {Promise<string>} The theme color in hex format (e.g., "#00ffff").
 */
export async function getThemeColor(actor) {
  return await getFlag(actor, "themeColor", STORE_CONFIG.defaults.themeColor);
}

/**
 * Set or update the theme color for a specific actor.
 *
 * @param {Actor5e} actor - The Foundry VTT actor object.
 * @param {string} color - The color in hex format (e.g., "#00ffff").
 * @returns {Promise<void>}
 */
export async function setThemeColor(actor, color) {
  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    throw new Error(`Invalid color: ${color}. Must be a hex color (e.g., "#00ffff")`);
  }
  await setFlag(actor, "themeColor", color);
}
