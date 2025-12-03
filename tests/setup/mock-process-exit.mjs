// Prevent production code from terminating the test runner.
// Records the requested exit code on process.exit.calledWith without exiting.
const originalExit = process.exit;

function mockExit(code = 0) {
  mockExit.calledWith = code;
  return code;
}

mockExit.calledWith = undefined;

process.exit = mockExit;

process.on("exit", () => {
  process.exit = originalExit;
});
