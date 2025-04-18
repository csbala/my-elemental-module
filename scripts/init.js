console.log("✅ Elemental Module loaded");
import { setupElementsTabHook } from "./hooks/render-elements-tab.js";

Hooks.once("init", async function () {
  console.log("🌟 Elemental System | Initializing...");
});

Hooks.on("renderActorSheet5eCharacter", setupElementsTabHook);
