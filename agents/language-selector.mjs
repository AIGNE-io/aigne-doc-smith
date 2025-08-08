import { SUPPORTED_LANGUAGES } from "../utils/constants.mjs";

/**
 * Interactive language selector for translation from configured languages
 * @param {Object} params
 * @param {Array<string>} [params.languages] - Pre-selected languages
 * @param {Array<string>} params.translateLanguages - Available languages from config
 * @param {Object} options - Options object with prompts
 * @returns {Promise<Object>} Selected languages
 */
export default async function languageSelector(
  { languages, translateLanguages },
  options
) {
  let selectedLanguages = [];

  // Check if translateLanguages is available from config
  if (
    !translateLanguages ||
    !Array.isArray(translateLanguages) ||
    translateLanguages.length === 0
  ) {
    throw new Error(
      "No translation languages configured in config.yaml. Please add translateLanguages to your configuration."
    );
  }

  // If languages are provided as parameter, validate against configured languages
  if (languages && Array.isArray(languages) && languages.length > 0) {
    const validLanguages = languages.filter((lang) =>
      translateLanguages.includes(lang)
    );

    if (validLanguages.length > 0) {
      selectedLanguages = validLanguages;
    } else {
      console.log(`⚠️  Invalid languages provided: ${languages.join(", ")}`);
      console.log(
        "Available configured languages:",
        translateLanguages.join(", ")
      );
    }
  }

  // If no valid languages were provided, let user select from configured languages
  if (selectedLanguages.length === 0) {
    // Create choices from configured languages with labels
    const choices = translateLanguages.map((langCode) => {
      const supportedLang = SUPPORTED_LANGUAGES.find(
        (l) => l.code === langCode
      );
      return {
        name: supportedLang
          ? `${supportedLang.label} (${supportedLang.sample})`
          : langCode,
        value: langCode,
        short: langCode,
      };
    });

    selectedLanguages = await options.prompts.checkbox({
      message: "Select languages to translate:",
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
    throw new Error("No languages selected for re-translation");
  }

  return {
    selectedLanguages,
  };
}

languageSelector.input_schema = {
  type: "object",
  properties: {
    languages: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Pre-selected languages for translation",
    },
    translateLanguages: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Available translation languages from config",
    },
  },
  required: ["translateLanguages"],
};
