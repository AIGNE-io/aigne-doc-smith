export default async function exit() {
  process.exit(0);
}

exit.description =
  "Exit the chat session. Equivalent to saying goodbye, quit, exit, close, or see you. Must print a bye message before calling this tool, as it will exit the process immediately.";
