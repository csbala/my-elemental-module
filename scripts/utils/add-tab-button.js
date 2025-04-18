export function addTabButton(tabs) {
    if (!tabs.find('[data-tab="elements"]').length) {
      const tabButton = $(`<a class="item" data-tab="elements" title="Elements"><i class="fas fa-gem"></i></a>`);
      tabs.append(tabButton);
      console.log("✨ Tab button added");
    }
  }
  