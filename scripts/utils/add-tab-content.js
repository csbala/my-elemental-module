export async function addTabContent(tabBody) {
  if (!tabBody.find('.tab[data-tab="elements"]').length) {
    const html = await renderTemplate("modules/my-elemental-module/templates/elements-tab.html");

    const tabContent = $(`
      <div class="tab" data-tab="elements" data-group="primary">
        ${html}
      </div>
    `);

    tabBody.append(tabContent);
    console.log("✅ Tab content added to .tab-body");
  }
}
