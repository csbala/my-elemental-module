import { configureNodeUI } from "../src/elements-tab/node-ui.js";
import { createTriangleNodes } from "../src/core/node-renderer.js";
import { getNodeCount, setNodeCount } from "../src/core/node-store.js";

jest.mock("../src/core/node-renderer.js");
jest.mock("../src/core/node-store.js");

describe("node-ui", () => {
  let app, tabContent, tabs;

  beforeEach(() => {
    app = { ...mockApp };
    tabContent = $("div");
    tabs = $('.tabs[data-group="primary"]');
    tabContent[0] = {
      querySelector: jest.fn((sel) => {
        if (sel === ".elemental-circle-container") return {};
        if (sel === "#nodeCountInput") return { value: "3", style: {} };
        if (sel === "#updateNodesButton")
          return {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            disabled: false,
            innerHTML: "Update",
          };
        return null;
      }),
    };
    tabs.find.mockImplementation((selector) => $(selector));
    createTriangleNodes.mockClear();
    getNodeCount.mockClear();
    setNodeCount.mockClear();
    mockActor.setFlag.mockClear();
    mockActor.getFlag.mockClear();
  });

  it("should configure node UI when elements are present", async () => {
    getNodeCount.mockResolvedValueOnce(3);
    const mockClickHandler = jest.fn();
    tabContent[0].querySelector.mockImplementation((sel) => {
      if (sel === ".elemental-circle-container") return {};
      if (sel === "#nodeCountInput") return { value: "3", style: {} };
      if (sel === "#updateNodesButton")
        return {
          addEventListener: mockClickHandler,
          removeEventListener: jest.fn(),
          disabled: false,
          innerHTML: "Update",
        };
      return null;
    });

    await configureNodeUI(app, tabContent, tabs);
    expect(getNodeCount).toHaveBeenCalledWith(app.actor);
    expect(createTriangleNodes).toHaveBeenCalled();
    expect(mockClickHandler).toHaveBeenCalled();
  });

  it("should log error if elements are missing", async () => {
    tabContent[0].querySelector.mockReturnValueOnce(null); // mainCircle missing
    console.error = jest.fn();
    await configureNodeUI(app, tabContent, tabs);
    expect(console.error).toHaveBeenCalledWith(
      "Failed to find required elements in tab content:",
      expect.any(Object)
    );
  });

  it("should handle button click and update node count", async () => {
    const mockInput = { value: "5", style: {} };
    const mockButton = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      disabled: false,
      innerHTML: "Update",
    };
    tabContent[0].querySelector.mockImplementation((sel) => {
      if (sel === ".elemental-circle-container") return {};
      if (sel === "#nodeCountInput") return mockInput;
      if (sel === "#updateNodesButton") return mockButton;
      return null;
    });

    await configureNodeUI(app, tabContent, tabs);
    const clickHandler = mockButton.addEventListener.mock.calls[0][1];
    await clickHandler({ preventDefault: jest.fn() });

    expect(mockInput.style.borderColor).toBe("red");
    expect(setNodeCount).toHaveBeenCalledWith(app.actor, 5);
    expect(mockActor.setFlag).toHaveBeenCalledWith(
      "my-elemental-module",
      "activeTab",
      "elements"
    );
    expect(app.render).toHaveBeenCalled();
    expect(mockButton.disabled).toBe(false);
    expect(mockButton.innerHTML).toBe("Update");
  });

  it("should handle non-numeric node count input", async () => {
    const mockInput = { value: "invalid", style: {} };
    const mockButton = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      disabled: false,
      innerHTML: "Update",
    };
    tabContent[0].querySelector.mockImplementation((sel) => {
      if (sel === ".elemental-circle-container") return {};
      if (sel === "#nodeCountInput") return mockInput;
      if (sel === "#updateNodesButton") return mockButton;
      return null;
    });

    await configureNodeUI(app, tabContent, tabs);
    const clickHandler = mockButton.addEventListener.mock.calls[0][1];
    await clickHandler({ preventDefault: jest.fn() });

    expect(mockInput.style.borderColor).toBe("red");
    expect(setNodeCount).not.toHaveBeenCalled();
  });
});
