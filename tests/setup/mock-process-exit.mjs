/**
 * Mock process.exit() to prevent it from terminating the test runner.
 * This is preloaded before all tests via bun test --preload flag.
 */

const originalExit = process.exit;

function mockExit(code) {
  // Record the exit code instead of actually exiting
  mockExit.calledWith = code;
}

mockExit.calledWith = undefined;

// Replace process.exit with the mock
process.exit = mockExit;

// Restore original exit on actual process termination
process.on("exit", () => {
  process.exit = originalExit;
});

export { mockExit, originalExit };
