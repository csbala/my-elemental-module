import { createTriangleNodes } from './load-circle-ui.js';

const MODULE_PATH = "modules/my-elemental-module";

export async function addTabContent(tabBody) {
  if (!tabBody.find('.tab[data-tab="elements"]').length) {
    const html = await renderTemplate(`${MODULE_PATH}/templates/elements-tab.hbs`);

    const tabContent = $(`
      <div class="tab" data-tab="elements" data-group="primary">
        ${html}
      </div>
    `);

    tabBody.append(tabContent);
    console.log("✅ Tab content added to .tab-body");

    // Now dynamically generate the nodes based on input
    const mainCircle = tabContent[0].querySelector('.elemental-circle-container');
    const input = tabContent[0].querySelector('#nodeCountInput');
    const button = tabContent[0].querySelector('#updateNodesButton');

    // Initial render
    createTriangleNodes(mainCircle, parseInt(input.value));

    button.addEventListener('click', () => {
      const count = parseInt(input.value);
      if (Number.isNaN(count) || count < 1 || count > 12) return;
      createTriangleNodes(mainCircle, count);

      Hooks.call('elementalCircleUpdated', {
        container: mainCircle,
        nodeCount: count
      });
    });
  }
}
