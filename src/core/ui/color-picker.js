import { setThemeColor } from "../store/index.js";
import { forceRender } from "./render-utils.js";

/**
 * Sets up the color picker's change handler.
 *
 * @param {HTMLElement} colorPicker - The color picker input.
 * @param {ActorSheet} app - The application rendering the sheet.
 */
export function setupColorPicker(colorPicker, app) {
  colorPicker.addEventListener("change", async (event) => {
    const newColor = event.target.value;
    await setThemeColor(app.actor, newColor);
    await forceRender(app);
  });
}
