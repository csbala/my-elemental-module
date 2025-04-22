import { debounce } from "../src/utils/debounce.js";

jest.useFakeTimers();

describe("debounce", () => {
  it("should delay function execution", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("test");
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith("test");
  });

  it("should clear previous timeout on new call", () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("test1");
    jest.advanceTimersByTime(50);
    debouncedFn("test2");
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("test2");
  });
});
