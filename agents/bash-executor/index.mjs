#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * Virtual Bash Executor - Git Dedicated
 * Supported command types:
 * - Git operations: init, clone, config, status, log, diff, branch, show, add, commit, fetch, pull, submodule
 *
 * Security restrictions:
 * - Only supports git commands, no other shell commands
 * - All commands must come from predefined safe enums
 * - Commands execute in WORKSPACE_BASE directory (auto-adapts to project and standalone modes)
 */

// Supported command enums
const ALLOWED_COMMANDS = {
  // Git commands
  git: {
    // Initialization and cloning
    init: true,
    clone: true,

    // Configuration commands
    config: true,

    // Query commands
    status: true,
    log: true,
    diff: true,
    branch: true,
    show: true,

    // Commit commands
    add: true,
    commit: true,

    // Remote commands
    fetch: true,
    pull: true,

    // Submodule commands
    submodule: true,
  },
};

// Retry configuration for specific commands
const RETRY_COMMANDS = {
  git: {
    submodule: {
      update: {
        maxRetries: 3, // Maximum retry count
        retryDelay: 2000, // Retry interval (milliseconds)
      },
    },
  },
};

/**
 * Validate if command is in the allowed list
 */
function validateCommand(command, args = []) {
  const cmd = command.toLowerCase();

  // Only supports git commands
  if (cmd !== "git") {
    throw new Error(`Unsupported command: ${cmd}, only git commands are supported`);
  }

  if (args.length === 0) {
    throw new Error("Git command requires a subcommand");
  }

  const subCommand = args[0].toLowerCase();
  if (!ALLOWED_COMMANDS.git[subCommand]) {
    throw new Error(`Unsupported git subcommand: ${subCommand}`);
  }

  return true;
}

/**
 * Check if command requires retry
 * @param {string} command - Command name (e.g., "git")
 * @param {Array} args - Argument list
 * @returns {Object|null} - Retry configuration or null
 */
function getRetryConfig(command, args) {
  if (command !== "git" || args.length < 2) {
    return null;
  }

  const subCommand = args[0].toLowerCase();
  const subSubCommand = args[1]?.toLowerCase();

  // Check if in retry configuration
  const retryConfig = RETRY_COMMANDS.git?.[subCommand]?.[subSubCommand];
  return retryConfig || null;
}

/**
 * Delay execution
 * @param {number} ms - Delay in milliseconds
 */
function sleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // Busy wait
  }
}

/**
 * Execute single command (with retry mechanism)
 */
function executeCommand(command, args = []) {
  try {
    // Validate command
    validateCommand(command, args);

    // Build full command for display and logging
    const fullCommand = [command, ...args].join(" ");

    // Check if retry is needed
    const retryConfig = getRetryConfig(command, args);
    const maxRetries = retryConfig ? retryConfig.maxRetries : 0;
    const retryDelay = retryConfig ? retryConfig.retryDelay : 0;

    let lastResult = null;

    // Execute command, retry on failure
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // If retrying (not first attempt), wait first
      if (attempt > 0) {
        sleep(retryDelay);
      }

      // Use spawnSync to capture both stdout and stderr
      // Execute in WORKSPACE_BASE directory, supports both project and standalone modes
      const result = spawnSync(command, args, {
        cwd: PATHS.WORKSPACE_BASE,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 600000, // 600 second timeout (10 minutes), cloning large repos may need more time
      });

      // Check if execution succeeded
      // Note: Git commands (like submodule) output progress info to stderr
      // So we cannot judge failure by stderr content, only by exit code
      if (result.status === 0 && !result.error) {
        return {
          success: true,
          command: fullCommand,
          output: result.stdout?.trim() || "",
          error: result.stderr?.trim() || "", // stderr may contain progress info or warnings
        };
      }

      // Record failed result, continue retrying
      lastResult = result;
    }

    // All retries failed, return last error
    return {
      success: false,
      command: fullCommand,
      output: lastResult.stdout?.trim() || "",
      error: lastResult.stderr?.trim() || lastResult.error?.message || "Command execution failed",
    };
  } catch (error) {
    // Validation failed or other exception
    const fullCommand = [command, ...args].join(" ");
    console.log(`[bash-executor] Exception: ${error.message}`);
    return {
      success: false,
      command: fullCommand,
      output: "",
      error: error.message,
    };
  }
}

