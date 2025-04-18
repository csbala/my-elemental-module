export function rebindTabs(html) {
    const tabsEl = html.find('.tabs[data-group="primary"]')[0];
    const tabContentEls = html.find('.tab[data-group="primary"]');
    const tabsController = new Tabs(tabsEl, {
      navSelector: ".tabs",
      contentSelector: ".tab-body",
      initial: "attributes",
    });
    tabsController.bind(tabsEl, tabContentEls);
    console.log("🔁 Tabs re-bound to recognize new content");
  }
  