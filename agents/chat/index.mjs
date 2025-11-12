import { mkdir, readFile } from "node:fs/promises";
import { parse } from "yaml";

await mkdir(".aigne/doc-smith", { recursive: true });
const config = await readFile(".aigne/doc-smith/config.yaml", "utf-8")
  .then((raw) => parse(raw))
  .catch(() => null);

const docsDir = config.docsDir || ".aigne/doc-smith/docs";

export default {
  type: "ai",
  name: "chat",
  description: "Start interactive document generation assistant",
  instructions: {
    url: "./chat-system.md",
  },
  input_key: "message",
  afs: {
    storage: {
      url: "file:.aigne/doc-smith/.local/afs-storage.sqlite3",
    },
    modules: [
      {
        module: "system-fs",
        options: {
          path: ".",
          mount: "/source",
          description: "Project root directory for document generation",
        },
      },
      {
        module: "system-fs",
        options: {
          path: docsDir,
          mount: "/docs",
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
    "../translate/index.yaml",
    "../utils/exit.mjs",
  ],
};
