import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as fsPromises from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

describe("utils/store", () => {
  let homedirSpy;
  let joinSpy;
  let accessSpy;
  let rmSpy;

  beforeEach(() => {
    homedirSpy = spyOn(os, "homedir").mockReturnValue("/mock/home");
    joinSpy = spyOn(path, "join").mockImplementation((...parts) => parts.join("/"));
    accessSpy = spyOn(fsPromises, "access").mockResolvedValue();
    rmSpy = spyOn(fsPromises, "rm").mockResolvedValue();
  });

  afterEach(() => {
    homedirSpy?.mockRestore();
    joinSpy?.mockRestore();
    accessSpy?.mockRestore();
    rmSpy?.mockRestore();
    mock.restore();
  });

  test("when secret store is FileStore instance, migration is skipped and clear is attached", async () => {
    // mock @aigne/secrets to return a FileStore instance
    const FileStore = class {};
    const createSecretStore = mock(() => Promise.resolve(new FileStore()));

    mock.module("@aigne/secrets", () => ({ default: createSecretStore, FileStore }));

    const mod = await import("../../utils/store/index.mjs");

    const store = await mod.createStore();

    expect(createSecretStore).toHaveBeenCalled();
    expect(store).toBeDefined();
    expect(typeof store.clear).toBe("function");
    // migration should not try to access or remove the file
    expect(accessSpy).not.toHaveBeenCalled();
    expect(rmSpy).not.toHaveBeenCalled();
  });

  test("when no file exists, migration is skipped (access throws)", async () => {
    // secretStore is a plain object (not FileStore)
    const setItem = mock(() => Promise.resolve());
    const listMap = mock(() => Promise.resolve({}));
    const secretStoreObj = { setItem, listMap };
    const createSecretStore = mock(() => Promise.resolve(secretStoreObj));

    const FileStore = class {};
    mock.module("@aigne/secrets", () => ({ default: createSecretStore, FileStore }));

    // simulate missing file
    accessSpy.mockRejectedValue(new Error("not found"));

    const mod = await import("../../utils/store/index.mjs");
    const store = await mod.createStore();

    expect(createSecretStore).toHaveBeenCalled();
    expect(store).toBe(secretStoreObj);
    expect(typeof store.clear).toBe("function");
    // since access failed, no migration should happen
    expect(setItem).not.toHaveBeenCalled();
    expect(rmSpy).not.toHaveBeenCalled();
  });

  test("migrates entries from FileStore to secretStore and removes file", async () => {
    // prepare secret store (destination)
    const setItem = mock(() => Promise.resolve());
    const listMap = mock(() => Promise.resolve({ a: "1", b: "2" }));
    const deleteItem = mock(() => Promise.resolve());
    const secretStoreObj = { setItem, listMap, deleteItem };
    const createSecretStore = mock(() => Promise.resolve(secretStoreObj));

    // FileStore that will be instantiated inside migrate()
    class FileStoreMock {
      constructor(opts) {
        this.filepath = opts?.filepath;
      }
      async listMap() {
        return { x: "100", y: "200" };
      }
    }

    mock.module("@aigne/secrets", () => ({ default: createSecretStore, FileStore: FileStoreMock }));

    // simulate file exists
    accessSpy.mockResolvedValue();

    const mod = await import("../../utils/store/index.mjs");
    const store = await mod.createStore();

    // migration should call setItem for keys from FileStoreMock
    expect(setItem).toHaveBeenCalledWith("x", "100");
    expect(setItem).toHaveBeenCalledWith("y", "200");
    // and file should be removed
    expect(rmSpy).toHaveBeenCalledWith("/mock/home/.aigne/doc-smith-connected.yaml");

    // test clear uses secretStore.listMap and deleteItem
    // make listMap return some keys
    secretStoreObj.listMap = mock(() => Promise.resolve({ a: "1", b: "2" }));
    await store.clear();
    expect(secretStoreObj.listMap).toHaveBeenCalled();
    expect(deleteItem).toHaveBeenCalledWith("a");
    expect(deleteItem).toHaveBeenCalledWith("b");
  });
});
