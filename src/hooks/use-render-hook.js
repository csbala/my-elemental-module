import { manageElementsTab } from "./tab-manager.js";

/**
 * Sets up the renderActorSheet5eCharacter hook to inject the Elements tab.
 */
export function setupRenderHook() {
  Hooks.on("renderActorSheet5eCharacter", async (app, html, data) => {
    await manageElementsTab(app, html);
  });
}
