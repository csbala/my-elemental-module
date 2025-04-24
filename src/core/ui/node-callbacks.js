import { getNodeFeatures, setNodeFeature } from "../store/index.js";
import { forceRender } from "./render-utils.js";

/**
 * Creates the callback handlers for drag-and-drop and state toggle.
 *
 * @param {ActorSheet} app - The application rendering the sheet.
 * @returns {Object} The callback functions.
 */
export function createNodeCallbacks(app) {
  const onFeatureDrop = async (nodeIndex, item) => {
    console.log(`Dropping feature ${item.name} (ID: ${item.id}) onto node ${nodeIndex}`);

    // Remove existing feature if present
    const currentFeatures = await getNodeFeatures(app.actor);
    if (currentFeatures[nodeIndex]) {
      console.log(`Node ${nodeIndex} already has a feature. Replacing it.`);
      const existingFeature = app.actor.items.get(currentFeatures[nodeIndex]);
      if (existingFeature) {
        await app.actor.deleteEmbeddedDocuments("Item", [currentFeatures[nodeIndex]]);
      }
    }

    // Check if the item already exists on the character sheet
    let featureId = item.id;
    const existingItem = app.actor.items.find((i) => i.id === item.id || (i.name === item.name && i.type === item.type));

    if (existingItem) {
      // Item already exists on the character sheet, use its ID
      featureId = existingItem.id;
      console.log(`Feature ${item.name} (ID: ${featureId}) already exists on character sheet. Using existing feature.`);
    } else if (item.parent && item.parent !== app.actor) {
      // Item is owned by another actor; create a copy but don't add to Features tab
      console.log("Item is owned by another actor. Creating a copy without adding to Features tab.");
      const itemData = item.toObject();
      featureId = itemData._id;
    } else {
      // Item is unowned (e.g., from the Items Directory); use its ID directly
      console.log("Item is unowned. Using directly without adding to Features tab.");
      featureId = item.id;
    }

    // Update the node's feature ID without adding to Features tab
    await setNodeFeature(app.actor, nodeIndex, featureId);
    console.log(`Feature ID ${featureId} set for node ${nodeIndex}`);

    await forceRender(app);
  };

  const onFeatureRemove = async (nodeIndex) => {
    console.log(`Removing feature from node ${nodeIndex}`);
    const features = await getNodeFeatures(app.actor);
    const featureId = features[nodeIndex];
    if (!featureId) {
      console.log(`No feature to remove from node ${nodeIndex}`);
      return;
    }

    // Find the feature on the character sheet and delete it
    const feature = app.actor.items.get(featureId);
    if (feature) {
      await app.actor.deleteEmbeddedDocuments("Item", [featureId]);
      console.log(`Feature ${featureId} removed from character sheet.`);
    } else {
      console.log(`Feature ${featureId} not found on character sheet, skipping deletion.`);
    }

    // Clear the feature from the node
    await setNodeFeature(app.actor, nodeIndex, null);
    console.log(`Feature cleared from node ${nodeIndex}`);

    await forceRender(app);
  };

  const onStateToggle = async (nodeIndex, isAwakened) => {
    console.log(`Toggling state for node ${nodeIndex} to ${isAwakened ? "awakened" : "dormant"}`);
    await setNodeState(app.actor, nodeIndex, isAwakened);
    await forceRender(app);
  };

  return { onFeatureDrop, onFeatureRemove, onStateToggle };
}
