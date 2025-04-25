import { restoreTabState } from "../src/elements-tab/tab-state.js";

describe("tab-state", () => {
  let app, html, tabs, tabBody;

  beforeEach(() => {
    app = { ...mockApp, _activeTab: undefined };
    html = $("html");
    tabs = $('.tabs[data-group="primary"]');
    tabBody = $(".tab-body");

    // Reset mocks
    html.find.mockImplementation((selector) => $(selector));
    tabs.find.mockImplementation((selector) => $(selector));
    tabBody.find.mockImplementation((selector) => $(selector));
    mockActor.getFlag.mockClear();
  });

  it("should restore the active tab from stored state", async () => {
    mockActor.getFlag.mockResolvedValueOnce("elements");
    tabs.find.mockImplementation((selector) => {
      if (selector === 'a[data-tab="elements"]')
        return { length: 1, addClass: jest.fn() };
      if (selector === 'a[data-tab="details"]') return { length: 0 };
      return { length: 0 };
    });
    tabBody.find.mockImplementation((selector) => {
      if (selector === '.tab[data-tab="elements"]')
        return { length: 1, addClass: jest.fn() };
      return { length: 0 };
    });

    await restoreTabState(app, html, tabs, tabBody);
    expect(tabs.find).toHaveBeenCalledWith('a[data-tab="elements"]');
    expect(tabs.find().addClass).toHaveBeenCalledWith("active");
    expect(tabBody.find).toHaveBeenCalledWith('.tab[data-tab="elements"]');
    expect(tabBody.find().addClass).toHaveBeenCalledWith("active");
    expect(app.activateTabs).toHaveBeenCalled();
  });

  it("should default to details if no stored state", async () => {
    mockActor.getFlag.mockResolvedValueOnce(null);
    tabs.find.mockImplementation((selector) => {
      if (selector === 'a[data-tab="details"]')
        return { length: 1, addClass: jest.fn() };
      return { length: 0 };
    });
    tabBody.find.mockImplementation((selector) => {
      if (selector === '.tab[data-tab="details"]')
        return { length: 1, addClass: jest.fn() };
      return { length: 0 };
    });

    await restoreTabState(app, html, tabs, tabBody);
    expect(tabs.find).toHaveBeenCalledWith('a[data-tab="details"]');
    expect(tabs.find().addClass).toHaveBeenCalledWith("active");
    expect(tabBody.find).toHaveBeenCalledWith('.tab[data-tab="details"]');
    expect(tabBody.find().addClass).toHaveBeenCalledWith("active");
  });

  it("should use app._activeTab if set", async () => {
    app._activeTab = "elements";
    tabs.find.mockImplementation((selector) => {
      if (selector === 'a[data-tab="elements"]')
        return { length: 1, addClass: jest.fn() };
      return { length: 0 };
    });
    tabBody.find.mockImplementation((selector) => {
      if (selector === '.tab[data-tab="elements"]')
        return { length: 1, addClass: jest.fn() };
      return { length: 0 };
    });

    await restoreTabState(app, html, tabs, tabBody);
    expect(tabs.find).toHaveBeenCalledWith('a[data-tab="elements"]');
    expect(tabs.find().addClass).toHaveBeenCalledWith("active");
  });
});
