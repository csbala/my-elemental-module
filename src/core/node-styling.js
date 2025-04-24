/**
 * Applies styles and feature data to a node.
 *
 * @param {HTMLElement} node - The node element to style.
 * @param {string|null} featureId - The ID of the feature associated with the node.
 * @param {Object} app - The character sheet application.
 * @param {Object} config - The node configuration.
 * @returns {string} The feature name, or empty string if no feature.
 */
export function styleNodeWithFeature(node, featureId, app, config) {
  let featureName = "";

  if (featureId) {
    const feature = game.items.get(featureId) || app?.actor?.items.get(featureId);
    if (feature && feature.img && feature.img !== "icons/svg/mystery-man.svg") {
      console.log(`Setting background for node with feature image: ${feature.img}`);
      node.style.background = `url(${feature.img}) center center / cover no-repeat`;
      node.style.border = config.styles.featureNode.border;
      node.style.boxShadow = config.styles.featureNode.boxShadow;
      node.dataset.featureId = featureId;
      featureName = feature.name || "";
    } else {
      console.log(`Feature ${featureId} not found or has default image`);
      applyDefaultNodeStyles(node, config);
      delete node.dataset.featureId;
    }
  } else {
    applyDefaultNodeStyles(node, config);
    delete node.dataset.featureId;
  }

  return featureName;
}

/**
 * Applies default styles to a node when no feature is assigned.
 *
 * @param {HTMLElement} node - The node element to style.
 * @param {Object} config - The node configuration.
 */
export function applyDefaultNodeStyles(node, config) {
  const { background, border, boxShadow } = config.styles.defaultNode;
  node.style.background = background;
  node.style.border = border;
  node.style.boxShadow = boxShadow;
}
