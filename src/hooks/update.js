import { logger } from "../logger.js";
/**
 * Sets up the updateActor hook to force a re-render only if the update is relevant to the Elemental tab.
 */
export function setupUpdateHook() {
  Hooks.on("updateActor", async (actor, updateData, options, userId) => {
    const sheet = actor.sheet;
    if (!sheet || !sheet.rendered) {
      logger.debug(
        `Actor updated, but sheet is not rendered for ${actor.type} sheet: ${actor.name}`
      );
      return;
    }

    // Check if the update is relevant to the Elemental tab (e.g., changes to node-related flags)
    const isElementalUpdate = updateData.flags?.["my-elemental-module"];

    // Skip re-rendering if the only change is to the activeTab flag (set by restoreTabState)
    if (
      isElementalUpdate &&
      Object.keys(updateData.flags["my-elemental-module"]).length === 1 &&
      updateData.flags["my-elemental-module"].activeTab !== undefined &&
      Object.keys(updateData).length === 1 // Ensure no other changes
    ) {
      logger.debug(
        `Actor updated, skipping re-render for ${actor.type} sheet: ${actor.name} (Only activeTab flag changed, no re-render needed)`
      );
      return;
    }

    // Check if the Elemental tab is currently active
    const activeTab = sheet.element
      ?.find('.tabs[data-group="primary"] a.active')
      .attr("data-tab");
    const storedTab = await actor.getFlag("my-elemental-module", "activeTab");
    const isElementalTabActive =
      activeTab === "elements" || storedTab === "elements";

    if (isElementalUpdate || isElementalTabActive) {
      logger.debug(
        `Actor updated, forcing re-render for ${actor.type} sheet: ${
          actor.name
        } (Elemental update: ${!!isElementalUpdate}, Elemental tab active: ${isElementalTabActive}, Active tab: ${activeTab}, Stored tab: ${storedTab})`
      );
      await sheet.render();
    } else {
      logger.debug(
        `Actor updated, skipping re-render for ${actor.type} sheet: ${actor.name} (Not an Elemental update, and Elemental tab not active, Active tab: ${activeTab}, Stored tab: ${storedTab})`
      );
    }
  });
}
