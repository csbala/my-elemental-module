console.log("✅ Elemental Module loaded");

import { setupElementsTabHook } from "./hooks/render-elements-tab.js";

/**
 * Hook: init
 *
 * This hook runs once when Foundry VTT initializes the game environment.
 * It's a good place for initial setup, registrations, and logging.
 */
Hooks.once("init", async function () {
  console.log("🌟 Elemental System | Initializing...");
});

/**
 * Hook: renderActorSheet5eCharacter
 *
 * Fired each time a 5e character sheet is rendered.
 * We use this hook to inject the custom "Elements" tab into the actor sheet UI.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} html - The jQuery-wrapped HTML of the sheet.
 * @param {Object} data - The data context being used to render the sheet.
 */
Hooks.on("renderActorSheet5eCharacter", setupElementsTabHook);
