import { addTabContent } from "./utils/add-tab-content.js";

// Fallback to the base ActorSheet class if the D&D 5e specific class isn't available
const BaseSheetClass =
  game.dnd5e?.applications?.ActorSheet5eCharacter || ActorSheet;

export class CustomActorSheet5eCharacter extends BaseSheetClass {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.tabs.push({
      navSelector: '.tabs[data-group="primary"]',
      contentSelector: ".tab-body",
      initial: "details",
      group: "primary",
      id: "elements",
      label: "Elements",
      icon: '<i class="fas fa-gem"></i>',
    });
    return options;
  }

  async _renderInner(data) {
    const html = await super._renderInner(data);
    const tabBody = html.find(".tab-body");
    if (!tabBody.find('.tab[data-tab="elements"]').length) {
      await addTabContent(tabBody, this.actor);
    }
    return html;
  }
}
