import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CODE_LANGUAGE_MAP_LINTER } from "../../../utils/constants/linter.mjs";
import { lintCode } from "../../../utils/linter/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("lintCode", () => {
  const jsLinter = CODE_LANGUAGE_MAP_LINTER.js;

  test("should lint js unused error", async () => {
    const code = await fs.readFile(path.join(__dirname, "fixtures/unused.js"), "utf-8");
    const result = await lintCode({ code, linter: jsLinter });

    expect(result.success).toEqual(true);
    expect(result.issues.length).toEqual(2);
    expect(result.issues.filter((x) => x.severity === "warning").length).toEqual(2);
  });

  test("should lint js syntax error", async () => {
    const code = await fs.readFile(path.join(__dirname, "fixtures/syntax.js"), "utf-8");
    const result = await lintCode({ code, linter: "biome-lint" });

    expect(result.success).toEqual(false);
    expect(result.issues.length).toEqual(2);
    expect(result.issues.filter((x) => x.severity === "error").length).toEqual(1);
    expect(result.issues.filter((x) => x.severity === "warning").length).toEqual(1);
  });
});
