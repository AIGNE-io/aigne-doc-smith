import { mkdir, readFile } from "node:fs/promises";
import { parse } from "yaml";

await mkdir(".aigne/doc-smith", { recursive: true });
const config = await readFile(".aigne/doc-smith/config.yaml", "utf-8")
  .then((raw) => parse(raw))
  .catch(() => null);

const docsDir = config?.docsDir || ".aigne/doc-smith/docs";
await mkdir(docsDir, { recursive: true });

export default {
  type: "ai",
  name: "chat",
  description: "Start interactive document generation assistant",
  instructions: {
    url: "./chat-system.md",
  },
  input_key: "message",
  afs: {
    modules: [
      {
        module: "history",
        options: {
          storage: {
            url: "file:.aigne/doc-smith/.local/afs-storage.sqlite3",
          },
        },
      },
      {
        module: "system-fs",
        options: {
          name: "source",
          localPath: ".",
          description: "Project root directory for document generation",
        },
      },
      {
        module: "system-fs",
        options: {
          name: "docs",
          localPath: docsDir,
          description: "Generated documentation files directory",
        },
      },
    ],
  },
  afs_config: {
    inject_history: true,
  },
  skills: [
    "./skills/list-documents.mjs",
    "./skills/generate-document.yaml",
    "./skills/update-document.yaml",
    "../publish/index.yaml",
    "../localize/index.yaml",
    "../utils/exit.mjs",
  ],
};
