import { controlElementsTab } from "../elements-tab/tab-controller.js";

/**
 * Sets up the renderActorSheet5eCharacter hook to inject the Elements tab.
 */
export function setupRenderHook() {
  Hooks.on("renderActorSheet5eCharacter", async (app, html, data) => {
    await controlElementsTab(app, html);
  });
}
