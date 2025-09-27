import { describe, expect, test } from "bun:test";
import {
  BLOCKLET_ADD_COMPONENT_DOCS,
  CONFLICT_RESOLUTION_RULES,
  CONFLICT_RULES,
  D2_CONFIG,
  DEFAULT_EXCLUDE_PATTERNS,
  DEFAULT_INCLUDE_PATTERNS,
  DISCUSS_KIT_DID,
  DISCUSS_KIT_STORE_URL,
  DOCUMENT_STYLES,
  DOCUMENTATION_DEPTH,
  FILE_CONCURRENCY,
  KROKI_CONCURRENCY,
  PURPOSE_TO_KNOWLEDGE_MAPPING,
  READER_KNOWLEDGE_LEVELS,
  SUPPORTED_FILE_EXTENSIONS,
  SUPPORTED_LANGUAGES,
  TARGET_AUDIENCES,
  TMP_ASSETS_DIR,
  TMP_DIR,
  TMP_DOCS_DIR,
} from "../../utils/constants/index.mjs";

describe("constants", () => {
  describe("DEFAULT_INCLUDE_PATTERNS", () => {
    test("should contain common programming language patterns", () => {
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.js");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.ts");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.py");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.java");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.go");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.rs");
    });

    test("should contain documentation patterns", () => {
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.md");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.rst");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.yaml");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.json");
    });

    test("should contain media file patterns", () => {
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.png");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.jpg");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.svg");
      expect(DEFAULT_INCLUDE_PATTERNS).toContain("*.mp4");
    });

    test("should be an array of strings", () => {
      expect(Array.isArray(DEFAULT_INCLUDE_PATTERNS)).toBe(true);
      expect(DEFAULT_INCLUDE_PATTERNS.length).toBeGreaterThan(0);
      DEFAULT_INCLUDE_PATTERNS.forEach((pattern) => {
        expect(typeof pattern).toBe("string");
      });
    });
  });

  describe("DEFAULT_EXCLUDE_PATTERNS", () => {
    test("should contain common exclusion patterns", () => {
      expect(DEFAULT_EXCLUDE_PATTERNS).toContain("**/*node_modules/**");
      expect(DEFAULT_EXCLUDE_PATTERNS).toContain("**/*test/**");
      expect(DEFAULT_EXCLUDE_PATTERNS).toContain("**/*tests/**");
      expect(DEFAULT_EXCLUDE_PATTERNS).toContain("**/dist/**");
      expect(DEFAULT_EXCLUDE_PATTERNS).toContain(".git/**");
    });

    test("should be an array of strings", () => {
      expect(Array.isArray(DEFAULT_EXCLUDE_PATTERNS)).toBe(true);
      expect(DEFAULT_EXCLUDE_PATTERNS.length).toBeGreaterThan(0);
      DEFAULT_EXCLUDE_PATTERNS.forEach((pattern) => {
        expect(typeof pattern).toBe("string");
      });
    });
  });

  describe("SUPPORTED_LANGUAGES", () => {
    test("should contain common languages", () => {
      const codes = SUPPORTED_LANGUAGES.map((lang) => lang.code);
      expect(codes).toContain("en");
      expect(codes).toContain("zh");
      expect(codes).toContain("ja");
      expect(codes).toContain("ko");
      expect(codes).toContain("es");
      expect(codes).toContain("fr");
    });

    test("should have proper structure", () => {
      SUPPORTED_LANGUAGES.forEach((lang) => {
        expect(lang).toHaveProperty("code");
        expect(lang).toHaveProperty("label");
        expect(lang).toHaveProperty("sample");
        expect(typeof lang.code).toBe("string");
        expect(typeof lang.label).toBe("string");
        expect(typeof lang.sample).toBe("string");
      });
    });
  });

  describe("DOCUMENT_STYLES", () => {
    test("should contain all expected document styles", () => {
      const expectedStyles = [
        "getStarted",
        "completeTasks",
        "findAnswers",
        "understandSystem",
        "solveProblems",
        "mixedPurpose",
      ];

      expectedStyles.forEach((style) => {
        expect(DOCUMENT_STYLES).toHaveProperty(style);
      });
    });

    test("should have proper structure for each style", () => {
      Object.values(DOCUMENT_STYLES).forEach((style) => {
        expect(style).toHaveProperty("name");
        expect(style).toHaveProperty("description");
        expect(style).toHaveProperty("content");
        expect(typeof style.name).toBe("string");
        expect(typeof style.description).toBe("string");
        expect(typeof style.content).toBe("string");
      });
    });
  });

  describe("TARGET_AUDIENCES", () => {
    test("should contain all expected audience types", () => {
      const expectedAudiences = [
        "endUsers",
        "developers",
        "devops",
        "decisionMakers",
        "supportTeams",
        "mixedTechnical",
      ];

      expectedAudiences.forEach((audience) => {
        expect(TARGET_AUDIENCES).toHaveProperty(audience);
      });
    });

    test("should have proper structure for each audience", () => {
      Object.values(TARGET_AUDIENCES).forEach((audience) => {
        expect(audience).toHaveProperty("name");
        expect(audience).toHaveProperty("description");
        expect(audience).toHaveProperty("content");
        expect(typeof audience.name).toBe("string");
        expect(typeof audience.description).toBe("string");
        expect(typeof audience.content).toBe("string");
      });
    });
  });

  describe("READER_KNOWLEDGE_LEVELS", () => {
    test("should contain all expected knowledge levels", () => {
      const expectedLevels = [
        "completeBeginners",
        "domainFamiliar",
        "experiencedUsers",
        "emergencyTroubleshooting",
        "exploringEvaluating",
      ];

      expectedLevels.forEach((level) => {
        expect(READER_KNOWLEDGE_LEVELS).toHaveProperty(level);
      });
    });

    test("should have proper structure for each level", () => {
      Object.values(READER_KNOWLEDGE_LEVELS).forEach((level) => {
        expect(level).toHaveProperty("name");
        expect(level).toHaveProperty("description");
        expect(level).toHaveProperty("content");
        expect(typeof level.name).toBe("string");
        expect(typeof level.description).toBe("string");
        expect(typeof level.content).toBe("string");
      });
    });
  });

  describe("DOCUMENTATION_DEPTH", () => {
    test("should contain all expected depth levels", () => {
      const expectedDepths = ["essentialOnly", "balancedCoverage", "comprehensive", "aiDecide"];

      expectedDepths.forEach((depth) => {
        expect(DOCUMENTATION_DEPTH).toHaveProperty(depth);
      });
    });

    test("should have proper structure for each depth", () => {
      Object.values(DOCUMENTATION_DEPTH).forEach((depth) => {
        expect(depth).toHaveProperty("name");
        expect(depth).toHaveProperty("description");
        expect(depth).toHaveProperty("content");
        expect(typeof depth.name).toBe("string");
        expect(typeof depth.description).toBe("string");
        expect(typeof depth.content).toBe("string");
      });
    });
  });

  describe("PURPOSE_TO_KNOWLEDGE_MAPPING", () => {
    test("should map purposes to knowledge levels", () => {
      expect(PURPOSE_TO_KNOWLEDGE_MAPPING).toHaveProperty("getStarted");
      expect(PURPOSE_TO_KNOWLEDGE_MAPPING).toHaveProperty("findAnswers");
      expect(PURPOSE_TO_KNOWLEDGE_MAPPING).toHaveProperty("solveProblems");
      expect(PURPOSE_TO_KNOWLEDGE_MAPPING).toHaveProperty("exploringEvaluating");

      expect(PURPOSE_TO_KNOWLEDGE_MAPPING.getStarted).toBe("completeBeginners");
      expect(PURPOSE_TO_KNOWLEDGE_MAPPING.findAnswers).toBe("experiencedUsers");
    });
  });

  describe("CONFLICT_RULES", () => {
    test("should have internal and cross conflicts", () => {
      expect(CONFLICT_RULES).toHaveProperty("internalConflicts");
      expect(CONFLICT_RULES).toHaveProperty("crossConflicts");
      expect(Array.isArray(CONFLICT_RULES.crossConflicts)).toBe(true);
    });

    test("should have proper structure for cross conflicts", () => {
      CONFLICT_RULES.crossConflicts.forEach((conflict) => {
        expect(conflict).toHaveProperty("conditions");
        expect(conflict).toHaveProperty("severity");
        expect(conflict).toHaveProperty("reason");
        expect(conflict).toHaveProperty("action");
        expect(conflict).toHaveProperty("conflictingOptions");
      });
    });
  });

  describe("CONFLICT_RESOLUTION_RULES", () => {
    test("should have resolution rules for different conflict types", () => {
      expect(CONFLICT_RESOLUTION_RULES).toHaveProperty("documentPurpose");
      expect(CONFLICT_RESOLUTION_RULES).toHaveProperty("targetAudienceTypes");
      expect(Array.isArray(CONFLICT_RESOLUTION_RULES.documentPurpose)).toBe(true);
      expect(Array.isArray(CONFLICT_RESOLUTION_RULES.targetAudienceTypes)).toBe(true);
    });

    test("should have proper structure for resolution rules", () => {
      CONFLICT_RESOLUTION_RULES.documentPurpose.forEach((rule) => {
        expect(rule).toHaveProperty("conflictItems");
        expect(rule).toHaveProperty("strategy");
        expect(rule).toHaveProperty("description");
        expect(Array.isArray(rule.conflictItems)).toBe(true);
      });
    });
  });

  describe("Numeric constants", () => {
    test("should have valid numeric values", () => {
      expect(typeof KROKI_CONCURRENCY).toBe("number");
      expect(typeof FILE_CONCURRENCY).toBe("number");
      expect(KROKI_CONCURRENCY).toBeGreaterThan(0);
      expect(FILE_CONCURRENCY).toBeGreaterThan(0);
    });
  });

  describe("String constants", () => {
    test("should have valid string values", () => {
      expect(typeof TMP_DIR).toBe("string");
      expect(typeof TMP_DOCS_DIR).toBe("string");
      expect(typeof TMP_ASSETS_DIR).toBe("string");
      expect(typeof DISCUSS_KIT_DID).toBe("string");
      expect(typeof DISCUSS_KIT_STORE_URL).toBe("string");
      expect(typeof BLOCKLET_ADD_COMPONENT_DOCS).toBe("string");
      expect(typeof D2_CONFIG).toBe("string");
    });

    test("should have valid URLs", () => {
      expect(DISCUSS_KIT_STORE_URL).toMatch(/^https?:\/\//);
      expect(BLOCKLET_ADD_COMPONENT_DOCS).toMatch(/^https?:\/\//);
    });
  });

  describe("SUPPORTED_FILE_EXTENSIONS", () => {
    test("should contain common file extensions", () => {
      expect(SUPPORTED_FILE_EXTENSIONS).toContain(".txt");
      expect(SUPPORTED_FILE_EXTENSIONS).toContain(".md");
      expect(SUPPORTED_FILE_EXTENSIONS).toContain(".json");
      expect(SUPPORTED_FILE_EXTENSIONS).toContain(".yaml");
      expect(SUPPORTED_FILE_EXTENSIONS).toContain(".yml");
    });

    test("should be an array of strings starting with dots", () => {
      expect(Array.isArray(SUPPORTED_FILE_EXTENSIONS)).toBe(true);
      SUPPORTED_FILE_EXTENSIONS.forEach((ext) => {
        expect(typeof ext).toBe("string");
        expect(ext.startsWith(".")).toBe(true);
      });
    });
  });
});
