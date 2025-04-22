/**
 * Sets up the closeActorSheet5eCharacter hook to save the active tab state on sheet closure.
 */
export function setupCloseHook() {
  Hooks.on("closeActorSheet5eCharacter", async (app, html) => {
    const activeTab =
      html.find('.tabs[data-group="primary"] a.active').attr("data-tab") ||
      "details";
    console.log("Sheet closing, saving active tab:", activeTab);
    await app.actor.setFlag("my-elemental-module", "activeTab", activeTab);
  });
}
