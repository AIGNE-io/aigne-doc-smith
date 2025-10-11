import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parse, stringify } from "yaml";
import { DOC_SMITH_DIR } from "./constants/index.mjs";
import { isInGitRepository } from "./file-utils.mjs";

const HISTORY_FILE = "history.yaml";

/**
 * Check if git is available in the system
 */
export function isGitAvailable() {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize git repo in DOC_SMITH_DIR if not exists
 */
export function ensureGitRepo() {
  if (!isGitAvailable()) return false;

  const gitDir = join(process.cwd(), DOC_SMITH_DIR, ".git");

  if (!existsSync(gitDir)) {
    try {
      const cwd = join(process.cwd(), DOC_SMITH_DIR);

      execSync("git init", { cwd, stdio: "ignore" });

      // Create .gitignore to exclude temporary files
      const gitignore = "*.tmp\n";
      writeFileSync(join(cwd, ".gitignore"), gitignore);

      // Initial commit
      execSync('git add .gitignore && git commit -m "Initialize doc-smith history"', {
        cwd,
        stdio: "ignore",
      });

      console.log("✔ Git history tracking initialized");
      return true;
    } catch (error) {
      console.warn("Failed to initialize git history:", error.message);
      return false;
    }
  }

  return true;
}

/**
 * Record update using git commit (if available)
 */
function recordUpdateGit({ feedback }) {
  try {
    const cwd = join(process.cwd(), DOC_SMITH_DIR);

    // Stage changed files (only if they exist)
    const filesToAdd = ["docs/", "config.yaml", "preferences.yml", "history.yaml"]
      .filter((file) => existsSync(join(cwd, file)))
      .join(" ");

    if (filesToAdd) {
      execSync(`git add ${filesToAdd}`, {
        cwd,
        stdio: "ignore",
      });
    }

    // Check if there are changes to commit
    try {
      execSync("git diff --cached --quiet", { cwd, stdio: "ignore" });
      console.log("✔ No update history changes to commit");
      return; // No changes
    } catch {
      // Has changes, continue
    }

    // Build commit message (only user feedback)
    const message = feedback;

    // Commit
    execSync(`git commit -m ${JSON.stringify(message)}`, {
      cwd,
      stdio: "ignore",
    });
    console.log("✔ Update history committed successfully");
  } catch (error) {
    console.warn("Update history commit failed:", error.message);
  }
}

/**
 * Record update in YAML file (always)
 */
function recordUpdateYaml({ operation, feedback, documentPath = null }) {
  try {
    const docSmithDir = join(process.cwd(), DOC_SMITH_DIR);
    if (!existsSync(docSmithDir)) {
      mkdirSync(docSmithDir, { recursive: true });
    }
    const historyPath = join(docSmithDir, HISTORY_FILE);

    // Read existing history
    let history = { entries: [] };
    if (existsSync(historyPath)) {
      try {
        const content = readFileSync(historyPath, "utf8");
        history = parse(content) || { entries: [] };
      } catch (error) {
        console.warn("Failed to read history file:", error.message);
      }
    }

    // Create new entry
    const entry = {
      timestamp: new Date().toISOString(),
      operation,
      feedback,
    };

    // Add document path if provided
    if (documentPath) {
      entry.documentPath = documentPath;
    }

    // Add to beginning (newest first)
    history.entries = history.entries || [];
    history.entries.unshift(entry);

    // Write back
    const yamlContent = stringify(history, {
      indent: 2,
      lineWidth: 100,
    });

    writeFileSync(historyPath, yamlContent, "utf8");
  } catch (error) {
    console.warn("YAML history tracking failed:", error.message);
  }
}

/**
 * Record an update after user feedback
 * - Always writes to YAML
 * - Also commits to git if available
 * @param {Object} params
 * @param {string} params.operation - Type of operation (e.g., 'document_update', 'structure_update', 'translation_update')
 * @param {string} params.feedback - User feedback text
 * @param {string} params.documentPath - Document path - should be a string
 */
export function recordUpdate({ operation, feedback, documentPath = null }) {
  // Skip if no feedback
  if (!feedback?.trim()) return;

  // Always record in YAML
  recordUpdateYaml({ operation, feedback, documentPath });

  // Also record in git if git is available and not in a git repository
  if (isGitAvailable() && !isInGitRepository(process.cwd())) {
    ensureGitRepo();
    recordUpdateGit({ feedback });
  } else {
    console.warn("Git is not available, skipping git based update history");
  }
}

/**
 * Get history entries from YAML
 */
export function getHistory() {
  const historyPath = join(process.cwd(), DOC_SMITH_DIR, HISTORY_FILE);

  if (!existsSync(historyPath)) {
    return { entries: [] };
  }

  try {
    const content = readFileSync(historyPath, "utf8");
    return parse(content) || { entries: [] };
  } catch (error) {
    console.warn("Failed to read history:", error.message);
    return { entries: [] };
  }
}
