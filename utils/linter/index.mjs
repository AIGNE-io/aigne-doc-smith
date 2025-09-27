import { LINTER_API_URL } from "../constants/linter.mjs";

export async function lintCode({ code, linter = "biome-lint", suffix = ".js" }) {
  if (!code) {
    throw new Error("Code parameter is required");
  }
  const timeout = 20000;
  let filename = `code${suffix}`;
  if (suffix === ".dockerfile") {
    filename = "Dockerfile";
  }
  const testData = {
    filename,
    content: code,
    options: {
      validate_all: true,
      fix: false,
      log_level: "INFO",
      timeout,
    },
  };
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${LINTER_API_URL}/${linter}/json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data) {
      throw new Error("Invalid response data");
    }

    return data;
  } catch (error) {
    throw new Error(`Linting failed: ${error.message}`);
  }
}
