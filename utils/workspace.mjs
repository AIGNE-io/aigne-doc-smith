import { access, readFile, mkdir, writeFile, appendFile, rename } from "node:fs/promises";
import { constants, existsSync } from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";

const execAsync = promisify(exec);

/**
 * Workspace mode constants
 */
export const WORKSPACE_MODES = {
  PROJECT: "project",
  STANDALONE: "standalone",
};

/**
 * Directory structure constants
 */
export const AIGNE_DIR = ".aigne";
export const DOC_SMITH_DIR = ".aigne/doc-smith";
export const DOC_SMITH_BAK_DIR = ".aigne/doc-smith-bak";
export const SOURCES_DIR = "sources";
export const WORKSPACE_SUBDIRS = ["intent", "planning", "docs"];

/**
 * .gitignore content for doc-smith workspace
 */
export const GITIGNORE_CONTENT = `\
# Ignore sources directory
sources/

# Ignore temporary files
.tmp/
.temp/
temp/
`;

/**
 * Check if path exists
 * @param {string} path - Path
 * @returns {Promise<boolean>}
 */
export async function pathExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if path exists (sync version)
 * @param {string} path - Path
 * @returns {boolean}
 */
export function pathExistsSync(path) {
  return existsSync(path);
}

/**
 * Check if inside a git repository (supports subdirectories)
 * @param {string} cwd - Working directory
 * @returns {Promise<boolean>}
 */
export async function isGitRepo(cwd = ".") {
  const result = await gitExec("rev-parse --is-inside-work-tree", cwd);
  return result.success && result.output === "true";
}

/**
 * Execute git command
 * @param {string} command - git command (without git prefix)
 * @param {string} cwd - Working directory
 * @returns {Promise<{success: boolean, output?: string, error?: string}>}
 */
