import { join } from "node:path";

import { AIAgent } from "@aigne/core";
import fs from "fs-extra";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import z from "zod";

import { DOC_SMITH_DIR } from "../../utils/constants/index.mjs";
import { loadDocumentStructure } from "../../utils/docs-finder-utils.mjs";
import { saveValueToConfig } from "../../utils/utils.mjs";

export default async function translateMeta(
  { projectName, projectDesc, locale, translateLanguages = [] },
  options,
) {
  const languages = [...new Set([...(locale ? [locale] : []), ...(translateLanguages || [])])];

  // If projectDesc is empty, first try to load overview.md, then fallback to structure-plan.json
  let finalProjectDesc = projectDesc;
  if (!finalProjectDesc || finalProjectDesc.trim() === "") {
    // First, try to read overview.md
    const overviewFilePath = join(DOC_SMITH_DIR, "docs", "overview.md");
    const overviewExists = await fs.pathExists(overviewFilePath);

    if (overviewExists) {
      try {
        const overviewContent = await fs.readFile(overviewFilePath, "utf-8");
        finalProjectDesc = overviewContent;
      } catch {
        // If reading fails, fallback to structure-plan.json
        finalProjectDesc = "";
      }
    } else {
      try {
        const outputDir = join(DOC_SMITH_DIR, "output");
        const documentStructure = await loadDocumentStructure(outputDir);
        if (documentStructure && Array.isArray(documentStructure)) {
          const overviewItem =
            documentStructure.find(
              (item) => item.title === "Overview" || item.path === "/overview",
            ) || documentStructure[0];
          if (overviewItem?.description) {
            finalProjectDesc = overviewItem.description;
          }
        }
      } catch {
        // If structure-plan.json doesn't exist or parsing fails, keep empty desc
        finalProjectDesc = "";
      }
    }
  }

  const translationCacheFilePath = join(DOC_SMITH_DIR, "translation-cache.yaml");
  await fs.ensureFile(translationCacheFilePath);
  const translationCache = await fs.readFile(translationCacheFilePath, "utf-8");
  const parsedTranslationCache = yamlParse(translationCache || "{}");

  const titleTranslation = parsedTranslationCache[projectName] || {};
  const descTranslation = parsedTranslationCache[projectDesc] || {};

  const titleLanguages = languages.filter((lang) => !titleTranslation[lang]);
  const descLanguages = languages.filter((lang) => !descTranslation[lang]);
  const titleTranslationSchema = z.object(
    titleLanguages.reduce((shape, lang) => {
      shape[lang] = z.string();
      return shape;
    }, {}),
  );
  const descTranslationSchema = z.object(
    descLanguages.reduce((shape, lang) => {
      shape[lang] = z.string();
      return shape;
    }, {}),
  );

  const agent = AIAgent.from({
    name: "translateMeta",
    instructions:
      "You are an **Elite Polyglot Localization and Translation Specialist** with extensive professional experience across multiple domains. Your core mission is to produce translations that are not only **100% accurate** to the source meaning but are also **natively fluent, highly readable, and culturally appropriate** in the target language.",
    inputKey: "message",
    outputSchema: z.object({
      title: titleTranslationSchema.describe("Translated titles with language codes as keys"),
      desc: descTranslationSchema.describe(
        "Translated descriptions with language codes as keys. Each description MUST be within 100 characters.",
      ),
    }),
  });
  if (titleLanguages.length > 0 || descLanguages.length > 0) {
    const translatedMetadata = await options.context.invoke(agent, {
      message: `Translate the following title and description into all target languages except the source language. Provide the translations in a JSON object with the language codes as keys. If the project title or description is empty, return an empty string for that field.

**IMPORTANT**: The description translations MUST be concise and within 100 characters. If the source description is long, extract and translate only the key points or create a brief summary that captures the essence.

Project Title: ${projectName || ""}
Project Description: ${finalProjectDesc || ""}

Target Languages: { title: ${titleLanguages.join(", ")}, desc: ${descLanguages.join(", ")} }
Source Language: ${locale}

Respond with a JSON object in the following format:
{
  "title": {
    "fr": "Translated Project Title in French",
    "es": "Translated Project Title in Spanish",
    ...
  },
  "desc": {
    "fr": "Translated Project Description in French (max 100 characters)",
    "es": "Translated Project Description in Spanish (max 100 characters)",
    ...
  }
}

**Requirements for description translations:**
- Each description MUST be 100 characters or less
- Be concise and capture the core essence of the project
- Use natural, fluent language appropriate for the target culture
- If the source is very long, create a brief summary instead of a full translation

If no translation is needed, respond with:
{
  "title": {},
  "desc": {}
}`,
    });
    Object.keys(translatedMetadata.title || {}).forEach((lang) => {
      if (translatedMetadata.title[lang]) {
        titleTranslation[lang] = translatedMetadata.title[lang];
      }
    });
    Object.keys(translatedMetadata.desc || {}).forEach((lang) => {
      if (translatedMetadata.desc[lang]) {
        descTranslation[lang] = translatedMetadata.desc[lang];
      }
    });
  }

  if (!projectDesc && finalProjectDesc) {
    await saveValueToConfig("projectDesc", finalProjectDesc, "Project description");
  }

  const saveResult = {
    ...parsedTranslationCache,
    [projectName]: titleTranslation,
    [finalProjectDesc]: descTranslation,
  };
  await fs.writeFile(translationCacheFilePath, yamlStringify(saveResult), { encoding: "utf8" });

  return {
    translatedMetadata: {
      title: saveResult[projectName] || {},
      desc: saveResult[finalProjectDesc] || {},
    },
  };
}
