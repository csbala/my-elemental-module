import {
  injectTabButton,
  injectTabContent,
} from "../src/elements-tab/tab-injector.js";

describe("tab-injector", () => {
  let app, tabs, tabBody;

  beforeEach(() => {
    app = mockApp;
    tabs = $('.tabs[data-group="primary"]');
    tabBody = $(".tab-body");
    tabs.find.mockImplementation((selector) => $(selector));
    tabBody.find.mockImplementation((selector) => $(selector));
    renderTemplate.mockClear();
    tabs.append.mockClear();
    tabBody.append.mockClear();
  });

  describe("injectTabButton", () => {
    it("should inject the tab button if it doesn't exist", async () => {
      tabs.find.mockReturnValueOnce({ length: 0 }); // Tab doesn't exist
      await injectTabButton(app, tabs);
      expect(tabs.append).toHaveBeenCalled();
    });

    it("should not inject the tab button if it already exists", async () => {
      tabs.find.mockReturnValueOnce({ length: 1 }); // Tab exists
      await injectTabButton(app, tabs);
      expect(tabs.append).not.toHaveBeenCalled();
    });
  });

  describe("injectTabContent", () => {
    it("should inject the tab content if it doesn't exist", async () => {
      tabBody.find.mockReturnValueOnce({ length: 0 }); // Content doesn't exist
      const result = await injectTabContent(app, tabBody);
      expect(renderTemplate).toHaveBeenCalledWith(
        "modules/my-elemental-module/templates/elements-tab.hbs"
      );
      expect(tabBody.append).toHaveBeenCalled();
      expect(result).not.toBeNull();
    });

    it("should not inject the tab content if it already exists", async () => {
      tabBody.find.mockReturnValueOnce({ length: 1 }); // Content exists
      const result = await injectTabContent(app, tabBody);
      expect(renderTemplate).not.toHaveBeenCalled();
      expect(tabBody.append).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
