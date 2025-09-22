import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CODE_LANGUAGE_MAP_LINTER } from "../../../utils/constants/linter.mjs";
import { lintCode } from "../../../utils/linter/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("lintCode js", () => {
  const jsLinter = CODE_LANGUAGE_MAP_LINTER.js;

  test("should lint js undeclare variable error", async () => {
    const code = await fs.readFile(
      path.join(__dirname, "fixtures/js/undeclare-variable.js"),
      "utf-8",
    );
    const result = await lintCode({ code, linter: jsLinter });

    expect(result.success).toEqual(true);
    expect(result.issues.length).toEqual(2);
    expect(result.issues.filter((x) => x.severity === "warning").length).toEqual(2);
  });

  test("should lint js keyword error", async () => {
    const code = await fs.readFile(path.join(__dirname, "fixtures/js/keyword-error.js"), "utf-8");
    const result = await lintCode({ code, linter: "biome-lint" });

    expect(result.success).toEqual(false);
    expect(result.issues.length).toEqual(2);
    expect(result.issues.filter((x) => x.severity === "error").length).toEqual(1);
    expect(result.issues.filter((x) => x.severity === "warning").length).toEqual(1);
  });

  test("should lint js missing semicolon error", async () => {
    const code = await fs.readFile(
      path.join(__dirname, "fixtures/js/missing-semicolon.js"),
      "utf-8",
    );
    const result = await lintCode({ code, linter: jsLinter });

    expect(result.success).toEqual(true);
    expect(result.issues.length).toEqual(1);
    expect(result.issues.filter((x) => x.severity === "warning").length).toEqual(1);
  });

  test("should lint js syntax error in syntax-error.js", async () => {
    const code = await fs.readFile(path.join(__dirname, "fixtures/js/syntax-error.js"), "utf-8");
    const result = await lintCode({ code, linter: jsLinter });

    expect(result.success).toEqual(false);
    expect(result.issues.length).toEqual(2);
    expect(result.issues.filter((x) => x.severity === "error").length).toEqual(1);
    expect(result.issues.filter((x) => x.severity === "warning").length).toEqual(1);
  });

  test("should lint js code with unused variables", async () => {
    const code = await fs.readFile(path.join(__dirname, "fixtures/js/unused-variable.js"), "utf-8");
    const result = await lintCode({ code, linter: jsLinter });

    expect(result.success).toEqual(true);
    expect(result.issues.length).toEqual(2);
    expect(result.issues.filter((x) => x.severity === "warning").length).toEqual(2);
  });

  test("should lint valid js code with no errors", async () => {
    const code = await fs.readFile(path.join(__dirname, "fixtures/js/valid-code.js"), "utf-8");
    const result = await lintCode({ code, linter: jsLinter });

    expect(result.success).toEqual(true);
    // No issues expected for valid code
  });
});
