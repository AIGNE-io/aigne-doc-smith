import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import evaluateDocumentCode from "../../../agents/certify/evaluation-document-code.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("evaluateDocumentCode", () => {
  test("should evaluate markdown document", async () => {
    const content = await fs.readFile(path.join(__dirname, "fixtures/test.md"), "utf-8");
    const result = await evaluateDocumentCode({ content });

    expect("codeExampleIntegrity" in result).toEqual(true);
    expect(result.codeExampleIntegrity.totalCount).toEqual(3);
    expect(result.codeExampleIntegrity.errorCount).toEqual(2);
    expect(result.codeExampleIntegrity.ignoreCount).toEqual(1);
    expect(result.codeExampleIntegrity.score).toEqual(85);
  }, 10000);
});