/**
 * Execute multiple commands sequentially
 * If any command fails, immediately stop executing subsequent commands
 */
function executeBatch(commands) {
  const results = [];

  for (const item of commands) {
    const { command, args = [] } = item;

    if (!command) {
      const errorResult = {
        success: false,
        command: "",
        output: "",
        error: "Command cannot be empty",
      };
      results.push(errorResult);
      // Empty command is treated as failure, stop execution
      break;
    }

    const result = executeCommand(command, args);
    results.push(result);

    // If command failed, immediately stop executing subsequent commands
    if (!result.success) {
      break;
    }
  }

  return results;
}

/**
 * Safely execute predefined shell commands
 * @param {Object} params - Input parameters
 * @param {Array} params.commands - Command list
 * @returns {Object} - Execution result
 */
export default function executeSafeShellCommands({ commands }) {
  // Validate input
  if (!Array.isArray(commands)) {
    return {
      success: false,
      error: "Parameter commands must be an array",
      results: [],
    };
  }

  if (commands.length === 0) {
    return {
      success: false,
      error: "Command list cannot be empty",
      results: [],
    };
  }

  // Execute command batch
  const results = executeBatch(commands);

  // Count execution results
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  return {
    success: successCount > 0,
    total: results.length,
    succeeded: successCount,
    failed: failureCount,
    results,
  };
}

// Add description to help LLM understand when to call this agent
executeSafeShellCommands.description =
  "Safely execute Git commands, supported subcommands include: init/clone/config/status/log/diff/branch/show/add/commit/fetch/pull/submodule. " +
  "Suitable for batch executing multiple git operations with sequential dependencies; if any command fails, subsequent commands stop immediately.";

// Define input schema
executeSafeShellCommands.input_schema = {
  type: "object",
  required: ["commands"],
  properties: {
    commands: {
      type: "array",
      description: "List of Git commands to execute, executed sequentially",
      items: {
        type: "object",
        required: ["command"],
        properties: {
          command: {
            type: "string",
            description: "Command name, must be git",
            enum: ["git"],
          },
          args: {
            type: "array",
            description:
              "Git subcommand and argument list, first argument must be a supported subcommand (init/clone/config/status/log/diff/branch/show/add/commit/fetch/pull/submodule). Commands execute in workspace directory",
            items: {
              type: "string",
            },
            minItems: 1,
          },
        },
      },
      minItems: 1,
    },
  },
};

// Define output schema
executeSafeShellCommands.output_schema = {
  type: "object",
  required: ["success", "results"],
  properties: {
    success: {
      type: "boolean",
      description: "Whether at least one command executed successfully",
    },
    total: {
      type: "integer",
      description: "Total number of commands (present when executing commands)",
    },
    succeeded: {
      type: "integer",
      description: "Number of commands executed successfully (present when executing commands)",
    },
    failed: {
      type: "integer",
      description: "Number of failed commands (present when executing commands)",
    },
    error: {
      type: "string",
      description: "Global error message (present when validation fails)",
    },
    results: {
      type: "array",
      description: "Execution result for each command",
      items: {
        type: "object",
        required: ["success", "command", "output", "error"],
        properties: {
          success: {
            type: "boolean",
            description: "Whether this command executed successfully",
          },
          command: {
            type: "string",
            description: "Full command executed",
          },
          output: {
            type: "string",
            description: "Standard output of the command",
          },
          error: {
            type: "string",
            description:
              "Error message, empty string on success, contains error details on failure",
          },
        },
      },
    },
  },
};
