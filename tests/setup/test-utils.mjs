/**
 * Shared test utilities for doc-smith tests
 */

import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Create a temporary directory for test isolation
 * @returns {Promise<{path: string, cleanup: () => Promise<void>}>}
 */
export async function createTempDir() {
  const path = await mkdtemp(join(tmpdir(), "doc-smith-test-"));
  return {
    path,
    cleanup: async () => {
      await rm(path, { recursive: true, force: true });
    },
  };
}

/**
 * Create a mock workspace structure for testing
 * @param {string} basePath - Base directory path
 * @param {object} options - Workspace options
 * @returns {Promise<void>}
 */
export async function createMockWorkspace(basePath, options = {}) {
  const { withConfig = false, withDocs = false, withStructure = false } = options;

  // Create basic directory structure
  await mkdir(join(basePath, ".doc-smith"), { recursive: true });
  await mkdir(join(basePath, "docs"), { recursive: true });
  await mkdir(join(basePath, "planning"), { recursive: true });

  if (withConfig) {
    await writeFile(
      join(basePath, ".doc-smith", "config.yaml"),
      `# Doc-Smith Configuration
locale: zh
translateLanguages:
  - en
`,
    );
  }

  if (withStructure) {
    await writeFile(
      join(basePath, "planning", "document-structure.yaml"),
      `# Document Structure
documents:
  - path: /overview
    title: Overview
`,
    );
  }

  if (withDocs) {
    await mkdir(join(basePath, "docs", "overview"), { recursive: true });
    await writeFile(
      join(basePath, "docs", "overview", ".meta.yaml"),
      `kind: doc
source: zh
default: zh
languages:
  - zh
`,
    );
    await writeFile(
      join(basePath, "docs", "overview", "zh.md"),
      `# Overview

This is the overview document.
`,
    );
  }
}

/**
 * Create mock context object for Function Agent tests
 * @param {object} overrides - Properties to override
 * @returns {object}
 */
export function createMockContext(overrides = {}) {
  return {
    agents: {},
    invoke: async () => ({ success: true }),
    userContext: {},
    ...overrides,
  };
}

/**
 * Create mock prompts object for Function Agent tests
 * @param {object} responses - Predefined responses for prompts
 * @returns {object}
 */
export function createMockPrompts(responses = {}) {
  return {
    select: async (config) => responses.select ?? config.default ?? config.choices?.[0]?.value,
    checkbox: async (_config) => responses.checkbox ?? [],
    input: async (config) => responses.input ?? config.default ?? "",
    search: async (_config) => responses.search ?? null,
  };
}

/**
 * Create mock options object for Function Agent tests
 * @param {object} overrides - Properties to override
 * @returns {object}
 */
export function createMockOptions(overrides = {}) {
  const { prompts = {}, context = {}, ...rest } = overrides;
  return {
    prompts: createMockPrompts(prompts),
    context: createMockContext(context),
    ...rest,
  };
}
