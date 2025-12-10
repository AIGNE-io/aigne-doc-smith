import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { calculateImageTimestamp } from "../../utils/diagram-version-utils.mjs";
import fs from "fs-extra";

describe("diagram-version-utils", () => {
  let statSpy;

  beforeEach(() => {
    statSpy = spyOn(fs, "stat").mockResolvedValue({
      mtimeMs: 1234567890000, // Mock timestamp in milliseconds
    });
  });

  afterEach(() => {
    statSpy?.mockRestore();
  });

  test("should calculate timestamp from file modification time", async () => {
    const imagePath = "/path/to/image.jpg";
    const timestamp = await calculateImageTimestamp(imagePath);

    expect(timestamp).toBe("1234567890"); // Converted to seconds
    expect(statSpy).toHaveBeenCalledWith(imagePath);
  });

  test("should handle different file modification times", async () => {
    statSpy.mockResolvedValue({
      mtimeMs: 9876543210000,
    });

    const timestamp = await calculateImageTimestamp("/path/to/image.jpg");

    expect(timestamp).toBe("9876543210");
  });

  test("should round down fractional seconds", async () => {
    statSpy.mockResolvedValue({
      mtimeMs: 1234567890123.456, // Fractional milliseconds
    });

    const timestamp = await calculateImageTimestamp("/path/to/image.jpg");

    expect(timestamp).toBe("1234567890"); // Rounded down
  });

  test("should handle zero timestamp", async () => {
    statSpy.mockResolvedValue({
      mtimeMs: 0,
    });

    const timestamp = await calculateImageTimestamp("/path/to/image.jpg");

    expect(timestamp).toBe("0");
  });
});
