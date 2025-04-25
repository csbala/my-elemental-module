import { createTriangleNodes } from "../src/core/node-renderer.js";

describe("createTriangleNodes", () => {
  let container;

  beforeEach(() => {
    container = {
      querySelectorAll: jest.fn(() => [{ remove: jest.fn() }]),
      appendChild: jest.fn(),
    };
    document.createElement.mockClear();
  });

  it("should remove existing nodes except center", () => {
    const removeSpy = jest.fn();
    container.querySelectorAll.mockReturnValueOnce([{ remove: removeSpy }]);

    createTriangleNodes(container, 3);
    expect(container.querySelectorAll).toHaveBeenCalledWith(
      ".circle:not(.center)"
    );
    expect(removeSpy).toHaveBeenCalled();
  });

  it("should create the correct number of nodes", () => {
    createTriangleNodes(container, 3);
    expect(document.createElement).toHaveBeenCalledTimes(3);
    expect(container.appendChild).toHaveBeenCalledTimes(3);
  });

  it("should position nodes correctly", () => {
    createTriangleNodes(container, 2);
    const node1 = document.createElement.mock.results[0].value;
    const node2 = document.createElement.mock.results[1].value;

    expect(node1.classList.add).toHaveBeenCalledWith("circle", "node-1");
    expect(parseFloat(node1.style.left)).toBeCloseTo(200, 0); // 200 + 180 * cos(90°)
    expect(parseFloat(node1.style.top)).toBeCloseTo(20, 0); // 200 - 180 * sin(90°)
    expect(node1.style.transform).toBe("translate(-50%, -50%)");

    expect(node2.classList.add).toHaveBeenCalledWith("circle", "node-2");
    expect(parseFloat(node2.style.left)).toBeCloseTo(200, 0); // 200 + 180 * cos(270°)
    expect(parseFloat(node2.style.top)).toBeCloseTo(380, 0); // 200 - 180 * sin(270°)
    expect(node2.style.transform).toBe("translate(-50%, -50%)");
  });

  it("should handle nodeCount of 0", () => {
    createTriangleNodes(container, 0);
    expect(document.createElement).not.toHaveBeenCalled();
    expect(container.appendChild).not.toHaveBeenCalled();
  });
});
