// Mock Foundry VTT globals
global.Hooks = {
  once: jest.fn(),
  on: jest.fn(),
  call: jest.fn(),
};

// Mock renderTemplate
global.renderTemplate = jest.fn((templatePath) =>
  Promise.resolve("<div>Mocked Template Content</div>")
);

// Mock jQuery
const mockJQuery = (selector) => {
  const element = {
    length: selector.includes("elements") ? 0 : 1, // Simulate element not found for "elements" tab
    attr: jest.fn((key) => (key === "data-tab" ? "details" : undefined)),
    append: jest.fn(),
    removeClass: jest.fn().mockReturnThis(),
    addClass: jest.fn().mockReturnThis(),
    find: jest.fn((subSelector) => mockJQuery(subSelector)),
    off: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    querySelector: jest.fn((sel) =>
      sel === ".elemental-circle-container" ? {} : null
    ),
    querySelectorAll: jest.fn(() => []),
    [0]: {
      querySelector: jest.fn((sel) => {
        if (sel === ".elemental-circle-container") return {};
        if (sel === "#nodeCountInput") return { value: "3" };
        if (sel === "#updateNodesButton")
          return {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        return null;
      }),
    },
  };
  return element;
};
global.$ = mockJQuery;
global.jQuery = mockJQuery;

// Export mockJQuery for explicit use in tests if needed
module.exports = { mockJQuery };

// Mock document.createElement for node-renderer
document.createElement = jest.fn(() => ({
  classList: {
    add: jest.fn(),
  },
  style: {
    left: "",
    top: "",
    transform: "",
  },
  appendChild: jest.fn(),
}));

// Mock actor.setFlag and getFlag
const mockActor = {
  setFlag: jest.fn(() => Promise.resolve()),
  getFlag: jest.fn(() => Promise.resolve(null)),
};
global.mockActor = mockActor;

// Mock app.render and activateTabs
const mockApp = {
  actor: mockActor,
  render: jest.fn(() => Promise.resolve()),
  activateTabs: jest.fn(),
};
global.mockApp = mockApp;
