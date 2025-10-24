import chalk from "chalk";
import { getMainLanguageFiles } from "../../utils/docs-finder-utils.mjs";

export default async function checkNeedGenerate({ docsDir, locale, documentExecutionStructure }) {
  const mainLanguageFiles = await getMainLanguageFiles(docsDir, locale, documentExecutionStructure);

  if (mainLanguageFiles.length === 0) {
    console.log(
      `No documents found in the docs directory. Please run ${chalk.yellow("`aigne doc generate`")} to generate the documents`,
    );
    process.exit(0);
  }
  return {
    message: 'Documents found in the docs directory, skip "generate" step',
  };
}
