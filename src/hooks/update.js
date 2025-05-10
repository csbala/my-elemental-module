/**
 * Sets up the updateActor hook to force a re-render only if the update is relevant to the Elemental tab.
 */
export function setupUpdateHook() {
  Hooks.on("updateActor", async (actor, updateData, options, userId) => {
    const sheet = actor.sheet;
    if (!sheet || !sheet.rendered) {
      console.log(
        `Actor updated, but sheet is not rendered for ${actor.type} sheet: ${actor.name}`
      );
      return;
    }

    // Check if the update is relevant to the Elemental tab (e.g., changes to node-related flags)
    const isElementalUpdate = updateData.flags?.["my-elemental-module"];

    // Check if the Elemental tab is currently active
    const activeTab = sheet.element
      ?.find('.tabs[data-group="primary"] a.active')
      .attr("data-tab");
    const storedTab = await actor.getFlag("my-elemental-module", "activeTab");
    const isElementalTabActive =
      activeTab === "elements" || storedTab === "elements";

    if (isElementalUpdate || isElementalTabActive) {
      console.log(
        `Actor updated, forcing re-render for ${actor.type} sheet: ${
          actor.name
        } (Elemental update: ${!!isElementalUpdate}, Elemental tab active: ${isElementalTabActive}, Active tab: ${activeTab}, Stored tab: ${storedTab})`
      );
      await sheet.render();
    } else {
      console.log(
        `Actor updated, skipping re-render for ${actor.type} sheet: ${actor.name} (Not an Elemental update, and Elemental tab not active, Active tab: ${activeTab}, Stored tab: ${storedTab})`
      );
    }
  });
}
