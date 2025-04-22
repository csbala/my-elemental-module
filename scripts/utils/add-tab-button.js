/**
 * Adds the "Elements" tab button to the vertical tab navigation if it doesn't already exist.
 *
 * This function creates a new `<a>` element styled to match Foundry's tab system,
 * and appends it to the provided tab navigation container. It prevents duplicate buttons
 * by checking for an existing `[data-tab="elements"]` selector first.
 *
 * @function addTabButton
 * @param {JQuery} tabs - jQuery-wrapped element representing the navigation container
 *                        where tab buttons are listed.
 */
export function addTabButton(tabs) {
  if (!tabs.find('[data-tab="elements"]').length) {
    const tabButton = $(`
      <a class="item" data-tab="elements" title="Elements">
        <i class="fas fa-gem"></i>
      </a>
    `);
    tabs.append(tabButton);
    console.log("✨ Tab button added");
  }
}
