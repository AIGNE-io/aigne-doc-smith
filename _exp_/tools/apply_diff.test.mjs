import { test, expect, describe } from "bun:test";
import { applyCustomPatches } from "./apply_diff.mjs";

describe("applyCustomPatches", () => {
  describe("replace mode", () => {
    test("should replace a single line", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 1,
          end_line: 2, // exclusive end
          delete: false,
          replace: "replaced line 1",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nreplaced line 1\nline 2");
    });

    test("should replace multiple consecutive lines", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 1,
          end_line: 4,
          delete: false,
          replace: "replaced line 1\nreplaced line 2\nreplaced line 3",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe(
        "line 0\nreplaced line 1\nreplaced line 2\nreplaced line 3\nline 4"
      );
    });

    test("should replace multiple lines with fewer lines", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 1,
          end_line: 4,
          delete: false,
          replace: "single replacement",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nsingle replacement\nline 4");
    });

    test("should replace multiple lines with more lines", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: false,
          replace: "new line 1\nnew line 2\nnew line 3",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nnew line 1\nnew line 2\nnew line 3\nline 2");
    });

    test("should replace the first line", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 0,
          end_line: 1,
          delete: false,
          replace: "replaced line 0",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("replaced line 0\nline 1\nline 2");
    });

    test("should replace the last line", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 2,
          end_line: 3,
          delete: false,
          replace: "replaced line 2",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nline 1\nreplaced line 2");
    });

    test("should handle empty replacement", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: false,
          replace: "",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nline 2");
    });
  });

  describe("delete mode", () => {
    test("should delete a single line", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: true,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nline 2");
    });

    test("should delete multiple consecutive lines", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 1,
          end_line: 4,
          delete: true,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nline 4");
    });

    test("should delete the first line", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 0,
          end_line: 1,
          delete: true,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 1\nline 2");
    });

    test("should delete the last line", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 2,
          end_line: 3,
          delete: true,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nline 1");
    });

    test("should delete all lines", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 0,
          end_line: 3,
          delete: true,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("");
    });
  });

  describe("multiple patches", () => {
    test("should apply multiple replace patches in order", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: false,
          replace: "replaced line 1",
        },
        {
          start_line: 3,
          end_line: 4,
          delete: false,
          replace: "replaced line 3",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe(
        "line 0\nreplaced line 1\nline 2\nreplaced line 3\nline 4"
      );
    });

    test("should apply multiple delete patches in order", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: true,
        },
        {
          start_line: 3,
          end_line: 4,
          delete: true,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nline 2\nline 4");
    });

    test("should apply mixed replace and delete patches", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: false,
          replace: "replaced line 1",
        },
        {
          start_line: 3,
          end_line: 4,
          delete: true,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nreplaced line 1\nline 2\nline 4");
    });

    test("should handle line number adjustments when patches change line count", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: false,
          replace: "new line 1\nnew line 2", // adds 1 line
        },
        {
          start_line: 3,
          end_line: 4,
          delete: false,
          replace: "replaced line 3", // line 3 is now line 4 after first patch
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe(
        "line 0\nnew line 1\nnew line 2\nline 2\nreplaced line 3\nline 4"
      );
    });

    test("should handle deletion followed by insertion", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 1,
          end_line: 3,
          delete: true, // removes 2 lines
        },
        {
          start_line: 3,
          end_line: 4,
          delete: false,
          replace: "replaced line 3", // line 3 is now line 1 after deletion
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nreplaced line 3\nline 4");
    });

    test("should sort patches by start_line before applying", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4";
      const patches = [
        {
          start_line: 3,
          end_line: 4,
          delete: false,
          replace: "replaced line 3",
        },
        {
          start_line: 1,
          end_line: 2,
          delete: false,
          replace: "replaced line 1",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe(
        "line 0\nreplaced line 1\nline 2\nreplaced line 3\nline 4"
      );
    });

    test("should handle three patches with cascading line adjustments", () => {
      const text = "line 0\nline 1\nline 2\nline 3\nline 4\nline 5";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: false,
          replace: "A\nB", // adds 1 line
        },
        {
          start_line: 3,
          end_line: 4,
          delete: true, // removes 1 line (now line 4 after first patch)
        },
        {
          start_line: 5,
          end_line: 6,
          delete: false,
          replace: "X\nY\nZ", // adds 2 lines (now line 5 after previous patches)
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nA\nB\nline 2\nline 4\nX\nY\nZ");
    });

    test("should handle multiple patches that expand and contract", () => {
      const text = "a\nb\nc\nd\ne";
      const patches = [
        {
          start_line: 1,
          end_line: 3,
          delete: false,
          replace: "B", // replace 2 lines with 1 (net -1)
        },
        {
          start_line: 3,
          end_line: 4,
          delete: false,
          replace: "D1\nD2\nD3", // replace 1 line with 3 (net +2)
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("a\nB\nD1\nD2\nD3\ne");
    });

    test("should handle multiple consecutive deletions", () => {
      const text = "0\n1\n2\n3\n4\n5\n6\n7\n8\n9";
      const patches = [
        {
          start_line: 2,
          end_line: 3,
          delete: true,
        },
        {
          start_line: 4,
          end_line: 5,
          delete: true,
        },
        {
          start_line: 6,
          end_line: 7,
          delete: true,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("0\n1\n3\n5\n7\n8\n9");
    });

    test("should handle patches at boundaries (first and last)", () => {
      const text = "first\nmiddle1\nmiddle2\nlast";
      const patches = [
        {
          start_line: 0,
          end_line: 1,
          delete: false,
          replace: "NEW FIRST",
        },
        {
          start_line: 3,
          end_line: 4,
          delete: false,
          replace: "NEW LAST",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("NEW FIRST\nmiddle1\nmiddle2\nNEW LAST");
    });

    test("should handle five patches with complex interactions", () => {
      const text = "L0\nL1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9";
      const patches = [
        { start_line: 1, end_line: 2, delete: true }, // Remove L1 - [1,2) deletes 1 line
        { start_line: 3, end_line: 5, delete: false, replace: "NEW3-4" }, // Replace L3-L4 (2 lines) - [3,5) replaces 2 lines
        { start_line: 6, end_line: 7, delete: false, replace: "A\nB\nC" }, // Replace L6 (1 line) - [6,7) replaces 1 line
        { start_line: 8, end_line: 9, delete: true }, // Remove L8 - [8,9) deletes 1 line
        { start_line: 9, end_line: 10, delete: false, replace: "FINAL" }, // Replace L9 - [9,10) replaces 1 line
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("L0\nL2\nNEW3-4\nL5\nA\nB\nC\nL7\nFINAL");
    });
  });

  describe("edge cases", () => {
    test("should handle empty text", () => {
      const text = "";
      const patches = [];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("");
    });

    test("should handle empty patches array", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nline 1\nline 2");
    });

    test("should handle text with no newlines", () => {
      const text = "single line";
      const patches = [
        {
          start_line: 0,
          end_line: 1,
          delete: false,
          replace: "replaced line",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("replaced line");
    });

    test("should handle YAML-like structure", () => {
      const text = `project:
  title: Old Title
  description: Old Description
documents:
  - title: Doc 1`;

      const patches = [
        {
          start_line: 1,
          end_line: 3,
          delete: false,
          replace: "  title: New Title\n  description: New Description",
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe(`project:
  title: New Title
  description: New Description
documents:
  - title: Doc 1`);
    });

    test("should handle patches with undefined replace property when delete is false", () => {
      const text = "line 0\nline 1\nline 2";
      const patches = [
        {
          start_line: 1,
          end_line: 2,
          delete: false,
          // replace is undefined
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe("line 0\nline 2");
    });
  });

  describe("real-world scenarios", () => {
    test("should handle creating initial document structure", () => {
      const text = "";
      const patches = [
        {
          start_line: 0,
          end_line: 1,
          delete: false,
          replace: `project:
  title: My Project
  description: A great project
documents: []`,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe(`project:
  title: My Project
  description: A great project
documents: []`);
    });

    test("should handle adding a document to empty documents array", () => {
      const text = `project:
  title: My Project
documents: []`;

      const patches = [
        {
          start_line: 2,
          end_line: 3,
          delete: false,
          replace: `documents:
  - title: Getting Started
    description: Introduction to the project
    sourcePaths:
      - README.md
    children: []`,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe(`project:
  title: My Project
documents:
  - title: Getting Started
    description: Introduction to the project
    sourcePaths:
      - README.md
    children: []`);
    });

    test("should handle updating project metadata", () => {
      const text = `project:
  title: Old Title
  description: Old Description
documents: []`;

      const patches = [
        {
          start_line: 0,
          end_line: 3,
          delete: false,
          replace: `project:
  title: New Title
  description: New Description`,
        },
      ];

      const result = applyCustomPatches(text, patches);
      expect(result).toBe(`project:
  title: New Title
  description: New Description
documents: []`);
    });
  });
});
