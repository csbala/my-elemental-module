import { createTriangleNodes } from "../core/node-renderer.js";
import {
  getNodeCount,
  setNodeCount,
  getNodeValues,
  setNodeValue,
  getNodeFeatures,
  setNodeFeature,
  getNodeStates,
  setNodeState,
} from "../core/node-store.js";

/**
 * Configures the node UI (circle, input, button) in the Elements tab.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @param {jQuery} tabContent - The jQuery-wrapped tab content element.
 * @param {jQuery} tabs - The jQuery-wrapped tab navigation container.
 */
export async function configureNodeUI(app, tabContent, tabs) {
  const mainCircle = tabContent[0].querySelector(".elemental-circle-container");
  const input = tabContent[0].querySelector("#nodeCountInput");
  const button = tabContent[0].querySelector("#updateNodesButton");

  if (mainCircle && input && button) {
    const savedCount = await getNodeCount(app.actor);
    const nodeValues = await getNodeValues(app.actor);
    const nodeFeatures = await getNodeFeatures(app.actor);
    const nodeStates = await getNodeStates(app.actor);

    // Define drag-and-drop and state toggle handlers
    const onFeatureDrop = async (nodeIndex, item) => {
      console.log(
        `Dropping feature ${item.name} (ID: ${item.id}) onto node ${nodeIndex}`
      );

      // Check if the node already has a feature
      const currentFeatures = await getNodeFeatures(app.actor);
      if (currentFeatures[nodeIndex]) {
        console.log(`Node ${nodeIndex} already has a feature. Replacing it.`);
        await app.actor.deleteEmbeddedDocuments("Item", [
          currentFeatures[nodeIndex],
        ]);
      }

      // Add the feature to the character sheet as an owned item
      let featureId;
      if (item.parent) {
        // Item is already owned by another actor; create a copy
        console.log("Item is owned by another actor. Creating a copy.");
        const ownedItem = await app.actor.createEmbeddedDocuments("Item", [
          item.toObject(),
        ]);
        featureId = ownedItem[0].id;
      } else {
        // Item is unowned (e.g., from the Items Directory); add it directly
        console.log("Item is unowned. Adding directly to actor.");
        const ownedItem = await app.actor.createEmbeddedDocuments("Item", [
          item.toObject(),
        ]);
        featureId = ownedItem[0].id;
      }

      console.log(`Feature added to character sheet with ID: ${featureId}`);

      // Update the node's feature ID
      await setNodeFeature(app.actor, nodeIndex, featureId);
      console.log(`Feature ID ${featureId} set for node ${nodeIndex}`);

      // Force re-render to update the UI
      await app.actor.setFlag("my-elemental-module", "activeTab", "elements");
      await app.render();
      console.log("Re-rendered sheet after dropping feature.");
    };

    const onFeatureRemove = async (nodeIndex) => {
      console.log(`Removing feature from node ${nodeIndex}`);
      const features = await getNodeFeatures(app.actor);
      const featureId = features[nodeIndex];
      if (!featureId) {
        console.log(`No feature to remove from node ${nodeIndex}`);
        return;
      }

      // Remove the feature from the character sheet
      await app.actor.deleteEmbeddedDocuments("Item", [featureId]);
      console.log(`Feature ${featureId} removed from character sheet.`);

      // Clear the feature from the node
      await setNodeFeature(app.actor, nodeIndex, null);
      console.log(`Feature cleared from node ${nodeIndex}`);

      // Force re-render to update the UI
      await app.actor.setFlag("my-elemental-module", "activeTab", "elements");
      await app.render();
      console.log("Re-rendered sheet after removing feature.");
    };

    const onStateToggle = async (nodeIndex, isAwakened) => {
      console.log(
        `Toggling state for node ${nodeIndex} to ${
          isAwakened ? "awakened" : "dormant"
        }`
      );
      await setNodeState(app.actor, nodeIndex, isAwakened);
      // Force re-render to update the UI
      await app.actor.setFlag("my-elemental-module", "activeTab", "elements");
      await app.render();
      console.log("Re-rendered sheet after toggling state.");
    };

    createTriangleNodes(
      mainCircle,
      savedCount,
      nodeValues,
      nodeFeatures,
      nodeStates,
      savedCount,
      {
        app,
        onFeatureDrop,
        onFeatureRemove,
        onStateToggle,
      }
    );
    input.value = savedCount;

    // Add event listeners to node input fields
    const nodeInputs = mainCircle.querySelectorAll(
      ".circle input[type='number']"
    );
    nodeInputs.forEach((nodeInput) => {
      nodeInput.addEventListener("input", async (event) => {
        const nodeIndex = parseInt(event.target.dataset.nodeIndex, 10);
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value)) {
          await setNodeValue(app.actor, nodeIndex, value);
        }
      });
    });

    button.removeEventListener("click", button._updateHandler); // Remove any existing listener
    button._updateHandler = async (event) => {
      event.preventDefault(); // Prevent form submission
      const count = parseInt(input.value);
      if (Number.isNaN(count) || count < 1 || count > 12) {
        input.style.borderColor = "red";
        return;
      }
      input.style.borderColor = "#00ffff";

      // Show loading state
      button.disabled = true;
      button.innerHTML = "Updating...";

      const previousCount = await getNodeCount(app.actor); // Get the previous node count
      await setNodeCount(app.actor, count);
      const updatedValues = await getNodeValues(app.actor); // Get updated values after node count change
      const updatedFeatures = await getNodeFeatures(app.actor); // Get updated features
      const updatedStates = await getNodeStates(app.actor); // Get updated states
      createTriangleNodes(
        mainCircle,
        count,
        updatedValues,
        updatedFeatures,
        updatedStates,
        previousCount,
        {
          app,
          onFeatureDrop,
          onFeatureRemove,
          onStateToggle,
        }
      );

      Hooks.call("elementalCircleUpdated", {
        container: mainCircle,
        nodeCount: count,
      });

      // Re-attach event listeners to new input fields
      const newNodeInputs = mainCircle.querySelectorAll(
        ".circle input[type='number']"
      );
      newNodeInputs.forEach((nodeInput) => {
        nodeInput.addEventListener("input", async (event) => {
          const nodeIndex = parseInt(event.target.dataset.nodeIndex, 10);
          const value = parseInt(event.target.value, 10);
          if (!isNaN(value)) {
            await setNodeValue(app.actor, nodeIndex, value);
          }
        });
      });

      // Force re-render
      await app.actor.setFlag("my-elemental-module", "activeTab", "elements");
      await app.render();

      // Reset button state
      button.disabled = false;
      button.innerHTML = "Update";
    };
    button.addEventListener("click", button._updateHandler);

    // Add a click handler to the tab button to store the active tab state
    tabs
      .find('a[data-tab="elements"]')
      .off("click.tabState")
      .on("click.tabState", async () => {
        await app.actor.setFlag("my-elemental-module", "activeTab", "elements");
      });
    // Add click handlers to other tabs to update the stored state
    tabs
      .find('a[data-tab!="elements"]')
      .off("click.tabState")
      .on("click.tabState", async (event) => {
        const tab = $(event.currentTarget).attr("data-tab");
        await app.actor.setFlag("my-elemental-module", "activeTab", tab);
      });
  } else {
    console.error("Failed to find required elements in tab content:", {
      mainCircle,
      input,
      button,
    });
  }
}
