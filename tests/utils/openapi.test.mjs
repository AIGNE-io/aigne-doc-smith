import { describe, expect, test } from "bun:test";
import { isOpenAPISpecFile } from "../../utils/openapi/index.mjs";

describe("openapi utilities", () => {
  test("should detect OpenAPI specification in YAML format", () => {
    const content = `
openapi: 3.0.1
info:
  title: Sample
  version: "1.0.0"
paths: {}
`.trim();

    expect(isOpenAPISpecFile(content)).toBe(true);
  });

  test("should detect OpenAPI specification in JSON format", () => {
    const content = JSON.stringify({
      openapi: "3.1.0",
      info: { title: "API", version: "1.0.0" },
      paths: {},
    });

    expect(isOpenAPISpecFile(content)).toBe(true);
  });

  test("should return false for non OpenAPI documents", () => {
    const content = `
# README
This is not an OpenAPI spec.
`.trim();

    expect(isOpenAPISpecFile(content)).toBe(false);
  });
});
