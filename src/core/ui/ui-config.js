/**
 * Configuration for the node UI, centralizing constants and defaults.
 */
export const UI_CONFIG = {
  moduleName: "my-elemental-module",
  nodeCount: {
    min: 1,
    max: 12,
  },
  styles: {
    button: {
      loadingText: "Updating...",
      defaultText: "Update",
    },
  },
};

/**
 * Ensures required DOM elements are present.
 *
 * @param {HTMLElement} mainCircle - The container for the nodes.
 * @param {HTMLElement} input - The input field for node count.
 * @param {HTMLElement} button - The update button.
 * @param {HTMLElement} colorPicker - The color picker input.
 * @throws {Error} If any required element is missing.
 */
export function validateDomElements(mainCircle, input, button, colorPicker) {
  if (!mainCircle || !input || !button || !colorPicker) {
    throw new Error("Missing required DOM elements", { mainCircle, input, button, colorPicker });
  }
}
