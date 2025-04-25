import { getNodeCount, setNodeCount } from "../src/core/node-store.js";

describe("node-store", () => {
  beforeEach(() => {
    mockActor.getFlag.mockClear();
    mockActor.setFlag.mockClear();
  });

  describe("getNodeCount", () => {
    it("should return the stored node count", async () => {
      mockActor.getFlag.mockResolvedValueOnce(5);
      const count = await getNodeCount(mockActor);
      expect(mockActor.getFlag).toHaveBeenCalledWith(
        "my-elemental-module",
        "nodeCount"
      );
      expect(count).toBe(5);
    });

    it("should return default value if no count is stored", async () => {
      mockActor.getFlag.mockResolvedValueOnce(null);
      const count = await getNodeCount(mockActor);
      expect(count).toBe(3);
    });
  });

  describe("setNodeCount", () => {
    it("should set the node count", async () => {
      await setNodeCount(mockActor, 7);
      expect(mockActor.setFlag).toHaveBeenCalledWith(
        "my-elemental-module",
        "nodeCount",
        7
      );
    });
  });
});
