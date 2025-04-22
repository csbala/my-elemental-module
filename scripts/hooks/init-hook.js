/**
 * Sets up the init hook for the Elemental Module.
 */
export function setupInitHook() {
  Hooks.once("init", async function () {
    console.log("🌟 Elemental System | Initializing...");
  });
}
