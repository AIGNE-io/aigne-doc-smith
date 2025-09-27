import fs from "node:fs/promises";
import path from "node:path";

const fixturesRoot = path.join(process.cwd(), "tests", "utils", "linter", "fixtures");
const { lintCode } = await import(
  `file://${path.join(process.cwd(), "utils", "linter", "index.mjs")}`
);
const { CODE_LANGUAGE_MAP_LINTER } = await import(
  `file://${path.join(process.cwd(), "utils", "constants", "linter.mjs")}`
);

async function scan() {
  const langs = await fs.readdir(fixturesRoot);
  const results = {};
  for (const lang of langs) {
    const dir = path.join(fixturesRoot, lang);
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) continue;
    const files = await fs.readdir(dir);
    if (files.length === 0) continue;
    const linter =
      CODE_LANGUAGE_MAP_LINTER[lang] || CODE_LANGUAGE_MAP_LINTER[lang.replace(".", "")] || null;
    results[lang] = [];
    for (const file of files) {
      const filePath = path.join(dir, file);
      const code = await fs.readFile(filePath, "utf-8");
      const suffix = path.extname(file);
      try {
        const res = await lintCode({ code, linter: linter || undefined, suffix });
        const issues = Array.isArray(res?.issues) ? res.issues : [];
        const errors = issues.filter((i) => i.severity === "error").length;
        const warnings = issues.filter((i) => i.severity === "warning").length;
        results[lang].push({ file, success: res?.success, total: issues.length, errors, warnings });
      } catch (err) {
        results[lang].push({ file, error: String(err) });
      }
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

await scan();
