import { getElementTabContent } from "../lib/utils.js";

export function setupElementsTabHook(app, html, data) {
  const tabs = html.find('.tabs[data-group="primary"]');
  const body = html.find('.sheet-body');

  // Add new tab button
  const tabButton = $(`<a class="item" data-tab="elements" title="Elements"><i class="fas fa-bolt"></i></a>`);
  tabs.append(tabButton);

  // Load content
  renderTemplate("modules/my-elemental-module/templates/elements-tab.html", data).then((content) => {
    const tabContent = $(`<div class="tab" data-tab="elements">${content}</div>`);
    body.append(tabContent);
  });
}
