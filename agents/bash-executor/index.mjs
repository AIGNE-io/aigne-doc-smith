#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { PATHS } from "../../utils/agent-constants.mjs";

/**
 * 虚拟 Bash 执行器 - Git 专用
 * 支持的命令类型:
 * - Git 操作: init, clone, config, status, log, diff, branch, show, add, commit, fetch, pull, submodule
 *
 * 安全限制:
 * - 仅支持 git 命令,不支持其他 shell 命令
 * - 所有命令必须来自预定义的安全枚举
 * - 命令在 WORKSPACE_BASE 目录执行(自动适配 project 和 standalone 模式)
 */

// 支持的命令枚举
const ALLOWED_COMMANDS = {
  // Git 命令
  git: {
    // 初始化和克隆
    init: true,
    clone: true,

    // 配置命令
    config: true,

    // 查询命令
    status: true,
    log: true,
    diff: true,
    branch: true,
    show: true,

    // 提交命令
    add: true,
    commit: true,

    // 远程命令
    fetch: true,
    pull: true,

    // 子模块命令
    submodule: true,
  },
};

// 需要重试的命令配置
const RETRY_COMMANDS = {
  git: {
    submodule: {
      update: {
        maxRetries: 3, // 最大重试次数
        retryDelay: 2000, // 重试间隔(毫秒)
      },
    },
  },
};

/**
 * 验证命令是否在允许列表中
 */
function validateCommand(command, args = []) {
  const cmd = command.toLowerCase();

  // 只支持 git 命令
  if (cmd !== "git") {
    throw new Error(`不支持的命令: ${cmd},仅支持 git 命令`);
  }

  if (args.length === 0) {
    throw new Error("Git 命令需要指定子命令");
  }

  const subCommand = args[0].toLowerCase();
  if (!ALLOWED_COMMANDS.git[subCommand]) {
    throw new Error(`不支持的 git 子命令: ${subCommand}`);
  }

  return true;
}

/**
 * 检查命令是否需要重试
 * @param {string} command - 命令名称(如 "git")
 * @param {Array} args - 参数列表
 * @returns {Object|null} - 重试配置或 null
 */
function getRetryConfig(command, args) {
  if (command !== "git" || args.length < 2) {
    return null;
  }

  const subCommand = args[0].toLowerCase();
  const subSubCommand = args[1]?.toLowerCase();

  // 检查是否在重试配置中
  const retryConfig = RETRY_COMMANDS.git?.[subCommand]?.[subSubCommand];
  return retryConfig || null;
}

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 */
function sleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // 忙等待
  }
}

/**
 * 执行单个命令(带重试机制)
 */
function executeCommand(command, args = []) {
  try {
    // 验证命令
    validateCommand(command, args);

    // 构建完整命令用于显示和日志
    const fullCommand = [command, ...args].join(" ");

    // 检查是否需要重试
    const retryConfig = getRetryConfig(command, args);
    const maxRetries = retryConfig ? retryConfig.maxRetries : 0;
    const retryDelay = retryConfig ? retryConfig.retryDelay : 0;

    let lastResult = null;

    // 执行命令,失败时重试
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // 如果是重试(不是第一次),先等待
      if (attempt > 0) {
        sleep(retryDelay);
      }

      // 使用 spawnSync 可以同时捕获 stdout 和 stderr
      // 在 WORKSPACE_BASE 目录执行，支持 project 和 standalone 两种模式
      const result = spawnSync(command, args, {
        cwd: PATHS.WORKSPACE_BASE,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 600000, // 600秒超时(10分钟),克隆大型仓库可能需要更长时间
      });

      // 检查是否执行成功
      // 注意:Git 命令(如 submodule)会将进度信息输出到 stderr
      // 因此不能根据 stderr 是否有内容判断失败,只能根据退出码
      if (result.status === 0 && !result.error) {
        return {
          success: true,
          command: fullCommand,
          output: result.stdout?.trim() || "",
          error: result.stderr?.trim() || "", // stderr 可能包含进度信息或警告
        };
      }

      // 记录失败结果,继续重试
      lastResult = result;
    }

    // 所有重试都失败了,返回最后一次的错误
    return {
      success: false,
      command: fullCommand,
      output: lastResult.stdout?.trim() || "",
      error: lastResult.stderr?.trim() || lastResult.error?.message || "命令执行失败",
    };
  } catch (error) {
    // 验证失败或其他异常
    const fullCommand = [command, ...args].join(" ");
    console.log(`[bash-executor] 异常: ${error.message}`);
    return {
      success: false,
      command: fullCommand,
      output: "",
      error: error.message,
    };
  }
}

