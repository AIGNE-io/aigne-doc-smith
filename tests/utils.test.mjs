import { describe, expect, test } from "bun:test";
import { isGlobPattern } from "../utils/utils.mjs";

describe("utils", () => {
  describe("isGlobPattern", () => {
    test("should return true for patterns with asterisk", () => {
      expect(isGlobPattern("*.js")).toBe(true);
      expect(isGlobPattern("src/*.js")).toBe(true);
      expect(isGlobPattern("**/*.js")).toBe(true);
      expect(isGlobPattern("src/**/*.js")).toBe(true);
    });

    test("should return true for patterns with question mark", () => {
      expect(isGlobPattern("file?.js")).toBe(true);
      expect(isGlobPattern("src/?odal.js")).toBe(true);
    });

    test("should return true for patterns with character classes", () => {
      expect(isGlobPattern("file[abc].js")).toBe(true);
      expect(isGlobPattern("src/[Bb]utton.js")).toBe(true);
      expect(isGlobPattern("file[0-9].js")).toBe(true);
    });

    test("should return true for patterns with double asterisk", () => {
      expect(isGlobPattern("**/file.js")).toBe(true);
      expect(isGlobPattern("src/**/file.js")).toBe(true);
    });

    test("should return false for regular paths", () => {
      expect(isGlobPattern("src/file.js")).toBe(false);
      expect(isGlobPattern("./src")).toBe(false);
      expect(isGlobPattern("/absolute/path")).toBe(false);
      expect(isGlobPattern("regular-file.js")).toBe(false);
      expect(isGlobPattern("package.json")).toBe(false);
    });

    test("should return false for empty or undefined input", () => {
      expect(isGlobPattern("")).toBe(false);
      expect(isGlobPattern(undefined)).toBe(false);
      expect(isGlobPattern(null)).toBe(false);
    });

    test("should handle complex patterns", () => {
      expect(isGlobPattern("src/**/*.{js,ts,jsx,tsx}")).toBe(true);
      expect(isGlobPattern("components/**/[A-Z]*.js")).toBe(true);
      expect(isGlobPattern("test/**/*test.js")).toBe(true);
    });
  });
});
