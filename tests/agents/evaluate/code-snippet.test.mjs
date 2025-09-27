import { describe, expect, test } from "bun:test";
import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import evaluateDocumentCode from "../../../agents/evaluate/code-snippet.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("evaluateDocumentCode", () => {
  test(
    "should evaluate markdown document",
    async () => {
      const content = await fs.readFile(path.join(__dirname, "fixtures/js-sdk.md"), "utf-8");
      const result = await evaluateDocumentCode({ content });

      expect("codeEvaluation" in result).toEqual(true);
      expect(result.codeEvaluation.baseline).toEqual(100);
      expect("details" in result.codeEvaluation).toEqual(true);
      expect(result.codeEvaluation.details.length).toEqual(0);
      expect(result.codeEvaluation.totalCount).toEqual(3);
      expect(result.codeEvaluation.errorCount).toEqual(0);
      expect(result.codeEvaluation.ignoreCount).toEqual(0);
    },
    60 * 1000,
  );

  test(
    "should evaluate markdown document with error",
    async () => {
      const content = await fs.readFile(path.join(__dirname, "fixtures/api-services.md"), "utf-8");
      const result = await evaluateDocumentCode({ content });

      expect(result.codeEvaluation.details.length).toEqual(2);
      expect(result.codeEvaluation.totalCount).toEqual(1);
      expect(result.codeEvaluation.errorCount).toEqual(1);
      expect(result.codeEvaluation.ignoreCount).toEqual(1);
    },
    60 * 1000,
  );
});