/**
 * 按顺序执行多个命令
 * 如果某个命令失败,立即停止执行后续命令
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
        error: "命令不能为空",
      };
      results.push(errorResult);
      // 命令为空视为失败,停止执行
      break;
    }

    const result = executeCommand(command, args);
    results.push(result);

    // 如果命令失败,立即停止执行后续命令
    if (!result.success) {
      break;
    }
  }

  return results;
}

/**
 * 安全执行预定义的 Shell 命令
 * @param {Object} params - 输入参数
 * @param {Array} params.commands - 命令列表
 * @returns {Object} - 执行结果
 */
export default function executeSafeShellCommands({ commands }) {
  // 验证输入
  if (!Array.isArray(commands)) {
    return {
      success: false,
      error: "参数 commands 必须是一个数组",
      results: [],
    };
  }

  if (commands.length === 0) {
    return {
      success: false,
      error: "命令列表不能为空",
      results: [],
    };
  }

  // 执行命令批次
  const results = executeBatch(commands);

  // 统计执行结果
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

// 添加描述信息,帮助 LLM 理解何时调用此 agent
executeSafeShellCommands.description =
  "安全执行 Git 命令,支持的子命令包括: init/clone/config/status/log/diff/branch/show/add/commit/fetch/pull/submodule。" +
  "适用于需要批量执行多个有顺序依赖的 git 操作,如果某个命令失败会立即停止执行后续命令。";

// 定义输入 schema
executeSafeShellCommands.input_schema = {
  type: "object",
  required: ["commands"],
  properties: {
    commands: {
      type: "array",
      description: "要执行的 Git 命令列表,按顺序执行",
      items: {
        type: "object",
        required: ["command"],
        properties: {
          command: {
            type: "string",
            description: "命令名称,必须是 git",
            enum: ["git"],
          },
          args: {
            type: "array",
            description:
              "Git 子命令和参数列表,第一个参数必须是支持的子命令(init/clone/config/status/log/diff/branch/show/add/commit/fetch/pull/submodule)。命令将在 workspace 目录执行",
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

// 定义输出 schema
executeSafeShellCommands.output_schema = {
  type: "object",
  required: ["success", "results"],
  properties: {
    success: {
      type: "boolean",
      description: "是否至少有一个命令执行成功",
    },
    total: {
      type: "integer",
      description: "总命令数(执行命令时存在)",
    },
    succeeded: {
      type: "integer",
      description: "成功执行的命令数(执行命令时存在)",
    },
    failed: {
      type: "integer",
      description: "失败的命令数(执行命令时存在)",
    },
    error: {
      type: "string",
      description: "全局错误信息(验证失败时存在)",
    },
    results: {
      type: "array",
      description: "每个命令的执行结果",
      items: {
        type: "object",
        required: ["success", "command", "output", "error"],
        properties: {
          success: {
            type: "boolean",
            description: "该命令是否执行成功",
          },
          command: {
            type: "string",
            description: "执行的完整命令",
          },
          output: {
            type: "string",
            description: "命令的标准输出",
          },
          error: {
            type: "string",
            description: "错误信息,成功时为空字符串,失败时包含错误详情",
          },
        },
      },
    },
  },
};
