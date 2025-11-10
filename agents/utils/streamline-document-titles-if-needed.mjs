/**
 * Check if a string contains character-based language characters (Chinese, Japanese, Korean, etc.)
 * @param {string} str - String to check
 * @returns {boolean} - True if string contains character-based language characters
 */
function isCharacterBasedLanguage(str) {
  if (!str) return false;
  // Check for Chinese, Japanese, Korean, and other character-based languages
  // Chinese: \u4e00-\u9fff (CJK Unified Ideographs)
  // Japanese: \u3040-\u309f (Hiragana), \u30a0-\u30ff (Katakana)
  // Korean: \uac00-\ud7a3 (Hangul Syllables)
  // Thai: \u0e00-\u0e7f
  // Arabic: \u0600-\u06ff
  const characterBasedPattern =
    /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7a3\u0e00-\u0e7f\u0600-\u06ff]/;
  return characterBasedPattern.test(str);
}

/**
 * Get character limit based on language type
 * @param {string} title - Title to check
 * @returns {number} - Character limit (24 for English, 12 for character-based languages)
 */
function getCharacterLimit(title) {
  return isCharacterBasedLanguage(title) ? 12 : 24;
}

/**
 * Streamline document titles if they exceed length limits
 * Reusable function for streamlining document titles in various contexts
 * @param {Object} params
 * @param {Array<{title: string, path: string}>} params.documentStructure - Document structure array
 * @param {Object} options - Agent options with context
 * @returns {Promise<void>} - Modifies documentStructure in place
 */
export default async function streamlineDocumentTitlesIfNeeded({ documentStructure }, options) {
  if (!documentStructure || !Array.isArray(documentStructure)) {
    return;
  }

  // Filter items that need streamlining based on character count and language type
  // English: > 24 characters, Character-based languages (Chinese, Japanese, etc.): > 12 characters
  const itemsNeedingStreamline = documentStructure.filter((item) => {
    if (!item.title) return false;
    const limit = getCharacterLimit(item.title);
    return item.title.length > limit;
  });

  if (itemsNeedingStreamline.length === 0) {
    return;
  }

  const documentList = itemsNeedingStreamline.map((item) => ({
    path: item.path,
    title: item.title,
  }));

  const streamlineAgent = options?.context?.agents?.["documentTitleStreamline"];
  if (!streamlineAgent) {
    console.warn("⚠️  documentTitleStreamline agent not found. Skipping title streamlining.");
    return;
  }

  try {
    const streamlineResult = await options.context.invoke(streamlineAgent, {
      documentList,
    });

    // Update the document items with streamlined titles using path as the key
    if (streamlineResult.documentList && Array.isArray(streamlineResult.documentList)) {
      const streamlineMap = new Map(streamlineResult.documentList.map((item) => [item.path, item]));

      for (const item of documentStructure) {
        const streamlined = streamlineMap.get(item.path);
        if (streamlined) {
          item.title = streamlined.title;
        }
      }
    }
  } catch (error) {
    console.warn("⚠️  Failed to streamline document titles:", error.message);
    console.warn("Continuing with original titles.");
  }
}

streamlineDocumentTitlesIfNeeded.taskTitle = "Streamline document titles if needed";
streamlineDocumentTitlesIfNeeded.description =
  "Shorten document titles that exceed length limits to make sidebar navigation less crowded";
