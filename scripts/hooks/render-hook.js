import { injectElementsTab } from "./tab-utils.js";

/**
 * Sets up the renderActorSheet5eCharacter hook to inject the Elements tab.
 */
export function setupRenderHook() {
  Hooks.on("renderActorSheet5eCharacter", async (app, html, data) => {
    await injectElementsTab(app, html);
  });
}
