Hooks.once("init", async function () {
    console.log("Elemental System | Initializing...");
  });
  
  // Add the tab when the character sheet renders
  Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
    const tabs = html.find('.tabs[data-group="primary"]');
    const body = html.find('.sheet-body');
  
    // Add new tab button
    const tabButton = $(`<a class="item" data-tab="elements"><i class="fas fa-bolt"></i> Elements</a>`);
    tabs.append(tabButton);
  
    // Load the HTML template
    renderTemplate("modules/my-elemental-module/templates/elements-tab.html", data).then((content) => {
      const tabContent = $(`<div class="tab" data-tab="elements">${content}</div>`);
      body.append(tabContent);
    });
  });
  
  
  function getElementTabContent(data) {
    return `
      <h2>Elemental Triangle</h2>
      <p>This is where your custom Element info will go.</p>
      <p>In future versions, you’ll see the triangle, dice, and level tracking here.</p>
    `;
  }
  