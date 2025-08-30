import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export default async function fs({ rootDir, action, path, content }) {
  if (!rootDir) throw new Error("Root directory is not specified");

  path = join(rootDir, path);

  switch (action) {
    case "read_file":
      return {
        status: "ok",
        path,
        content: await readFile(path, "utf-8"),
      };
    case "write_file": {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content || "");
      return {
        status: "ok",
        path,
        content,
      };
    }
    case "delete_file":
      await rm(path, { recursive: true, force: true });
      return {
        status: "ok",
        path,
      };
    case "list_directory":
      return {
        status: "ok",
        entries: await readdir(path, { withFileTypes: true }).then((list) =>
          list.map((entry) => ({
            path: join(entry.parentPath, entry.name),
            isDirectory: entry.isDirectory(),
          })),
        ),
      };
  }
}

fs.input_schema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: ["read_file", "write_file", "delete_file", "list_directory"],
      description:
        "The file system action to perform, available actions are: read_file, write_file, delete_file, list_directory",
    },
    path: { type: "string", description: "The path to the file or directory to operate on" },
    content: {
      type: "string",
      description: "The content to write to the file, required for write_file action",
    },
  },
  required: ["action", "path"],
};
