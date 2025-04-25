/**
 * Sets up the close hooks to save the active tab state on sheet closure for both PC and NPC sheets.
 */
export function setupCloseHook() {
  // Hook for PC character sheets
  Hooks.on("closeActorSheet5eCharacter", async (app, html) => {
    const activeTab = html.find('.tabs[data-group="primary"] a.active').attr("data-tab") || "details";
    console.log(`Sheet closing, saving active tab: ${activeTab} for PC sheet: ${app.actor.name}`);
    await app.actor.setFlag("my-elemental-module", "activeTab", activeTab);
  });

  // Hook for NPC character sheets
  Hooks.on("closeActorSheet5eNPC", async (app, html) => {
    const activeTab = html.find('.tabs[data-group="primary"] a.active').attr("data-tab") || "details";
    console.log(`Sheet closing, saving active tab: ${activeTab} for NPC sheet: ${app.actor.name}`);
    await app.actor.setFlag("my-elemental-module", "activeTab", activeTab);
  });
}
