import { addTabButton } from "../utils/add-tab-button.js";
import { addTabContent } from "../utils/add-tab-content.js";
import { rebindTabs } from "../utils/rebind-tabs.js";

export function setupElementsTabHook(app, html, data) {
  console.log("🛠️ Setting up Elements Tab...");

  const tabs = html.find('.tabs[data-group="primary"]');
  const tabBody = html.find('.tab-body');

  addTabButton(tabs);
  addTabContent(tabBody);
  rebindTabs(html);
}
