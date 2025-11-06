import {
  getMainLanguageFiles
} from "../../utils/docs-finder-utils.mjs";
import init from "../init/index.mjs";

export default async function listDocs(
  _,
  options,
) {
  const config = await init({checkOnly: true}, options)

  // Get all main language .md files in docsDir
  const mainLanguageFiles = await getMainLanguageFiles(
    config.docsDir,
    config.locale,
  );


  return {
    documents: mainLanguageFiles
  }
}

listDocs.description = "List all available documentation files";
