import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import exit from "../../../agents/utils/exit.mjs";

describe("exit", () => {
  let processExitSpy;
  let originalProcessExit;

  beforeEach(() => {
    // Save the original process.exit
    originalProcessExit = process.exit;

    // Spy on process.exit to prevent actual process termination
    processExitSpy = spyOn(process, "exit").mockImplementation(() => {
      // Mock implementation that doesn't actually exit
    });
  });

  afterEach(() => {
    // Restore the original process.exit
    processExitSpy?.mockRestore();
    process.exit = originalProcessExit;
  });

  // BASIC FUNCTIONALITY TESTS
  test("should call process.exit with code 0", async () => {
    await exit();

    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(processExitSpy).toHaveBeenCalledTimes(1);
  });

  test("should be callable multiple times (in theory)", async () => {
    await exit();
    await exit();

    expect(processExitSpy).toHaveBeenCalledWith(0);
    expect(processExitSpy).toHaveBeenCalledTimes(2);
  });

  test("should maintain process.exit behavior characteristics", async () => {
    // Test that our spy captures the essential behavior
    await exit();

    // Verify the call was made with the expected arguments
    const calls = processExitSpy.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual([0]);
  });

  // ERROR HANDLING TESTS
  test("should handle spy restoration correctly", async () => {
    await exit();
    expect(processExitSpy).toHaveBeenCalled();

    // Manually restore and verify
    processExitSpy.mockRestore();
    expect(process.exit).toBe(originalProcessExit);
  });

  test("should work correctly when process.exit throws (theoretical)", async () => {
    // Reset the spy to throw an error
    processExitSpy.mockImplementation(() => {
      throw new Error("Mock exit error");
    });

    // The function should still attempt to call process.exit
    await expect(exit()).rejects.toThrow("Mock exit error");
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });
});
