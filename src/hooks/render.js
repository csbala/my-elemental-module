import { controlElementsTab } from "../elements-tab/tab-controller.js";

/**
 * Sets up the render hooks to inject the Elements tab into both PC and NPC character sheets.
 */
export function setupRenderHook() {
  // Hook for PC character sheets (ActorSheet5eCharacter)
  Hooks.on("renderActorSheet5eCharacter", async (app, html, data) => {
    console.log("Rendering Elements tab for PC sheet:", app.actor.name);
    await controlElementsTab(app, html);
  });

  // Hook for NPC character sheets (ActorSheet5eNPC)
  Hooks.on("renderActorSheet5eNPC", async (app, html, data) => {
    console.log("Rendering Elements tab for NPC sheet:", app.actor.name);
    await controlElementsTab(app, html);
  });
}
