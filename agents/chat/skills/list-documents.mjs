import { getMainLanguageFiles } from "../../../utils/docs-finder-utils.mjs";
import init from "../../init/index.mjs";

export default async function listDocuments(_, options) {
  const config = await init({ checkOnly: true }, options);

  // Get all main language .md files in docsDir
  const mainLanguageFiles = await getMainLanguageFiles(config.docsDir, config.locale);

  return {
    documents: mainLanguageFiles,
  };
}

listDocuments.description = "List all available documentation files";
