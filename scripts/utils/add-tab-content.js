export function addTabContent(tabBody) {
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
  }
  