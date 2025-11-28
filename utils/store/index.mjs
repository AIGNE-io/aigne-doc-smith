import { access, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import createSecretStore, { FileStore } from "@aigne/secrets";


export async function createStore() {
  const filepath = join(homedir(), ".aigne", "doc-smith-connected.yaml");
  const secretStore = await createSecretStore({
    serviceName: "aigne-doc-smith-publish",
    filepath,
  });

  async function migrate() {
    // system don't support keyring
    if (secretStore instanceof FileStore) {
      return true;
    }
    // already migrated
    try {
      await access(filepath);
    } catch {
      return true;
    }

    const fileStore = new FileStore({ filepath });
    const map = await fileStore.listMap();
    for (const [key, value] of Object.entries(map)) {
      await secretStore.setItem(key, value);
    }
    await rm(filepath);
  }
  function getItem(...args) {
    return secretStore.getItem(...args);
  }

  function setItem(...args) {
    return secretStore.setItem(...args);
  }

  function deleteItem(...args) {
    return secretStore.deleteItem(...args);
  }

  function listMap() {
    return secretStore.listMap();
  }

  async function clear() {
    const map = await secretStore.listMap();
    for (const key of Object.keys(map)) {
      await secretStore.deleteItem(key);
    }
  }

  await migrate();

  return {
    getItem,
    setItem,
    deleteItem,
    clear,
    listMap,
  };
}
