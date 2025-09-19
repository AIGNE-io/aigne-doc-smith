const apiUrl = "https://linter.abtnet.io";

export async function lintCode({ code, linter = "biome-lint", suffix = ".js" }) {
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
      // log_level: "INFO",
      // timeout: 15000,
    },
  };
  const response = await fetch(`${apiUrl}/${linter}/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testData),
  });
  const data = await response.json();
  return data;
}
