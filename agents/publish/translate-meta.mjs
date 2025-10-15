import { join } from "node:path";

import { AIAgent } from "@aigne/core";
import fs from "fs-extra";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import z from "zod";

import { DOC_SMITH_DIR } from "../../utils/constants/index.mjs";
import { loadConfigFromFile } from "../../utils/utils.mjs";

export default async function translateMeta({ projectName, projectDesc, locale }, options) {
  const config = await loadConfigFromFile();
  const languages = [
    ...(config?.locale ? [config.locale] : []),
    ...(config?.translateLanguages || []),
  ].filter((lang, index, arr) => arr.indexOf(lang) === index);

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
      desc: descTranslationSchema.describe("Translated descriptions with language codes as keys"),
    }),
  });
  if (titleLanguages.length > 0 || descLanguages.length > 0) {
    const translatedMetadata = await options.context.invoke(agent, {
      message: `Translate the following title and description into all target languages except the source language. Provide the translations in a JSON object with the language codes as keys. If the project title or description is empty, return an empty string for that field.

Project Title: ${projectName || ""}
Project Description: ${projectDesc || ""}

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
    "fr": "Translated Project Description in French",
    "es": "Translated Project Description in Spanish",
    ...
  }
}

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
  const saveResult = {
    ...parsedTranslationCache,
    [projectName]: titleTranslation,
    [projectDesc]: descTranslation,
  };
  await fs.writeFile(translationCacheFilePath, yamlStringify(saveResult), { encoding: "utf8" });

  return {
    translatedMetadata: {
      title: saveResult[projectName] || {},
      desc: saveResult[projectDesc] || {},
    },
  };
}
