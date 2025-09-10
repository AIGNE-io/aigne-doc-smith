import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import saveOutput from "../../../agents/utils/save-output.mjs";

// Mock Node.js fs/promises and path modules
const mockFs = {
  mkdir: mock(() => Promise.resolve()),
  writeFile: mock(() => Promise.resolve()),
};

const mockPath = {
  join: mock((...paths) => paths.join("/")),
};

// Apply mocks
mock.module("node:fs", () => ({ promises: mockFs }));
mock.module("node:path", () => mockPath);

describe("saveOutput utility", () => {
  let consoleWarnSpy;

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockFs).forEach((mockFn) => {
      mockFn.mockClear();
      mockFn.mockRestore?.();
    });
    Object.values(mockPath).forEach((mockFn) => {
      mockFn.mockClear();
      mockFn.mockRestore?.();
    });

    // Set default implementations
    mockFs.mkdir.mockResolvedValue();
    mockFs.writeFile.mockResolvedValue();
    mockPath.join.mockImplementation((...paths) => paths.join("/"));

    // Spy on console.warn
    consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
    consoleWarnSpy?.mockRestore();
  });

  // SUCCESSFUL SAVE TESTS
  test("should save string content successfully", async () => {
    const result = await saveOutput({
      savePath: "/output/dir",
      fileName: "result.txt",
      saveKey: "textContent",
      textContent: "Hello, World!",
    });

    expect(mockFs.mkdir).toHaveBeenCalledWith("/output/dir", { recursive: true });
    expect(mockPath.join).toHaveBeenCalledWith("/output/dir", "result.txt");
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      "/output/dir/result.txt",
      "Hello, World!",
      "utf8",
    );
    expect(result).toEqual({
      saveOutputStatus: true,
      saveOutputPath: "/output/dir/result.txt",
    });
  });

  test("should save object content as formatted JSON", async () => {
    const objectData = {
      title: "Test Document",
      tags: ["test", "sample"],
      metadata: { version: 1 },
    };

    const result = await saveOutput({
      savePath: "/data",
      fileName: "config.json",
      saveKey: "configData",
      configData: objectData,
    });

    const expectedContent = JSON.stringify(objectData, null, 2);
    expect(mockFs.writeFile).toHaveBeenCalledWith("/data/config.json", expectedContent, "utf8");
    expect(result.saveOutputStatus).toBe(true);
    expect(result.saveOutputPath).toBe("/data/config.json");
  });

  test("should save number content as string", async () => {
    const result = await saveOutput({
      savePath: "/numbers",
      fileName: "count.txt",
      saveKey: "count",
      count: 42,
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith("/numbers/count.txt", "42", "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });

  test("should save boolean content as string", async () => {
    const result = await saveOutput({
      savePath: "/flags",
      fileName: "flag.txt",
      saveKey: "isEnabled",
      isEnabled: true,
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith("/flags/flag.txt", "true", "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });

  test("should save array content as formatted JSON", async () => {
    const arrayData = ["item1", "item2", { nested: "object" }];

    const result = await saveOutput({
      savePath: "/arrays",
      fileName: "list.json",
      saveKey: "items",
      items: arrayData,
    });

    const expectedContent = JSON.stringify(arrayData, null, 2);
    expect(mockFs.writeFile).toHaveBeenCalledWith("/arrays/list.json", expectedContent, "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });

  // NULL AND UNDEFINED HANDLING
  test("should handle null values by converting to JSON string", async () => {
    const result = await saveOutput({
      savePath: "/null-test",
      fileName: "null.json",
      saveKey: "nullValue",
      nullValue: null,
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith("/null-test/null.json", "null", "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });

  test("should handle undefined values by converting to string", async () => {
    const result = await saveOutput({
      savePath: "/undefined-test",
      fileName: "undefined.txt",
      saveKey: "undefinedValue",
      undefinedValue: undefined,
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith(
      "/undefined-test/undefined.txt",
      "undefined",
      "utf8",
    );
    expect(result.saveOutputStatus).toBe(true);
  });

  // MISSING SAVE KEY TESTS
  test("should warn and return false when saveKey is not found", async () => {
    const result = await saveOutput({
      savePath: "/output",
      fileName: "missing.txt",
      saveKey: "nonExistentKey",
      existingKey: "some value",
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'saveKey "nonExistentKey" not found in input, skip saving.',
    );
    expect(result).toEqual({
      saveOutputStatus: false,
      saveOutputPath: null,
    });
    expect(mockFs.mkdir).not.toHaveBeenCalled();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  test("should not save when saveKey exists but is undefined", async () => {
    const result = await saveOutput({
      savePath: "/output",
      fileName: "test.txt",
      saveKey: "undefinedKey",
      // undefinedKey is not provided, so it will be undefined
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'saveKey "undefinedKey" not found in input, skip saving.',
    );
    expect(result.saveOutputStatus).toBe(false);
  });

  // COMPLEX PATH HANDLING
  test("should handle nested directory paths", async () => {
    await saveOutput({
      savePath: "/deep/nested/directory/structure",
      fileName: "file.txt",
      saveKey: "content",
      content: "test content",
    });

    expect(mockFs.mkdir).toHaveBeenCalledWith("/deep/nested/directory/structure", {
      recursive: true,
    });
    expect(mockPath.join).toHaveBeenCalledWith("/deep/nested/directory/structure", "file.txt");
  });

  test("should handle paths with special characters", async () => {
    await saveOutput({
      savePath: "/path with spaces/特殊字符/symbols!@#",
      fileName: "file-name_with-symbols.json",
      saveKey: "data",
      data: { test: "value" },
    });

    expect(mockFs.mkdir).toHaveBeenCalledWith("/path with spaces/特殊字符/symbols!@#", {
      recursive: true,
    });
    expect(mockPath.join).toHaveBeenCalledWith(
      "/path with spaces/特殊字符/symbols!@#",
      "file-name_with-symbols.json",
    );
  });

  // EMPTY AND EDGE CASES
  test("should save empty string content", async () => {
    const result = await saveOutput({
      savePath: "/empty",
      fileName: "empty.txt",
      saveKey: "emptyString",
      emptyString: "",
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith("/empty/empty.txt", "", "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });

  test("should save empty object as formatted JSON", async () => {
    const result = await saveOutput({
      savePath: "/empty",
      fileName: "empty.json",
      saveKey: "emptyObject",
      emptyObject: {},
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith("/empty/empty.json", "{}", "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });

  test("should save empty array as formatted JSON", async () => {
    const result = await saveOutput({
      savePath: "/empty",
      fileName: "empty-array.json",
      saveKey: "emptyArray",
      emptyArray: [],
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith("/empty/empty-array.json", "[]", "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });

  // COMPLEX OBJECT SERIALIZATION
  test("should handle complex nested objects", async () => {
    const complexObject = {
      users: [
        { id: 1, name: "Alice", settings: { theme: "dark", notifications: true } },
        { id: 2, name: "Bob", settings: { theme: "light", notifications: false } },
      ],
      metadata: {
        version: "1.0.0",
        created: "2024-01-01",
        features: ["auth", "api", "ui"],
      },
    };

    const result = await saveOutput({
      savePath: "/complex",
      fileName: "data.json",
      saveKey: "complexData",
      complexData: complexObject,
    });

    const expectedContent = JSON.stringify(complexObject, null, 2);
    expect(mockFs.writeFile).toHaveBeenCalledWith("/complex/data.json", expectedContent, "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });

  // MULTIPLE KEYS IN INPUT
  test("should only save the specified saveKey among multiple keys", async () => {
    const result = await saveOutput({
      savePath: "/selective",
      fileName: "selected.txt",
      saveKey: "targetKey",
      targetKey: "This should be saved",
      otherKey: "This should be ignored",
      anotherKey: { ignored: "data" },
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith(
      "/selective/selected.txt",
      "This should be saved",
      "utf8",
    );
    expect(result.saveOutputStatus).toBe(true);
  });

  // FUNCTION CONTENT HANDLING
  test("should convert function to string", async () => {
    const testFunction = function testFn() {
      return "hello";
    };

    const result = await saveOutput({
      savePath: "/functions",
      fileName: "function.txt",
      saveKey: "fn",
      fn: testFunction,
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith(
      "/functions/function.txt",
      testFunction.toString(),
      "utf8",
    );
    expect(result.saveOutputStatus).toBe(true);
  });

  // ZERO VALUES
  test("should save zero values correctly", async () => {
    const result = await saveOutput({
      savePath: "/zeros",
      fileName: "zero.txt",
      saveKey: "zeroValue",
      zeroValue: 0,
    });

    expect(mockFs.writeFile).toHaveBeenCalledWith("/zeros/zero.txt", "0", "utf8");
    expect(result.saveOutputStatus).toBe(true);
  });
});
