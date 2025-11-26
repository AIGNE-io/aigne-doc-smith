import { test, expect, describe } from "bun:test";
import convertStructureToPlan from "./convert-structure-to-plan.mjs";

describe("convertStructureToPlan", () => {
  describe("basic conversion", () => {
    test("should convert simple structure with one root document", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: Getting Started
    description: Introduction to the project
    sourcePaths:
      - README.md
    children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan).toEqual([
        {
          title: "Getting Started",
          description: "Introduction to the project",
          path: "/getting-started",
          parentId: null,
          sourceIds: ["README.md"],
        },
      ]);
    });

    test("should convert structure with nested children", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: Getting Started
    description: Introduction
    sourcePaths:
      - README.md
    children:
      - title: Installation
        description: How to install
        sourcePaths:
          - docs/install.md
        children: []
      - title: Configuration
        description: How to configure
        sourcePaths:
          - docs/config.md
        children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan).toEqual([
        {
          title: "Getting Started",
          description: "Introduction",
          path: "/getting-started",
          parentId: null,
          sourceIds: ["README.md"],
        },
        {
          title: "Installation",
          description: "How to install",
          path: "/getting-started/installation",
          parentId: "/getting-started",
          sourceIds: ["docs/install.md"],
        },
        {
          title: "Configuration",
          description: "How to configure",
          path: "/getting-started/configuration",
          parentId: "/getting-started",
          sourceIds: ["docs/config.md"],
        },
      ]);
    });

    test("should convert structure with multiple root documents", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: Getting Started
    description: Introduction
    sourcePaths:
      - README.md
    children: []
  - title: API Reference
    description: API documentation
    sourcePaths:
      - docs/api.md
    children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan).toEqual([
        {
          title: "Getting Started",
          description: "Introduction",
          path: "/getting-started",
          parentId: null,
          sourceIds: ["README.md"],
        },
        {
          title: "API Reference",
          description: "API documentation",
          path: "/api-reference",
          parentId: null,
          sourceIds: ["docs/api.md"],
        },
      ]);
    });

    test("should convert deeply nested structure", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: Getting Started
    description: Introduction
    sourcePaths:
      - README.md
    children:
      - title: Installation
        description: How to install
        sourcePaths:
          - docs/install.md
        children:
          - title: Prerequisites
            description: What you need
            sourcePaths:
              - docs/install/prereqs.md
            children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan).toEqual([
        {
          title: "Getting Started",
          description: "Introduction",
          path: "/getting-started",
          parentId: null,
          sourceIds: ["README.md"],
        },
        {
          title: "Installation",
          description: "How to install",
          path: "/getting-started/installation",
          parentId: "/getting-started",
          sourceIds: ["docs/install.md"],
        },
        {
          title: "Prerequisites",
          description: "What you need",
          path: "/getting-started/installation/prerequisites",
          parentId: "/getting-started/installation",
          sourceIds: ["docs/install/prereqs.md"],
        },
      ]);
    });
  });

  describe("title slugification", () => {
    test("should handle titles with spaces", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: Getting Started Guide
    description: Introduction
    sourcePaths:
      - README.md
    children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan[0].path).toBe("/getting-started-guide");
    });

    test("should handle titles with special characters", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: "API & SDK Reference"
    description: API docs
    sourcePaths:
      - README.md
    children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan[0].path).toBe("/api-sdk-reference");
    });

    test("should handle titles with colons", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: "Package: Core"
    description: Core package
    sourcePaths:
      - README.md
    children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan[0].path).toBe("/package-core");
    });

    test("should handle titles with numbers", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: "Version 2.0 Guide"
    description: Guide
    sourcePaths:
      - README.md
    children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan[0].path).toBe("/version-2-0-guide");
    });
  });

  describe("edge cases", () => {
    test("should handle empty documents array", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan).toEqual([]);
    });

    test("should handle multiple source paths", async () => {
      const yamlStructure = `project:
  title: My Project
  description: A test project
documents:
  - title: Getting Started
    description: Introduction
    sourcePaths:
      - README.md
      - QUICKSTART.md
      - docs/intro.md
    children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan[0].sourceIds).toEqual([
        "README.md",
        "QUICKSTART.md",
        "docs/intro.md",
      ]);
    });

    test("should throw error when no structure in context", async () => {
      const options = {
        context: {
          userContext: {},
        },
      };

      await expect(convertStructureToPlan(null, options)).rejects.toThrow(
        "No document structure found in context"
      );
    });
  });

  describe("complex hierarchies", () => {
    test("should handle multiple packages with nested docs", async () => {
      const yamlStructure = `project:
  title: My Monorepo
  description: A test monorepo
documents:
  - title: Overview
    description: Project overview
    sourcePaths:
      - README.md
    children: []
  - title: "Package: Core"
    description: Core package
    sourcePaths:
      - packages/core/README.md
    children:
      - title: Core API
        description: Core API reference
        sourcePaths:
          - packages/core/docs/api.md
        children: []
      - title: Core Configuration
        description: How to configure core
        sourcePaths:
          - packages/core/docs/config.md
        children: []
  - title: "Package: Utils"
    description: Utils package
    sourcePaths:
      - packages/utils/README.md
    children:
      - title: Utils API
        description: Utils API reference
        sourcePaths:
          - packages/utils/docs/api.md
        children: []`;

      const options = {
        context: {
          userContext: {
            documentStructure: yamlStructure,
          },
        },
      };

      const result = await convertStructureToPlan(null, options);

      expect(result.structurePlan).toEqual([
        {
          title: "Overview",
          description: "Project overview",
          path: "/overview",
          parentId: null,
          sourceIds: ["README.md"],
        },
        {
          title: "Package: Core",
          description: "Core package",
          path: "/package-core",
          parentId: null,
          sourceIds: ["packages/core/README.md"],
        },
        {
          title: "Core API",
          description: "Core API reference",
          path: "/package-core/core-api",
          parentId: "/package-core",
          sourceIds: ["packages/core/docs/api.md"],
        },
        {
          title: "Core Configuration",
          description: "How to configure core",
          path: "/package-core/core-configuration",
          parentId: "/package-core",
          sourceIds: ["packages/core/docs/config.md"],
        },
        {
          title: "Package: Utils",
          description: "Utils package",
          path: "/package-utils",
          parentId: null,
          sourceIds: ["packages/utils/README.md"],
        },
        {
          title: "Utils API",
          description: "Utils API reference",
          path: "/package-utils/utils-api",
          parentId: "/package-utils",
          sourceIds: ["packages/utils/docs/api.md"],
        },
      ]);
    });
  });
});
