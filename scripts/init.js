Hooks.once("init", async function () {
    console.log("Elemental System | Initializing...");
  });
  
  // Add the tab when the character sheet renders
  Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
    const tabButton = $(`<a class="item" data-tab="elements"><i class="fas fa-bolt"></i> Elements</a>`);
    const sheetTabs = html.find(".tabs[data-group='primary']");
    sheetTabs.append(tabButton);
  
    // Load custom tab template
    const content = $(`<div class="tab" data-tab="elements">${getElementTabContent(data)}</div>`);
    html.find(".sheet-body").append(content);
  });
  
  function getElementTabContent(data) {
    return `
      <h2>Elemental Triangle</h2>
      <p>This is where your custom Element info will go.</p>
      <p>In future versions, you’ll see the triangle, dice, and level tracking here.</p>
    `;
  }
  