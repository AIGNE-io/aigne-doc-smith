import chalk from "chalk";
import { getMainLanguageFiles } from "../../utils/docs-finder-utils.mjs";

export default async function checkNeedGenerate({ docsDir, locale, documentStructure }) {
  const mainLanguageFiles = await getMainLanguageFiles(docsDir, locale, documentStructure);

  if (mainLanguageFiles.length === 0) {
    console.log(
      `No documents found in the docs directory. You can generate them with ${chalk.yellow("`aigne doc create`")}`,
    );
    process.exit(0);
  }
  return {
    message: 'Documents found in the docs directory, skipping "create" step',
  };
}
