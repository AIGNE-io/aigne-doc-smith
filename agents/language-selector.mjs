import { SUPPORTED_LANGUAGES } from "../utils/constants.mjs";
import { loadConfigFromFile, saveValueToConfig } from "../utils/utils.mjs";

/**
 * Interactive language selector for translation from configured languages
 * @param {Object} params
 * @param {Array<string>} [params.langs] - Pre-selected languages
 * @param {string} params.locale - Primary language code
 * @param {Object} options - Options object with prompts
 * @returns {Promise<Object>} Selected languages
 */
export default async function languageSelector({ langs, locale, selectedDocs }, options) {
  let selectedLanguages = [];

  // Load existing config to get current translation languages
  const existingConfig = await loadConfigFromFile();
  const currentTranslateLanguages = existingConfig?.translateLanguages || [];

  // Get primary language from config or parameter
  const primaryLanguage = locale || existingConfig?.locale || "en";

  // Filter out the primary language from available choices (like input-generator.mjs)
  const availableTranslationLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.code !== primaryLanguage,
  );

  // If languages are provided as parameter, validate against available languages
  if (langs && Array.isArray(langs) && langs.length > 0) {
    const validLanguages = langs.filter((lang) =>
      availableTranslationLanguages.some((availableLang) => availableLang.code === lang),
    );

    if (validLanguages.length > 0) {
      selectedLanguages = validLanguages;
    } else {
      console.log(`⚠️  Invalid languages provided: ${langs.join(", ")}`);
      console.log(
        "Available translation languages:",
        availableTranslationLanguages.map((l) => l.code).join(", "),
      );
    }
  }

  // If no valid languages were provided, let user select from available languages
  if (selectedLanguages.length === 0) {
    // Create choices from available translation languages with labels
    const choices = availableTranslationLanguages.map((lang) => ({
      name: `${lang.label} - ${lang.sample}`,
      value: lang.code,
      checked: currentTranslateLanguages.includes(lang.code), // Default to previously selected languages
    }));

    selectedLanguages = await options.prompts.checkbox({
      message: "Select translation languages:",
      choices: choices,
      validate: (answer) => {
        if (answer.length === 0) {
          return "Please select at least one language";
        }
        return true;
      },
    });
  }

  if (selectedLanguages.length === 0) {
    throw new Error("No languages selected for translation");
  }

  // Find new languages that need to be added
  const newLanguages = selectedLanguages.filter(
    (lang) => !currentTranslateLanguages.includes(lang),
  );

  if (newLanguages.length > 0) {
    // Add new languages to existing ones
    const updatedTranslateLanguages = [...currentTranslateLanguages, ...newLanguages];
    await saveValueToConfig("translateLanguages", updatedTranslateLanguages);
  }

  const newSelectedDocs = selectedDocs.map((doc) => {
    return {
      ...doc,
      translates: selectedLanguages.map((lang) => ({ language: lang })),
    };
  });

  return {
    selectedLanguages,
    selectedDocs: newSelectedDocs,
  };
}

languageSelector.input_schema = {
  type: "object",
  properties: {
    langs: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Pre-selected languages for translation",
    },

    locale: {
      type: "string",
      description: "Primary language code (will be excluded from translation options)",
    },
  },
  required: [],
};