export async function gitExec(command, cwd = ".") {
  try {
    const { stdout } = await execAsync(`git ${command}`, { cwd });
    return { success: true, output: stdout.trim() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get git repository info (url, branch, commit)
 * @param {string} cwd - Working directory
 * @returns {Promise<{ url: string, branch: string, commit: string }>}
 */
export async function getGitInfo(cwd = ".") {
  // Get remote repository URL (prefer origin)
  let url = "";
  const urlResult = await gitExec("remote get-url origin", cwd);
  if (urlResult.success) {
    url = urlResult.output;
  } else {
    // Try to get the first available remote
    const remotesResult = await gitExec("remote", cwd);
    if (remotesResult.success && remotesResult.output) {
      const firstRemote = remotesResult.output.split("\n")[0];
      // Validate remote name to prevent command injection
      const safeRemotePattern = /^[a-zA-Z0-9_.-]+$/;
      if (safeRemotePattern.test(firstRemote)) {
        const fallbackResult = await gitExec(`remote get-url ${firstRemote}`, cwd);
        if (fallbackResult.success) {
          url = fallbackResult.output;
        }
      }
    }
  }

  // Get current branch name
  let branch = "";
  const branchResult = await gitExec("branch --show-current", cwd);
  if (branchResult.success) {
    branch = branchResult.output;
  }

  // Get current commit hash (short format)
  let commit = "";
  const commitResult = await gitExec("rev-parse --short HEAD", cwd);
  if (commitResult.success) {
    commit = commitResult.output;
  }

  return { url, branch, commit };
}

/**
 * Get git repository root directory
 * @param {string} cwd - Starting directory
 * @returns {Promise<string | null>}
 */
export async function getGitRoot(cwd = ".") {
  const result = await gitExec("rev-parse --show-toplevel", cwd);
  if (result.success) {
    return result.output;
  }
  return null;
}

/**
 * Add ignore rule to .gitignore (if not exists)
 * @param {string} gitRoot - Git repository root directory
 * @param {string} pattern - Pattern to ignore
 * @returns {Promise<boolean>} Whether addition was successful
 */
export async function addToGitignore(gitRoot, pattern) {
  const gitignorePath = join(gitRoot, ".gitignore");

  try {
    // Check if .gitignore exists
    if (await pathExists(gitignorePath)) {
      // Read existing content, check if pattern already exists
      const content = await readFile(gitignorePath, "utf8");
      if (content.includes(pattern)) {
        return true; // Already exists, no need to add
      }
      // Append to end of file (ensure newline)
      const prefix = content.endsWith("\n") ? "" : "\n";
      await appendFile(gitignorePath, `${prefix}${pattern}\n`, "utf8");
    } else {
      // Create new .gitignore
      await writeFile(gitignorePath, `${pattern}\n`, "utf8");
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect workspace mode (async version)
 *
 * Returns null if workspace is not initialized (no config.yaml found).
 * Callers should handle the null case by inferring mode or triggering initialization.
 *
 * Note: Unlike detectWorkspaceModeSync(), this version does NOT provide a default
 * when not initialized, allowing callers to decide how to handle the uninitialized state.
 *
 * @returns {Promise<{ mode: string, configPath: string, workspacePath: string } | null>}
 *   - workspacePath: Path with "./" prefix (e.g., "./.aigne/doc-smith" or ".")
 */
export async function detectWorkspaceMode() {
  const configInDocSmith = join(DOC_SMITH_DIR, "config.yaml");
  const configInRoot = "config.yaml";

  if (await pathExists(configInDocSmith)) {
    return {
      mode: WORKSPACE_MODES.PROJECT,
      configPath: configInDocSmith,
      workspacePath: `./${DOC_SMITH_DIR}`,
    };
  }

  if (await pathExists(configInRoot)) {
    return {
      mode: WORKSPACE_MODES.STANDALONE,
      configPath: configInRoot,
      workspacePath: ".",
    };
  }

  return null;
}

/**
 * Detect workspace mode (sync version)
 *
 * Used by modules that need workspace info at load time (e.g., agent-constants.mjs).
 * Unlike the async version, this ALWAYS returns a valid object (defaults to STANDALONE
 * when not initialized) because sync callers need concrete values immediately.
 *
 * Note: This version includes an additional `workspaceBase` field for backward compatibility
 * with agent-constants.mjs which needs the path without "./" prefix.
 *
 * @returns {{ mode: string, configPath: string | null, workspacePath: string, workspaceBase: string }}
 *   - workspacePath: Path with "./" prefix (e.g., "./.aigne/doc-smith" or ".")
 *   - workspaceBase: Path without "./" prefix (e.g., ".aigne/doc-smith" or ".")
 */
export function detectWorkspaceModeSync() {
  const configInDocSmith = join(DOC_SMITH_DIR, "config.yaml");
  const configInRoot = "config.yaml";

  if (pathExistsSync(configInDocSmith)) {
    return {
      mode: WORKSPACE_MODES.PROJECT,
      configPath: configInDocSmith,
      workspacePath: `./${DOC_SMITH_DIR}`,
      workspaceBase: DOC_SMITH_DIR,
    };
  }

  if (pathExistsSync(configInRoot)) {
    return {
      mode: WORKSPACE_MODES.STANDALONE,
      configPath: configInRoot,
      workspacePath: ".",
      workspaceBase: ".",
    };
  }

  // Default to standalone if not initialized
  return {
    mode: WORKSPACE_MODES.STANDALONE,
    configPath: null,
    workspacePath: ".",
    workspaceBase: ".",
  };
}

/**
 * Load and parse config.yaml
 * @param {string} configPath - Config file path
 * @returns {Promise<Object | null>}
 */
export async function loadConfig(configPath) {
  try {
    const content = await readFile(configPath, "utf8");
    return yamlParse(content);
  } catch {
    return null;
  }
}

/**
 * Check if config is new version format
 * New version: config has `mode` field with valid value (project/standalone)
 * @param {Object | null} config - Parsed config object
 * @returns {boolean}
 */
export function isNewVersionConfig(config) {
  if (!config || typeof config !== "object") {
    return false;
  }
  const validModes = Object.values(WORKSPACE_MODES);
  return validModes.includes(config.mode);
}

/**
 * Backup old version workspace directory
 * Rename .aigne/doc-smith to .aigne/doc-smith-bak
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function backupOldWorkspace() {
  // Check if backup directory already exists
  if (await pathExists(DOC_SMITH_BAK_DIR)) {
    return {
      success: false,
      error: `Backup directory ${DOC_SMITH_BAK_DIR} already exists, please handle it manually and retry`,
    };
  }

  try {
    await rename(DOC_SMITH_DIR, DOC_SMITH_BAK_DIR);
    console.log(`\n⚠️  Old workspace detected, backed up to ${DOC_SMITH_BAK_DIR}\n`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Failed to rename directory: ${error.message}`,
    };
  }
}

/**
 * Generate config.yaml content
 * @param {{ mode: string, sources: Array }} options - Configuration options
 * @returns {string}
 */
export function generateConfig(options) {
  const { mode, sources } = options;
  return yamlStringify({ mode, sources });
}

/**
 * Create directory structure
 * @param {string} baseDir - Base directory
 * @param {boolean} includeSources - Whether to create sources directory
 */
export async function createDirectoryStructure(baseDir, includeSources = false) {
  await mkdir(baseDir, { recursive: true });

  for (const dir of WORKSPACE_SUBDIRS) {
    await mkdir(join(baseDir, dir), { recursive: true });
  }

  if (includeSources) {
    await mkdir(join(baseDir, SOURCES_DIR), { recursive: true });
  }
}

/**
 * Initialize project mode workspace
 * Create .aigne/doc-smith/ directory structure under project root
 * @returns {Promise<{ mode: string, configPath: string, workspacePath: string }>}
 */
export async function initProjectMode() {
  console.log("\n📂 Initializing doc-smith workspace...\n");

  // Create .aigne/doc-smith directory
  await mkdir(DOC_SMITH_DIR, { recursive: true });

  // Initialize git in .aigne/doc-smith
  await gitExec("init", DOC_SMITH_DIR);

  // Create directory structure
  await createDirectoryStructure(DOC_SMITH_DIR);

  // Create .gitignore
  await writeFile(join(DOC_SMITH_DIR, ".gitignore"), GITIGNORE_CONTENT, "utf8");

  // Get project git info
  const gitInfo = await getGitInfo(".");

  // Generate config.yaml (include git info, consistent with git-clone format)
  const sourceConfig = {
    type: "local-path",
    path: "../../",
  };

  // Add git info at root level (consistent with git-clone format)
  if (gitInfo.url) sourceConfig.url = gitInfo.url;
  if (gitInfo.branch) sourceConfig.branch = gitInfo.branch;
  if (gitInfo.commit) sourceConfig.commit = gitInfo.commit;

  const configContent = generateConfig({
    mode: WORKSPACE_MODES.PROJECT,
    sources: [sourceConfig],
  });
  await writeFile(join(DOC_SMITH_DIR, "config.yaml"), configContent, "utf8");

  // Create initial commit in doc-smith repo
  await gitExec("add .", DOC_SMITH_DIR);
  const commitResult = await gitExec(
    'commit -m "Initial commit: doc-smith workspace"',
    DOC_SMITH_DIR,
  );
  if (commitResult.success) {
    console.log(`✅ Created initial commit in ${DOC_SMITH_DIR}`);
  }

  console.log("✅ Workspace initialized successfully!\n");

  return {
    mode: WORKSPACE_MODES.PROJECT,
    configPath: join(DOC_SMITH_DIR, "config.yaml"),
    workspacePath: `./${DOC_SMITH_DIR}`,
  };
}

/**
 * Initialize standalone mode workspace
 * Create workspace structure in current directory
 * @returns {Promise<{ mode: string, configPath: string, workspacePath: string }>}
 */
export async function initStandaloneMode() {
  console.log("\n📂 Initializing doc-smith workspace...\n");

  // Initialize git in current directory
  await gitExec("init");

  // Create .gitignore
  await writeFile(".gitignore", GITIGNORE_CONTENT, "utf8");

  // Create directory structure (including sources/)
  await createDirectoryStructure(".", true);

  // Generate config.yaml (sources empty, to be added during conversation)
  const configContent = generateConfig({
    mode: WORKSPACE_MODES.STANDALONE,
    sources: [],
  });
  await writeFile("config.yaml", configContent, "utf8");

  console.log("✅ Workspace initialized successfully!\n");

  return {
    mode: WORKSPACE_MODES.STANDALONE,
    configPath: "config.yaml",
    workspacePath: ".",
  };
}

/**
 * Detect directory state and initialize workspace when needed
 * Handles old version backup migration if necessary
 * @returns {Promise<{ mode: string, configPath: string, workspacePath: string }>}
 */
export async function detectAndInitialize() {
  // Check if already initialized with new version config
  const existing = await detectWorkspaceMode();
  if (existing) {
    // Verify it's new version config
    const config = await loadConfig(existing.configPath);
    if (isNewVersionConfig(config)) {
      return existing;
    }
  }

  // Check if .aigne/doc-smith directory exists (might be old version)
  if (await pathExists(DOC_SMITH_DIR)) {
    const configPath = join(DOC_SMITH_DIR, "config.yaml");
    const config = await loadConfig(configPath);

    // If config exists but is not new version, backup and reinitialize
    if (!isNewVersionConfig(config)) {
      const backupResult = await backupOldWorkspace();
      if (!backupResult.success) {
        throw new Error(backupResult.error);
      }
    }
  }

  // Check if inside git repository (project mode)
  if (await isGitRepo()) {
    return await initProjectMode();
  }

  // Otherwise, initialize as standalone mode
  return await initStandaloneMode();
}
