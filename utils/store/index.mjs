import { access, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import createSecretStore, { FileStore } from "@aigne/secrets";

export async function createStore() {
  const filepath = join(homedir(), ".aigne", "doc-smith-connected.yaml");
  const secretStore = await createSecretStore({
    filepath,
    serviceName: "aigne-doc-smith-publish",
  });

  async function migrate() {
    // system doesn't support keyring
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

  async function clear() {
    const map = await secretStore.listMap();
    for (const key of Object.keys(map)) {
      await secretStore.deleteItem(key);
    }
  }

  await migrate();

  secretStore.clear = clear;

  return secretStore;
}
