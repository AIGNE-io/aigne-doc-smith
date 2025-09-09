import { describe, expect, test } from "bun:test";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse as parseYAML } from "yaml";
import init, { generateYAML } from "../agents/init/init.mjs";

describe("generateYAML", () => {
  // Helper function to parse YAML and verify it's valid
  function parseAndValidateYAML(yamlString) {
    let config;
    expect(() => {
      config = parseYAML(yamlString);
    }).not.toThrow(); // YAML should be parseable
    expect(config).toBeDefined();
    return config;
  }
  describe("Complete valid user scenarios", () => {
    test("should handle typical developer-focused configuration", () => {
      const input = {
        // Question 1: Document Purpose (checkbox, at least 1)
        documentPurpose: ["getStarted", "findAnswers"],

        // Question 2: Target Audience (checkbox, at least 1)
        targetAudienceTypes: ["developers"],

        // Question 3: Reader Knowledge Level (select, single choice)
        readerKnowledgeLevel: "domainFamiliar",

        // Question 4: Documentation Depth (select, single choice)
        documentationDepth: "balancedCoverage",

        // Question 5: Primary Language (select, single choice)
        locale: "en",

        // Question 6: Translation Languages (checkbox, optional)
        translateLanguages: ["zh", "ja"],

        // Question 7: Documentation Directory (input, with default)
        docsDir: ".aigne/doc-smith/docs",

        // Question 8: Source Paths (multiple inputs, with default)
        sourcesPath: ["./src", "./lib"],

        // Project Info (from getProjectInfo)
        projectName: "My Awesome Project",
        projectDesc: "A comprehensive library for developers",
        projectLogo: "assets/logo.png",
      };

      const result = generateYAML(input);

      // Parse and validate YAML structure
      const config = parseAndValidateYAML(result);

      // Verify project information
      expect(config.projectName).toBe("My Awesome Project");
      expect(config.projectDesc).toBe("A comprehensive library for developers");
      expect(config.projectLogo).toBe("assets/logo.png");

      // Verify document purpose array
      expect(Array.isArray(config.documentPurpose)).toBe(true);
      expect(config.documentPurpose).toEqual(["getStarted", "findAnswers"]);

      // Verify target audience array
      expect(Array.isArray(config.targetAudienceTypes)).toBe(true);
      expect(config.targetAudienceTypes).toEqual(["developers"]);

      // Verify single value fields
      expect(config.readerKnowledgeLevel).toBe("domainFamiliar");
      expect(config.documentationDepth).toBe("balancedCoverage");
      expect(config.locale).toBe("en");

      // Verify translation languages array
      expect(Array.isArray(config.translateLanguages)).toBe(true);
      expect(config.translateLanguages).toEqual(["zh", "ja"]);

      // Verify paths
      expect(config.docsDir).toBe(".aigne/doc-smith/docs");
      expect(Array.isArray(config.sourcesPath)).toBe(true);
      expect(config.sourcesPath).toEqual(["./src", "./lib"]);

      // Verify comments are present (using string matching for comments)
      expect(result).toContain("# Project information for documentation publishing");
      expect(result).toContain("# Documentation Configuration");
    });

    test("should handle end-user focused minimal configuration", () => {
      const input = {
        documentPurpose: ["getStarted"],
        targetAudienceTypes: ["endUsers"],
        readerKnowledgeLevel: "completeBeginners",
        documentationDepth: "essentialOnly",
        locale: "en",
        translateLanguages: [],
        docsDir: "./docs",
        sourcesPath: ["./"],
        projectName: "User-Friendly App",
        projectDesc: "Simple app for everyone",
        projectLogo: "",
      };

      const result = generateYAML(input);

      // Parse and validate YAML structure
      const config = parseAndValidateYAML(result);

      // Verify configuration values
      expect(config.documentPurpose).toEqual(["getStarted"]);
      expect(config.targetAudienceTypes).toEqual(["endUsers"]);
      expect(config.readerKnowledgeLevel).toBe("completeBeginners");
      expect(config.documentationDepth).toBe("essentialOnly");
      expect(config.locale).toBe("en");
      expect(config.translateLanguages).toEqual(undefined);
      expect(config.docsDir).toBe("./docs");
      expect(config.sourcesPath).toEqual(["./"]);
      expect(config.projectName).toBe("User-Friendly App");
      expect(config.projectDesc).toBe("Simple app for everyone");
      expect(config.projectLogo).toBe("");

      // Verify comments for empty translateLanguages (string matching for comments)
      expect(result).toContain("# translateLanguages:  # List of languages to translate");
    });

    test("should handle mixed purpose with priority selection", () => {
      // Simulates user selecting mixedPurpose first, then choosing top 2 priorities
      const input = {
        documentPurpose: ["completeTasks", "findAnswers"], // The 2 priorities selected after mixedPurpose
        targetAudienceTypes: ["developers", "devops"],
        readerKnowledgeLevel: "experiencedUsers",
        documentationDepth: "comprehensive",
        locale: "zh-CN",
        translateLanguages: ["en"],
        docsDir: "./documentation",
        sourcesPath: ["./src/**/*.js", "./lib/**/*.ts"],
        projectName: "Enterprise Solution",
        projectDesc: "Advanced enterprise-grade solution",
        projectLogo: "brand/logo.svg",
      };

      const result = generateYAML(input);

      expect(result).toContain("- completeTasks");
      expect(result).toContain("- findAnswers");
      expect(result).toContain("- developers");
      expect(result).toContain("- devops");
      expect(result).toContain("locale: zh-CN");
      expect(result).toContain("- en");
    });
  });

  describe("Document Purpose combinations", () => {
    test("should handle single purpose selection", () => {
      const validPurposes = [
        "getStarted",
        "completeTasks",
        "findAnswers",
        "understandSystem",
        "solveProblems",
      ];

      validPurposes.forEach((purpose) => {
        const input = {
          documentPurpose: [purpose],
          targetAudienceTypes: ["developers"],
          locale: "en",
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        expect(config.documentPurpose).toEqual([purpose]);
      });
    });

    test("should handle multiple purpose combinations", () => {
      const combinations = [
        ["getStarted", "completeTasks"],
        ["findAnswers", "solveProblems"],
        ["understandSystem", "completeTasks", "findAnswers"],
      ];

      combinations.forEach((purposes) => {
        const input = {
          documentPurpose: purposes,
          targetAudienceTypes: ["developers"],
          locale: "en",
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        expect(config.documentPurpose).toEqual(purposes);
      });
    });
  });

  describe("Target Audience combinations", () => {
    test("should handle all valid audience types", () => {
      const validAudiences = [
        "endUsers",
        "developers",
        "devops",
        "decisionMakers",
        "supportTeams",
        "mixedTechnical",
      ];

      validAudiences.forEach((audience) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: [audience],
          locale: "en",
        };

        const result = generateYAML(input);
        expect(result).toContain(`- ${audience}`);
      });
    });

    test("should handle mixed audience selections", () => {
      const input = {
        documentPurpose: ["completeTasks"],
        targetAudienceTypes: ["developers", "devops", "supportTeams"],
        locale: "en",
      };

      const result = generateYAML(input);
      expect(result).toContain("- developers");
      expect(result).toContain("- devops");
      expect(result).toContain("- supportTeams");
    });
  });

  describe("Knowledge Level scenarios", () => {
    test("should handle all valid knowledge levels", () => {
      const validLevels = [
        "completeBeginners",
        "domainFamiliar",
        "hasBasicKnowledge",
        "experiencedUsers",
        "emergencyTroubleshooting",
        "exploringEvaluating",
      ];

      validLevels.forEach((level) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          readerKnowledgeLevel: level,
          locale: "en",
          docsDir: "./docs", // Provide required field to avoid YAML generation bug
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        expect(config.readerKnowledgeLevel).toBe(level);
      });
    });
  });

  describe("Documentation Depth scenarios", () => {
    test("should handle all valid depth levels", () => {
      const validDepths = ["essentialOnly", "balancedCoverage", "comprehensive", "aiDecide"];

      validDepths.forEach((depth) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          documentationDepth: depth,
          locale: "en",
        };

        const result = generateYAML(input);
        expect(result).toContain(`documentationDepth: ${depth}`);
      });
    });
  });

  describe("Locale and translation scenarios", () => {
    test("should handle all supported locales", () => {
      const supportedLocales = [
        "en",
        "zh",
        "ja",
        "ko",
        "es",
        "fr",
        "de",
        "it",
        "pt",
        "ru",
        "ar",
        "hi",
        "th",
        "vi",
        "id",
        "ms",
        "tl",
        "tr",
        "pl",
        "nl",
        "sv",
        "da",
        "no",
        "fi",
        "hu",
        "cs",
        "sk",
        "ro",
        "bg",
        "hr",
        "sl",
        "et",
        "lv",
        "lt",
        "mt",
        "el",
        "he",
        "fa",
        "ur",
        "bn",
        "ta",
        "te",
        "kn",
        "ml",
        "gu",
        "pa",
        "or",
        "as",
        "ne",
        "si",
      ];

      // Test a subset to keep test reasonable
      const testLocales = supportedLocales.slice(0, 10);

      testLocales.forEach((locale) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: locale,
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        expect(config.locale).toBe(locale);
      });
    });

    test("should handle complex locale formats", () => {
      const complexLocales = ["zh-CN", "zh-TW", "en-US", "en-GB", "pt-BR", "es-ES", "fr-CA"];

      complexLocales.forEach((locale) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: locale,
        };

        const result = generateYAML(input);
        expect(result).toContain(`locale: ${locale}`);
      });
    });

    test("should handle translation language combinations", () => {
      const input = {
        documentPurpose: ["getStarted"],
        targetAudienceTypes: ["developers"],
        locale: "en",
        translateLanguages: ["zh", "ja", "ko", "es", "fr"],
      };

      const result = generateYAML(input);
      expect(result).toContain("translateLanguages:");
      expect(result).toContain("- zh");
      expect(result).toContain("- ja");
      expect(result).toContain("- ko");
      expect(result).toContain("- es");
      expect(result).toContain("- fr");
    });

    test("should handle empty translation languages", () => {
      const input = {
        documentPurpose: ["getStarted"],
        targetAudienceTypes: ["developers"],
        locale: "en",
        translateLanguages: [],
      };

      const result = generateYAML(input);
      expect(result).toContain("# translateLanguages:  # List of languages to translate");
      expect(result).toContain("#   - zh  # Example: Chinese translation");
      expect(result).toContain("#   - en  # Example: English translation");
    });
  });

  describe("Project info from GitHub/Git scenarios - Strict YAML validation", () => {
    test("should handle typical GitHub project names with various formats", () => {
      const githubProjectNames = [
        // Common GitHub naming patterns
        "awesome-project",
        "my_awesome_project",
        "AwesomeProject",
        "project-v2.0.1",
        "project_name_2024",
        "some-org.awesome-project",
        "project.config.js",
        "@scoped/package-name",
        "react-native-component",
        "vue3-typescript-starter",
        "nestjs-api-boilerplate",
        "k8s-deployment-tools",
      ];

      githubProjectNames.forEach((projectName) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: "en",
          docsDir: "./docs",
          projectName,
          projectDesc: `Description for ${projectName}`,
          projectLogo: "assets/logo.png",
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        expect(config.projectName).toBe(projectName);
        expect(config.projectDesc).toBe(`Description for ${projectName}`);
      });
    });

    test("should handle project names with special characters and symbols", () => {
      const specialCharacterNames = [
        // YAML potentially problematic characters
        "project: with colon",
        'project "with quotes"',
        "project 'with single quotes'",
        "project [with brackets]",
        "project {with braces}",
        "project | with pipe",
        "project > with gt",
        "project < with lt",
        "project & with ampersand",
        "project % with percent",
        "project # with hash",
        "project @ with at",
        "project ! with exclamation",
        "project ? with question",
        "project * with asterisk",
        "project ~ with tilde",
        "project ` with backtick",
        "project \\ with backslash",
        "project / with slash",
      ];

      specialCharacterNames.forEach((projectName) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: "en",
          docsDir: "./docs",
          projectName,
          projectDesc: "Project with special characters",
          projectLogo: "logo.png",
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        // YAML should be valid and preserve the exact project name
        expect(config.projectName).toBe(projectName);
      });
    });

    test("should handle project descriptions with complex formatting", () => {
      const complexDescriptions = [
        // Multi-line with various formatting
        "Line 1: Overview\nLine 2: Features\n\nLine 4: Usage",
        "Description with\ttabs\tand\nnewlines",
        "Description with 'single quotes' and \"double quotes\"",
        "Description with [links](http://example.com) and *emphasis*",
        "Description with #hashtags and @mentions",
        'JSON-like content: {"key": "value", "array": [1, 2, 3]}',
        "YAML-like content:\n  key: value\n  list:\n    - item1\n    - item2",
        "Code snippets: `npm install` and ```javascript\nconsole.log('hello');\n```",
        "URLs: https://github.com/user/repo and http://example.com:8080/path?query=value",
        "Email: user@example.com and file paths: /usr/local/bin/app",
      ];

      complexDescriptions.forEach((projectDesc) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: "en",
          docsDir: "./docs",
          projectName: "Test Project",
          projectDesc,
          projectLogo: "logo.png",
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        // YAML should be valid and preserve the exact description
        expect(config.projectDesc).toBe(projectDesc);
      });
    });

    test("should handle international and emoji-rich project info", () => {
      const internationalCases = [
        {
          projectName: "项目名称-中文",
          projectDesc: "这是一个中文项目描述，包含中文标点符号：，。！？",
          locale: "zh-CN",
        },
        {
          projectName: "プロジェクト名前-日本語",
          projectDesc: "これは日本語のプロジェクト説明です。ひらがな、カタカナ、漢字を含みます。",
          locale: "ja",
        },
        {
          projectName: "proyecto-español",
          projectDesc: "Descripción del proyecto con acentos: ñáéíóúü y signos ¡¿",
          locale: "es",
        },
        {
          projectName: "проект-русский",
          projectDesc: "Описание проекта на русском языке с кириллицей",
          locale: "ru",
        },
        {
          projectName: "مشروع-عربي",
          projectDesc: "وصف المشروع باللغة العربية من اليمين إلى اليسار",
          locale: "ar",
        },
        {
          projectName: "🚀 Awesome Project 🎉",
          projectDesc: "Project with emojis: 📱💻🔥⚡🌟✨🎯🚀💡🔧⭐🎨🎪🎭",
          locale: "en",
        },
        {
          projectName: "Mixed語言Project混合नाम",
          projectDesc: "Multi-language混合description with हिंदी, 中文, English, and العربية",
          locale: "en",
        },
      ];

      internationalCases.forEach(({ projectName, projectDesc, locale }) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale,
          docsDir: "./docs",
          projectName,
          projectDesc,
          projectLogo: "assets/logo.svg",
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        expect(config.projectName).toBe(projectName);
        expect(config.projectDesc).toBe(projectDesc);
        expect(config.locale).toBe(locale);
      });
    });

    test("should handle project logos with various path formats", () => {
      const logoPaths = [
        // Different path formats that might come from GitHub
        "logo.png",
        "assets/logo.svg",
        "docs/images/logo-128x128.png",
        "public/icons/favicon.ico",
        ".github/logo.jpg",
        "static/brand/logo_dark.png",
        "src/assets/images/logo@2x.png",
        "media/logos/company-logo.webp",
        "https://raw.githubusercontent.com/user/repo/main/logo.png",
        "https://github.com/user/repo/blob/main/assets/logo.svg?raw=true",
        // Paths with special characters
        "assets/logo with spaces.png",
        "logos/logo-企业.svg",
        "images/логотип.png",
        "assets/logo_v2.0-beta.png",
        "brand/logo[dark].png",
        "icons/logo{small}.ico",
      ];

      logoPaths.forEach((projectLogo) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: "en",
          docsDir: "./docs",
          projectName: "Test Project",
          projectDesc: "Project with various logo paths",
          projectLogo,
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        expect(config.projectLogo).toBe(projectLogo);
      });
    });

    test("should handle edge cases from GitHub repository parsing", () => {
      const edgeCases = [
        {
          name: "Empty values",
          projectName: "",
          projectDesc: "",
          projectLogo: "",
        },
        {
          name: "Whitespace-only values",
          projectName: "   ",
          projectDesc: "\n\n  \t  \n",
          projectLogo: "  ",
        },
        {
          name: "Very long values",
          projectName: "a".repeat(200),
          projectDesc:
            "This is a very long description that might come from a detailed README file. ".repeat(
              50,
            ),
          projectLogo:
            "assets/very/deep/path/to/a/logo/file/that/might/exist/in/some/repository/structure/logo.png",
        },
        {
          name: "YAML reserved words",
          projectName: "true",
          projectDesc: "false",
          projectLogo: "null",
        },
        {
          name: "Numeric strings",
          projectName: "123",
          projectDesc: "456.789",
          projectLogo: "0x123.png",
        },
        {
          name: "Boolean-like strings",
          projectName: "yes",
          projectDesc: "no",
          projectLogo: "on.svg",
        },
      ];

      edgeCases.forEach(({ projectName, projectDesc, projectLogo }) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: "en",
          docsDir: "./docs",
          projectName,
          projectDesc,
          projectLogo,
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        // All values should be preserved exactly as input
        expect(config.projectName).toBe(projectName);
        expect(config.projectDesc).toBe(projectDesc);
        expect(config.projectLogo).toBe(projectLogo);
      });
    });

    test("should handle GitHub-specific metadata patterns", () => {
      const githubPatterns = [
        {
          projectName: "facebook/react",
          projectDesc:
            "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
          projectLogo:
            "https://github.com/facebook/react/blob/main/fixtures/attribute-behavior/src/logo.svg",
        },
        {
          projectName: "microsoft/vscode",
          projectDesc:
            "Visual Studio Code - The editor you love. Built for developers, by developers.",
          projectLogo: "resources/linux/code.png",
        },
        {
          projectName: "vercel/next.js",
          projectDesc: "The React Framework – created and maintained by @vercel.",
          projectLogo: "docs/assets/next-logo.svg",
        },
        {
          projectName: "nodejs/node",
          projectDesc: "Node.js JavaScript runtime ✨🐢🚀✨",
          projectLogo: "src/res/node.ico",
        },
      ];

      githubPatterns.forEach(({ projectName, projectDesc, projectLogo }) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: "en",
          docsDir: "./docs",
          projectName,
          projectDesc,
          projectLogo,
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        expect(config.projectName).toBe(projectName);
        expect(config.projectDesc).toBe(projectDesc);
        expect(config.projectLogo).toBe(projectLogo);
      });
    });

    test("should handle malformed or unusual project info", () => {
      const malformedCases = [
        {
          name: "HTML-like content",
          projectName: "<script>alert('xss')</script>",
          projectDesc: "<h1>Title</h1><p>Description with <a href='#'>links</a></p>",
          projectLogo: "<img src='logo.png' alt='Logo'/>",
        },
        {
          name: "Markdown content",
          projectName: "# My Project",
          projectDesc:
            "## Description\n\n- Feature 1\n- Feature 2\n\n```js\nconsole.log('hello');\n```",
          projectLogo: "![Logo](logo.png)",
        },
        {
          name: "Control characters",
          projectName: "Project\x00Name",
          projectDesc: "Description\x01with\x02control\x03characters",
          projectLogo: "logo\x04.png",
        },
      ];

      malformedCases.forEach(({ projectName, projectDesc, projectLogo }) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: "en",
          docsDir: "./docs",
          projectName,
          projectDesc,
          projectLogo,
        };

        const result = generateYAML(input);
        const config = parseAndValidateYAML(result);

        // Even malformed content should be handled safely
        expect(config.projectName).toBe(projectName);
        expect(config.projectDesc).toBe(projectDesc);
        expect(config.projectLogo).toBe(projectLogo);
      });
    });
  });

  describe("User input path scenarios", () => {
    test("should handle documentation directory variations", () => {
      const docDirVariations = [
        "./docs",
        ".aigne/doc-smith/docs",
        "/absolute/path/to/docs",
        "~/user/docs",
        "../relative/docs",
        "docs with spaces",
        "文档目录",
      ];

      docDirVariations.forEach((docsDir) => {
        const input = {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["developers"],
          locale: "en",
          docsDir: docsDir,
        };

        const result = generateYAML(input);
        expect(result).toContain("docsDir:");
        expect(result).toBeDefined();
      });
    });

    test("should handle various source path patterns", () => {
      const input = {
        documentPurpose: ["getStarted"],
        targetAudienceTypes: ["developers"],
        locale: "en",
        sourcesPath: [
          "./src",
          "./lib",
          "packages/*/src",
          "apps/**/*.ts",
          "!**/*.test.js",
          "src with spaces",
          "源代码/模块",
        ],
      };

      const result = generateYAML(input);
      expect(result).toContain("sourcesPath:");
      expect(result).toContain("- ./src");
      expect(result).toContain("- ./lib");
      expect(result).toContain("- packages/*/src");
      expect(result).toBeDefined();
    });

    test("should handle single source path", () => {
      const input = {
        documentPurpose: ["getStarted"],
        targetAudienceTypes: ["developers"],
        locale: "en",
        sourcesPath: ["./"],
      };

      const result = generateYAML(input);
      expect(result).toContain("sourcesPath:");
      expect(result).toContain("- ./");
    });

    test("should handle complex glob patterns from user input", () => {
      const input = {
        documentPurpose: ["findAnswers"],
        targetAudienceTypes: ["developers"],
        locale: "en",
        sourcesPath: [
          "**/*.{js,ts,jsx,tsx}",
          "src/**/*.{vue,svelte}",
          "!**/node_modules/**",
          "{packages,apps}/**/*.py",
          "docs/**/*.md",
        ],
      };

      const result = generateYAML(input);
      expect(result).toContain("sourcesPath:");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("Edge cases that should not occur from init() but may happen", () => {
    test("should handle undefined required fields - exposes bug", () => {
      // This could happen if init() has bugs or incomplete validation
      const input = {
        documentPurpose: ["getStarted"],
        targetAudienceTypes: ["developers"],
        locale: undefined, // Should not happen from init()
        docsDir: undefined, // Should not happen from init()
      };

      const result = generateYAML(input);

      // This test will FAIL because the function generates invalid YAML
      // The YAML should be parseable and contain proper default values
      const config = parseAndValidateYAML(result);

      // These expectations will FAIL because function generates invalid "{}" values
      expect(config.locale).toBe("en"); // Should default to "en"
      expect(config.docsDir).toBe("./aigne/doc-smith/docs"); // Should default to "./docs"

      // Verify other fields work correctly
      expect(config.documentPurpose).toEqual(["getStarted"]);
      expect(config.targetAudienceTypes).toEqual(["developers"]);
    });

    test("should handle empty arrays from validation failures", () => {
      // This could happen if validation fails but doesn't stop execution
      const input = {
        documentPurpose: [], // Should not happen due to validation
        targetAudienceTypes: [], // Should not happen due to validation
        locale: "en",
        docsDir: "./docs",
      };

      const result = generateYAML(input);
      expect(result).toContain("documentPurpose: []");
      expect(result).toContain("targetAudienceTypes: []");
    });
  });

  describe("YAML output structure validation", () => {
    test("should maintain consistent structure across different inputs", () => {
      const inputs = [
        {
          documentPurpose: ["getStarted"],
          targetAudienceTypes: ["endUsers"],
          locale: "en",
        },
        {
          documentPurpose: ["findAnswers", "completeTasks"],
          targetAudienceTypes: ["developers", "devops"],
          locale: "zh-CN",
          translateLanguages: ["en", "ja"],
        },
      ];

      inputs.forEach((input) => {
        const result = generateYAML(input);

        // Should always include these sections
        expect(result).toContain("# Project information for documentation publishing");
        expect(result).toContain("# Documentation Configuration");
        expect(result).toContain("projectName:");
        expect(result).toContain("documentPurpose:");
        expect(result).toContain("targetAudienceTypes:");
        expect(result).toContain("locale:");
        expect(result).toContain("sourcesPath:");
      });
    });

    test("should include all necessary comments and examples", () => {
      const input = {
        documentPurpose: ["getStarted"],
        targetAudienceTypes: ["developers"],
        locale: "en",
        translateLanguages: [],
      };

      const result = generateYAML(input);

      expect(result).toContain("# Purpose: What's the main outcome");
      expect(result).toContain("# Available options (uncomment and modify as needed):");
      expect(result).toContain("# Target Audience: Who will be reading this most often?");
      expect(result).toContain("# Reader Knowledge Level:");
      expect(result).toContain("# Documentation Depth:");
      expect(result).toContain("# Custom Rules:");
      expect(result).toContain("# Glossary:");
    });
  });
});

describe("init", () => {
  // Helper function to create mock prompts
  function createMockPrompts(responses) {
    return {
      checkbox: (options) => {
        const key = options.message.match(/\[(\d+)\/\d+\]/)?.[1] || "default";
        const response = responses[`checkbox_${key}`] || responses["checkbox"] || [];
        return Promise.resolve(response);
      },
      select: (options) => {
        const key = options.message.match(/\[(\d+)\/\d+\]/)?.[1] || "default";
        const response = responses[`select_${key}`] || responses["select"] || "";
        return Promise.resolve(response);
      },
      input: (options) => {
        const key = options.message.match(/\[(\d+)\/\d+\]/)?.[1] || "default";
        const response = responses[`input_${key}`] || responses["input"] || options.default || "";
        return Promise.resolve(response);
      },
      search: () => {
        const response = responses["search"] || "";
        return Promise.resolve(response);
      },
    };
  }

  // Helper function to create temporary directory
  async function createTempDir() {
    const tempDir = join(tmpdir(), `aigne-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
  }

  // Helper function to cleanup temp directory
  async function cleanupTempDir(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors since they don't affect test results
    }
  }

  describe("Complete init workflow", () => {
    test("should complete full init workflow with typical developer responses", async () => {
      const tempDir = await createTempDir();

      try {
        const mockResponses = {
          checkbox_1: ["getStarted", "findAnswers"], // Document purpose
          checkbox_2: ["developers"], // Target audience
          select_3: "domainFamiliar", // Reader knowledge level
          select_4: "balancedCoverage", // Documentation depth
          select_5: "en", // Primary language
          checkbox_6: ["zh", "ja"], // Translation languages
          input_7: join(tempDir, "docs"), // Documentation directory
          search: "", // Source paths (empty to finish)
        };

        const mockPrompts = createMockPrompts(mockResponses);
        const options = { prompts: mockPrompts };

        const result = await init(
          {
            outputPath: tempDir,
            fileName: "config.yaml",
            skipIfExists: false,
          },
          options,
        );

        // Check that function completed successfully
        expect(result).toEqual({});

        // Check that config file was created
        const configPath = join(tempDir, "config.yaml");
        const configExists = await fs
          .access(configPath)
          .then(() => true)
          .catch(() => false);
        expect(configExists).toBe(true);

        // Verify the generated config content
        const configContent = await fs.readFile(configPath, "utf8");
        const config = parseYAML(configContent);

        expect(config.documentPurpose).toEqual(["getStarted", "findAnswers"]);
        expect(config.targetAudienceTypes).toEqual(["developers"]);
        expect(config.readerKnowledgeLevel).toBe("domainFamiliar");
        expect(config.documentationDepth).toBe("balancedCoverage");
        expect(config.locale).toBe("en");
        expect(config.translateLanguages).toEqual(["zh", "ja"]);
        expect(config.docsDir).toBe(join(tempDir, "docs"));
        expect(config.sourcesPath).toEqual(["./"]); // Default when no paths provided
      } finally {
        await cleanupTempDir(tempDir);
      }
    });

    test("should handle mixed purpose workflow with priority selection", async () => {
      const tempDir = await createTempDir();

      try {
        const mockResponses = {
          checkbox_1: ["mixedPurpose"], // Document purpose - triggers follow-up
          checkbox: ["completeTasks", "findAnswers"], // Top priorities after mixedPurpose
          checkbox_2: ["developers", "devops"], // Target audience
          select_3: "experiencedUsers", // Reader knowledge level
          select_4: "comprehensive", // Documentation depth
          select_5: "zh-CN", // Primary language
          checkbox_6: ["en"], // Translation languages
          input_7: join(tempDir, "documentation"), // Documentation directory
          search: "", // Source paths (empty to finish)
        };

        const mockPrompts = createMockPrompts(mockResponses);
        const options = { prompts: mockPrompts };

        const result = await init(
          {
            outputPath: tempDir,
            fileName: "test-config.yaml",
            skipIfExists: false,
          },
          options,
        );

        expect(result).toEqual({});

        // Verify the generated config
        const configPath = join(tempDir, "test-config.yaml");
        const configContent = await fs.readFile(configPath, "utf8");
        const config = parseYAML(configContent);

        expect(config.documentPurpose).toEqual(["completeTasks", "findAnswers"]);
        expect(config.targetAudienceTypes).toEqual(["developers", "devops"]);
        expect(config.readerKnowledgeLevel).toBe("experiencedUsers");
        expect(config.documentationDepth).toBe("comprehensive");
        expect(config.locale).toBe("zh-CN");
        expect(config.translateLanguages).toEqual(["en"]);
      } finally {
        await cleanupTempDir(tempDir);
      }
    });

    test("should handle end-user focused minimal configuration", async () => {
      const tempDir = await createTempDir();

      try {
        const mockResponses = {
          checkbox_1: ["getStarted"], // Document purpose
          checkbox_2: ["endUsers"], // Target audience
          select_3: "completeBeginners", // Reader knowledge level
          select_4: "essentialOnly", // Documentation depth
          select_5: "en", // Primary language
          checkbox_6: [], // No translation languages
          input_7: join(tempDir, "simple-docs"), // Documentation directory
          search: "", // Source paths (empty to finish)
        };

        const mockPrompts = createMockPrompts(mockResponses);
        const options = { prompts: mockPrompts };

        const result = await init(
          {
            outputPath: tempDir,
            fileName: "simple-config.yaml",
            skipIfExists: false,
          },
          options,
        );

        expect(result).toEqual({});

        const configPath = join(tempDir, "simple-config.yaml");
        const configContent = await fs.readFile(configPath, "utf8");
        const config = parseYAML(configContent);

        expect(config.documentPurpose).toEqual(["getStarted"]);
        expect(config.targetAudienceTypes).toEqual(["endUsers"]);
        expect(config.readerKnowledgeLevel).toBe("completeBeginners");
        expect(config.documentationDepth).toBe("essentialOnly");
        expect(config.locale).toBe("en");
        expect(config.translateLanguages).toBeUndefined();
      } finally {
        await cleanupTempDir(tempDir);
      }
    });
  });

  describe("Source paths handling", () => {
    test("should handle multiple source paths input when search returns valid paths", async () => {
      const tempDir = await createTempDir();

      try {
        let searchCallCount = 0;
        const sourcePaths = ["./src", "./lib", "./packages", ""];

        const mockPrompts = {
          checkbox: () => Promise.resolve(["getStarted"]),
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve(join(tempDir, "docs")),
          search: () => {
            const response = sourcePaths[searchCallCount];
            searchCallCount++;
            return Promise.resolve(response);
          },
        };

        const options = { prompts: mockPrompts };

        // First let's create the directories that will be searched for
        await fs.mkdir(join(process.cwd(), "src"), { recursive: true }).catch(() => {
          // Ignore if directory already exists
        });
        await fs.mkdir(join(process.cwd(), "lib"), { recursive: true }).catch(() => {
          // Ignore if directory already exists
        });
        await fs.mkdir(join(process.cwd(), "packages"), { recursive: true }).catch(() => {
          // Ignore if directory already exists
        });

        try {
          const result = await init(
            { outputPath: tempDir, fileName: "config.yaml", skipIfExists: false },
            options,
          );

          expect(result).toEqual({});

          const configPath = join(tempDir, "config.yaml");
          const configContent = await fs.readFile(configPath, "utf8");
          const config = parseYAML(configContent);

          // Should contain the paths that were added before empty string
          expect(config.sourcesPath.length).toBeGreaterThan(0);
        } finally {
          // Clean up test directories
          await fs.rm(join(process.cwd(), "src"), { recursive: true, force: true }).catch(() => {
            // Ignore cleanup errors since directories may not exist
          });
          await fs.rm(join(process.cwd(), "lib"), { recursive: true, force: true }).catch(() => {
            // Ignore cleanup errors since directories may not exist
          });
          await fs
            .rm(join(process.cwd(), "packages"), { recursive: true, force: true })
            .catch(() => {
              // Ignore cleanup errors since directories may not exist
            });
        }
      } finally {
        await cleanupTempDir(tempDir);
      }
    });

    test("should use default source path when no paths provided", async () => {
      const tempDir = await createTempDir();

      try {
        const mockPrompts = {
          checkbox: () => Promise.resolve(["getStarted"]),
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve(join(tempDir, "docs")),
          search: () => Promise.resolve(""), // Immediately finish without adding paths
        };

        const options = { prompts: mockPrompts };

        const result = await init(
          { outputPath: tempDir, fileName: "config.yaml", skipIfExists: false },
          options,
        );

        expect(result).toEqual({});

        const configPath = join(tempDir, "config.yaml");
        const configContent = await fs.readFile(configPath, "utf8");
        const config = parseYAML(configContent);

        expect(config.sourcesPath).toEqual(["./"]); // Default value
      } finally {
        await cleanupTempDir(tempDir);
      }
    });
  });

  describe("Skip existing configuration", () => {
    test("should skip if config exists and skipIfExists is true", async () => {
      const tempDir = await createTempDir();

      try {
        // Create existing config file
        const configPath = join(tempDir, "config.yaml");
        const existingConfig = 'projectName: "Existing Project"\nlocale: "zh"';
        await fs.writeFile(configPath, existingConfig, "utf8");

        const mockPrompts = {
          checkbox: () => Promise.resolve(["getStarted"]),
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve("docs"),
          search: () => Promise.resolve(""),
        };

        const options = { prompts: mockPrompts };

        const result = await init(
          { outputPath: tempDir, fileName: "config.yaml", skipIfExists: true },
          options,
        );

        expect(result).toEqual({});

        // Config should remain unchanged
        const configContent = await fs.readFile(configPath, "utf8");
        expect(configContent).toBe(existingConfig);
      } finally {
        await cleanupTempDir(tempDir);
      }
    });

    test("should not skip if config file is empty even when skipIfExists is true", async () => {
      const tempDir = await createTempDir();

      try {
        // Create empty config file
        const configPath = join(tempDir, "config.yaml");
        await fs.writeFile(configPath, "", "utf8");

        const mockPrompts = {
          checkbox: () => Promise.resolve(["getStarted"]),
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve(join(tempDir, "docs")),
          search: () => Promise.resolve(""),
        };

        const options = { prompts: mockPrompts };

        const result = await init(
          { outputPath: tempDir, fileName: "config.yaml", skipIfExists: true },
          options,
        );

        expect(result).toEqual({});

        // Config should be generated since original was empty
        const configContent = await fs.readFile(configPath, "utf8");
        expect(configContent).toContain("projectName:");
        expect(configContent).toContain("locale: en");
      } finally {
        await cleanupTempDir(tempDir);
      }
    });
  });

  describe("Validation error handling", () => {
    test("should handle empty document purpose validation", async () => {
      const tempDir = await createTempDir();

      try {
        // Mock prompts that will trigger validation errors by calling validate function
        let validateCalled = false;
        const mockPrompts = {
          checkbox: (options) => {
            if (options.message.includes("[1/8]") && options.validate) {
              // Test the validation function directly
              const validationResult = options.validate([]);
              expect(validationResult).toBe("Please select at least one purpose.");
              validateCalled = true;
              // Return valid result after testing validation
              return Promise.resolve(["getStarted"]);
            }
            return Promise.resolve(["getStarted"]);
          },
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve(join(tempDir, "docs")),
          search: () => Promise.resolve(""),
        };

        const options = { prompts: mockPrompts };

        const result = await init(
          { outputPath: tempDir, fileName: "config.yaml", skipIfExists: false },
          options,
        );

        expect(result).toEqual({});
        expect(validateCalled).toBe(true);
      } finally {
        await cleanupTempDir(tempDir);
      }
    });

    test("should handle empty target audience validation", async () => {
      const tempDir = await createTempDir();

      try {
        let audienceValidateCalled = false;
        const mockPrompts = {
          checkbox: (options) => {
            if (options.message.includes("[1/8]")) {
              return Promise.resolve(["getStarted"]); // Valid document purpose
            }
            if (options.message.includes("[2/8]") && options.validate) {
              // Test the validation function for target audience
              const validationResult = options.validate([]);
              expect(validationResult).toBe("Please select at least one audience.");
              audienceValidateCalled = true;
              return Promise.resolve(["developers"]); // Valid result after testing
            }
            return Promise.resolve(["developers"]);
          },
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve(join(tempDir, "docs")),
          search: () => Promise.resolve(""),
        };

        const options = { prompts: mockPrompts };

        const result = await init(
          { outputPath: tempDir, fileName: "config.yaml", skipIfExists: false },
          options,
        );

        expect(result).toEqual({});
        expect(audienceValidateCalled).toBe(true);
      } finally {
        await cleanupTempDir(tempDir);
      }
    });

    test("should handle mixed purpose priority validation errors", async () => {
      const tempDir = await createTempDir();

      try {
        let priorityValidateCalled = false;
        const mockPrompts = {
          checkbox: (options) => {
            if (options.message.includes("[1/8]")) {
              return Promise.resolve(["mixedPurpose"]); // Trigger follow-up question
            }
            // This is the follow-up priority selection
            if (options.message.includes("Which is most important?") && options.validate) {
              // Test validation for empty selection
              let validationResult = options.validate([]);
              expect(validationResult).toBe("Please select at least one priority.");

              // Test validation for too many selections
              validationResult = options.validate(["getStarted", "completeTasks", "findAnswers"]);
              expect(validationResult).toBe("Please select maximum 2 priorities.");

              // Test validation for valid selection
              validationResult = options.validate(["getStarted", "completeTasks"]);
              expect(validationResult).toBe(true);

              priorityValidateCalled = true;
              return Promise.resolve(["getStarted", "completeTasks"]); // Valid selection
            }
            return Promise.resolve(["getStarted", "completeTasks"]);
          },
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve(join(tempDir, "docs")),
          search: () => Promise.resolve(""),
        };

        const options = { prompts: mockPrompts };

        const result = await init(
          { outputPath: tempDir, fileName: "config.yaml", skipIfExists: false },
          options,
        );

        expect(result).toEqual({});
        expect(priorityValidateCalled).toBe(true);
      } finally {
        await cleanupTempDir(tempDir);
      }
    });

    test("should handle file write errors", async () => {
      const invalidPath = "/invalid/path/that/does/not/exist";

      const mockPrompts = {
        checkbox: () => Promise.resolve(["getStarted"]),
        select: () => Promise.resolve("en"),
        input: () => Promise.resolve("docs"),
        search: () => Promise.resolve(""),
      };

      const options = { prompts: mockPrompts };

      const result = await init(
        { outputPath: invalidPath, fileName: "config.yaml", skipIfExists: false },
        options,
      );

      expect(result).toHaveProperty("inputGeneratorStatus", false);
      expect(result).toHaveProperty("inputGeneratorError");
      expect(typeof result.inputGeneratorError).toBe("string");
    });
  });

  describe("Advanced source path scenarios", () => {
    test("should handle source path validation and duplicate detection", async () => {
      const tempDir = await createTempDir();

      try {
        let searchCallCount = 0;
        const responses = [
          "invalid/path/that/does/not/exist", // Should trigger validation error
          "invalid/path/that/does/not/exist", // Duplicate path
          join(tempDir, "valid-path"), // Valid path after creating it
          join(tempDir, "valid-path"), // Duplicate of valid path
          "**/*.glob", // Glob pattern (should be accepted)
          "**/*.glob", // Duplicate glob pattern
          "", // End input
        ];

        // Create a valid directory for testing
        await fs.mkdir(join(tempDir, "valid-path"), { recursive: true });

        const mockPrompts = {
          checkbox: () => Promise.resolve(["getStarted"]),
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve(join(tempDir, "docs")),
          search: () => {
            const response = responses[searchCallCount];
            searchCallCount++;
            return Promise.resolve(response);
          },
        };

        const options = { prompts: mockPrompts };

        const result = await init(
          { outputPath: tempDir, fileName: "config.yaml", skipIfExists: false },
          options,
        );

        expect(result).toEqual({});

        const configPath = join(tempDir, "config.yaml");
        const configContent = await fs.readFile(configPath, "utf8");
        const config = parseYAML(configContent);

        // Should contain the valid paths that were successfully added
        expect(config.sourcesPath.length).toBeGreaterThan(0);
      } finally {
        await cleanupTempDir(tempDir);
      }
    });

    test("should handle search source function callback", async () => {
      const tempDir = await createTempDir();

      try {
        const mockPrompts = {
          checkbox: () => Promise.resolve(["getStarted"]),
          select: () => Promise.resolve("en"),
          input: () => Promise.resolve(join(tempDir, "docs")),
          search: (options) => {
            // Test the source callback function
            if (options?.source) {
              // Call the source function with different inputs to test the logic
              const sourceResults1 = options.source("");
              const sourceResults2 = options.source("src");
              const sourceResults3 = options.source("**/*.js");

              // Verify these are promises
              expect(sourceResults1).toBeInstanceOf(Promise);
              expect(sourceResults2).toBeInstanceOf(Promise);
              expect(sourceResults3).toBeInstanceOf(Promise);
            }
            return Promise.resolve(""); // End input
          },
        };

        const options = { prompts: mockPrompts };

        const result = await init(
          { outputPath: tempDir, fileName: "config.yaml", skipIfExists: false },
          options,
        );

        expect(result).toEqual({});
      } finally {
        await cleanupTempDir(tempDir);
      }
    });
  });
});
