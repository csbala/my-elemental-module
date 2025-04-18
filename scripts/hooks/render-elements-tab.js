export function setupElementsTabHook(app, html, data) {
  console.log("🛠️ Setting up Elements Tab...");

  const tabs = html.find('.tabs[data-group="primary"]');
  const tabBody = html.find('.tab-body');

  // Check tab button
  if (!tabs.find('[data-tab="elements"]').length) {
    const tabButton = $(`<a class="item" data-tab="elements" title="Elements"><i class="fas fa-star"></i> Elements</a>`);
    tabs.append(tabButton);
    console.log("✨ Tab button added");
  }

  // Inject content into .tab-body instead of .sheet-body
  if (!tabBody.find('.tab[data-tab="elements"]').length) {
    const tabContent = $(`
      <div class="tab" data-tab="elements" data-group="primary" style="padding: 1em;">
        <h2 style="color:#ffc600;">🔥 Elemental Triangle Test</h2>
        <p>This is your elemental triangle space.</p>
        <ul>
          <li><strong>Electro</strong>: Level 1</li>
          <li><strong>Discipline</strong>: Level 2</li>
          <li><strong>Divinity-as-is-Beast</strong>: Level 0</li>
        </ul>
      </div>
    `);
    tabBody.append(tabContent);
    console.log("✅ Tab content added to .tab-body");
  }

  // Rebind Tabs
  const tabsEl = html.find('.tabs[data-group="primary"]')[0];
  const tabContentEls = html.find('.tab[data-group="primary"]');
  const tabsController = new Tabs(tabsEl, {
    navSelector: ".tabs",
    contentSelector: ".tab-body",
    initial: "attributes", // you can change this default
  });
  tabsController.bind(tabsEl, tabContentEls);
  console.log("🔁 Tabs re-bound to recognize new content");
}
