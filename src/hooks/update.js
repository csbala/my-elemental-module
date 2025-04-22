/**
 * Sets up the updateActor hook to force a re-render after an Actor update.
 */
export function setupUpdateHook() {
  Hooks.on("updateActor", async (actor, updateData, options, userId) => {
    const sheet = actor.sheet;
    if (sheet && sheet.rendered) {
      console.log(
        "Actor updated, forcing re-render to preserve Elements tab..."
      );
      await sheet.render();
    }
  });
}
