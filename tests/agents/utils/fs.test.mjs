import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import * as fsPromises from "node:fs/promises";
import * as path from "node:path";
import fs from "../../../agents/utils/fs.mjs";

describe("fs utility", () => {
  let readFileSpy;
  let writeFileSpy;
  let mkdirSpy;
  let rmSpy;
  let readdirSpy;
  let joinSpy;
  let dirnameSpy;

  beforeEach(() => {
    // Spy on fs/promises methods
    readFileSpy = spyOn(fsPromises, "readFile").mockResolvedValue("mocked file content");
    writeFileSpy = spyOn(fsPromises, "writeFile").mockResolvedValue();
    mkdirSpy = spyOn(fsPromises, "mkdir").mockResolvedValue();
    rmSpy = spyOn(fsPromises, "rm").mockResolvedValue();
    readdirSpy = spyOn(fsPromises, "readdir").mockResolvedValue([
      { name: "file1.txt", parentPath: "/test/root", isDirectory: () => false },
      { name: "subdir", parentPath: "/test/root", isDirectory: () => true },
    ]);

    // Spy on path methods
    joinSpy = spyOn(path, "join").mockImplementation((...paths) => paths.join("/"));
    dirnameSpy = spyOn(path, "dirname").mockImplementation(
      (path) => path.split("/").slice(0, -1).join("/") || "/",
    );
  });

  afterEach(() => {
    // Restore all spies
    readFileSpy?.mockRestore();
    writeFileSpy?.mockRestore();
    mkdirSpy?.mockRestore();
    rmSpy?.mockRestore();
    readdirSpy?.mockRestore();
    joinSpy?.mockRestore();
    dirnameSpy?.mockRestore();
  });

  // ERROR HANDLING TESTS
  test("should throw error when rootDir is not specified", async () => {
    await expect(
      fs({
        action: "read_file",
        path: "test.txt",
      }),
    ).rejects.toThrow("Root directory is not specified");
  });

  test("should throw error when rootDir is empty string", async () => {
    await expect(
      fs({
        rootDir: "",
        action: "read_file",
        path: "test.txt",
      }),
    ).rejects.toThrow("Root directory is not specified");
  });

  // READ_FILE ACTION TESTS
  test("should read file successfully", async () => {
    readFileSpy.mockResolvedValue("test file content");

    const result = await fs({
      rootDir: "/test/root",
      action: "read_file",
      path: "test.txt",
    });

    expect(joinSpy).toHaveBeenCalledWith("/test/root", "test.txt");
    expect(readFileSpy).toHaveBeenCalledWith("/test/root/test.txt", "utf-8");
    expect(result).toEqual({
      status: "ok",
      path: "/test/root/test.txt",
      content: "test file content",
    });
  });

  test("should handle read file with nested path", async () => {
    await fs({
      rootDir: "/project",
      action: "read_file",
      path: "src/components/Button.tsx",
    });

    expect(joinSpy).toHaveBeenCalledWith("/project", "src/components/Button.tsx");
    expect(readFileSpy).toHaveBeenCalledWith("/project/src/components/Button.tsx", "utf-8");
  });

  // WRITE_FILE ACTION TESTS
  test("should write file successfully", async () => {
    const result = await fs({
      rootDir: "/test/root",
      action: "write_file",
      path: "output.txt",
      content: "Hello, world!",
    });

    expect(dirnameSpy).toHaveBeenCalledWith("/test/root/output.txt");
    expect(mkdirSpy).toHaveBeenCalledWith("/test/root", { recursive: true });
    expect(writeFileSpy).toHaveBeenCalledWith("/test/root/output.txt", "Hello, world!");
    expect(result).toEqual({
      status: "ok",
      path: "/test/root/output.txt",
      content: "Hello, world!",
    });
  });

  test("should write file with empty content when content is not provided", async () => {
    const result = await fs({
      rootDir: "/test/root",
      action: "write_file",
      path: "empty.txt",
    });

    expect(writeFileSpy).toHaveBeenCalledWith("/test/root/empty.txt", "");
    expect(result.content).toBeUndefined(); // The function returns the original content parameter
  });

  test("should create directories recursively when writing file", async () => {
    dirnameSpy.mockReturnValue("/test/root/deep/nested");

    await fs({
      rootDir: "/test/root",
      action: "write_file",
      path: "deep/nested/file.txt",
      content: "nested content",
    });

    expect(mkdirSpy).toHaveBeenCalledWith("/test/root/deep/nested", {
      recursive: true,
    });
  });

  // DELETE_FILE ACTION TESTS
  test("should delete file successfully", async () => {
    const result = await fs({
      rootDir: "/test/root",
      action: "delete_file",
      path: "to-delete.txt",
    });

    expect(joinSpy).toHaveBeenCalledWith("/test/root", "to-delete.txt");
    expect(rmSpy).toHaveBeenCalledWith("/test/root/to-delete.txt", {
      recursive: true,
      force: true,
    });
    expect(result).toEqual({
      status: "ok",
      path: "/test/root/to-delete.txt",
    });
  });

  test("should delete directory recursively", async () => {
    await fs({
      rootDir: "/project",
      action: "delete_file",
      path: "build",
    });

    expect(rmSpy).toHaveBeenCalledWith("/project/build", {
      recursive: true,
      force: true,
    });
  });

  // LIST_DIRECTORY ACTION TESTS
  test("should list directory entries successfully", async () => {
    const result = await fs({
      rootDir: "/test/root",
      action: "list_directory",
      path: "src",
    });

    expect(joinSpy).toHaveBeenCalledWith("/test/root", "src");
    expect(readdirSpy).toHaveBeenCalledWith("/test/root/src", { withFileTypes: true });
    expect(result).toEqual({
      status: "ok",
      entries: [
        { path: "/test/root/file1.txt", isDirectory: false },
        { path: "/test/root/subdir", isDirectory: true },
      ],
    });
  });

  test("should handle empty directory listing", async () => {
    readdirSpy.mockResolvedValue([]);

    const result = await fs({
      rootDir: "/test/root",
      action: "list_directory",
      path: "empty-dir",
    });

    expect(result.entries).toEqual([]);
  });

  // PATH HANDLING TESTS
  test("should handle root directory with trailing slash", async () => {
    await fs({
      rootDir: "/test/root/",
      action: "read_file",
      path: "file.txt",
    });

    expect(joinSpy).toHaveBeenCalledWith("/test/root/", "file.txt");
  });

  test("should handle path with leading slash", async () => {
    await fs({
      rootDir: "/test/root",
      action: "read_file",
      path: "/absolute/path.txt",
    });

    expect(joinSpy).toHaveBeenCalledWith("/test/root", "/absolute/path.txt");
  });

  test("should handle complex nested paths", async () => {
    await fs({
      rootDir: "/project",
      action: "write_file",
      path: "src/components/ui/Button/index.tsx",
      content: "export default Button;",
    });

    expect(joinSpy).toHaveBeenCalledWith("/project", "src/components/ui/Button/index.tsx");
  });

  // UNDEFINED ACTION TEST
  test("should return undefined for unknown action", async () => {
    const result = await fs({
      rootDir: "/test/root",
      action: "unknown_action",
      path: "test.txt",
    });

    expect(result).toBeUndefined();
  });

  // EDGE CASES
  test("should handle special characters in paths", async () => {
    await fs({
      rootDir: "/test/root",
      action: "read_file",
      path: "文件名 with spaces & symbols!.txt",
    });

    expect(joinSpy).toHaveBeenCalledWith("/test/root", "文件名 with spaces & symbols!.txt");
  });

  test("should handle null content for write_file", async () => {
    const result = await fs({
      rootDir: "/test/root",
      action: "write_file",
      path: "null-content.txt",
      content: null,
    });

    expect(writeFileSpy).toHaveBeenCalledWith("/test/root/null-content.txt", "");
    expect(result.content).toBe(null);
  });
});
