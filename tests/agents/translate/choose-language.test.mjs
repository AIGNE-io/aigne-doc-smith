import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import chooseLanguage from "../../../agents/translate/choose-language.mjs";

import * as utils from "../../../utils/utils.mjs";

describe("chooseLanguage", () => {
  let mockOptions;

  // Spies for internal utils
  let loadConfigFromFileSpy;
  let saveValueToConfigSpy;
  let consoleSpy;

  beforeEach(() => {
    mock.restore();

    mockOptions = {
      prompts: {
        checkbox: mock(async () => ["zh", "ja"]),
      },
    };

    // Set up spies for internal utils
    loadConfigFromFileSpy = spyOn(utils, "loadConfigFromFile").mockResolvedValue({});
    saveValueToConfigSpy = spyOn(utils, "saveValueToConfig").mockResolvedValue();
    consoleSpy = spyOn(console, "log").mockImplementation(() => {});

    // Clear prompts mock call history
    mockOptions.prompts.checkbox.mockClear();
  });

  afterEach(() => {
    // Restore all spies
    loadConfigFromFileSpy?.mockRestore();
    saveValueToConfigSpy?.mockRestore();
    consoleSpy?.mockRestore();
  });

  // BASIC FUNCTIONALITY TESTS
  test("should return selected languages with provided langs parameter", async () => {
    const selectedDocs = [
      { path: "/doc1", title: "Document 1" },
      { path: "/doc2", title: "Document 2" },
    ];

    const result = await chooseLanguage(
      {
        langs: ["zh", "ja"],
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(result.selectedLanguages).toEqual(["zh", "ja"]);
    expect(result.selectedDocs).toHaveLength(2);
    expect(result.selectedDocs[0].translates).toEqual([{ language: "zh" }, { language: "ja" }]);
    expect(mockOptions.prompts.checkbox).not.toHaveBeenCalled();
  });

  test("should prompt for language selection when no langs provided", async () => {
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    const result = await chooseLanguage(
      {
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(mockOptions.prompts.checkbox).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Select translation languages:",
        choices: expect.any(Array),
        validate: expect.any(Function),
      }),
    );
    expect(result.selectedLanguages).toEqual(["zh", "ja"]);
  });

  test("should exclude primary language from available choices", async () => {
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    await chooseLanguage(
      {
        locale: "zh",
        selectedDocs,
      },
      mockOptions,
    );

    const choices = mockOptions.prompts.checkbox.mock.calls[0][0].choices;
    const zhChoice = choices.find((choice) => choice.value === "zh");
    expect(zhChoice).toBeUndefined();

    // Should have English available since zh is primary
    const enChoice = choices.find((choice) => choice.value === "en");
    expect(enChoice).toBeDefined();
  });

  test("should use existing config for primary language when not provided", async () => {
    loadConfigFromFileSpy.mockResolvedValue({ locale: "es" });
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    await chooseLanguage({ selectedDocs }, mockOptions);

    const choices = mockOptions.prompts.checkbox.mock.calls[0][0].choices;
    const esChoice = choices.find((choice) => choice.value === "es");
    expect(esChoice).toBeUndefined(); // Spanish should be excluded as primary
  });

  test("should default to 'en' when no locale in config or parameter", async () => {
    loadConfigFromFileSpy.mockResolvedValue({});
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    await chooseLanguage({ selectedDocs }, mockOptions);

    const choices = mockOptions.prompts.checkbox.mock.calls[0][0].choices;
    const enChoice = choices.find((choice) => choice.value === "en");
    expect(enChoice).toBeUndefined(); // English should be excluded as primary
  });

  // VALIDATION TESTS
  test("should validate checkbox selection requires at least one language", async () => {
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    await chooseLanguage({ locale: "en", selectedDocs }, mockOptions);

    const validateFn = mockOptions.prompts.checkbox.mock.calls[0][0].validate;
    expect(validateFn([])).toBe("Please select at least one language");
    expect(validateFn(["zh"])).toBe(true);
  });

  test("should filter out invalid languages from langs parameter", async () => {
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    const result = await chooseLanguage(
      {
        langs: ["zh", "invalid-lang", "ja", "another-invalid"],
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(result.selectedLanguages).toEqual(["zh", "ja"]);
    expect(consoleSpy).not.toHaveBeenCalled(); // Valid languages were found
  });

  test("should show warning and prompt when all provided langs are invalid", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue(["fr"]);
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    const result = await chooseLanguage(
      {
        langs: ["invalid1", "invalid2"],
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid languages provided"));
    expect(mockOptions.prompts.checkbox).toHaveBeenCalled();
    expect(result.selectedLanguages).toEqual(["fr"]);
  });

  test("should throw error when no languages are selected", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue([]);
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    await expect(chooseLanguage({ locale: "en", selectedDocs }, mockOptions)).rejects.toThrow(
      "No languages selected for translation",
    );
  });

  // CONFIG MANAGEMENT TESTS
  test("should save new languages to config", async () => {
    loadConfigFromFileSpy.mockResolvedValue({
      translateLanguages: ["zh"],
    });
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    await chooseLanguage(
      {
        langs: ["zh", "ja", "fr"], // ja and fr are new
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(saveValueToConfigSpy).toHaveBeenCalledWith("translateLanguages", ["zh", "ja", "fr"]);
  });

  test("should not save to config when no new languages", async () => {
    loadConfigFromFileSpy.mockResolvedValue({
      translateLanguages: ["zh", "ja"],
    });
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    await chooseLanguage(
      {
        langs: ["zh", "ja"], // All existing
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(saveValueToConfigSpy).not.toHaveBeenCalled();
  });

  test("should mark previously selected languages as checked in prompt", async () => {
    loadConfigFromFileSpy.mockResolvedValue({
      translateLanguages: ["zh", "ja"],
    });
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    await chooseLanguage({ locale: "en", selectedDocs }, mockOptions);

    const choices = mockOptions.prompts.checkbox.mock.calls[0][0].choices;
    const zhChoice = choices.find((choice) => choice.value === "zh");
    const jaChoice = choices.find((choice) => choice.value === "ja");
    const frChoice = choices.find((choice) => choice.value === "fr");

    expect(zhChoice.checked).toBe(true);
    expect(jaChoice.checked).toBe(true);
    expect(frChoice.checked).toBe(false);
  });

  // DOCUMENT PROCESSING TESTS
  test("should add translation info to selected documents", async () => {
    const selectedDocs = [
      { path: "/doc1", title: "Document 1", existing: "data" },
      { path: "/doc2", title: "Document 2" },
    ];

    const result = await chooseLanguage(
      {
        langs: ["zh", "ja"],
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(result.selectedDocs).toEqual([
      {
        path: "/doc1",
        title: "Document 1",
        existing: "data",
        translates: [{ language: "zh" }, { language: "ja" }],
      },
      {
        path: "/doc2",
        title: "Document 2",
        translates: [{ language: "zh" }, { language: "ja" }],
      },
    ]);
  });

  // EDGE CASES
  test("should handle empty selectedDocs array", async () => {
    const result = await chooseLanguage(
      {
        langs: ["zh"],
        locale: "en",
        selectedDocs: [],
      },
      mockOptions,
    );

    expect(result.selectedDocs).toEqual([]);
    expect(result.selectedLanguages).toEqual(["zh"]);
  });

  test("should handle empty langs array", async () => {
    mockOptions.prompts.checkbox.mockResolvedValue(["fr"]);
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    const result = await chooseLanguage(
      {
        langs: [],
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(mockOptions.prompts.checkbox).toHaveBeenCalled();
    expect(result.selectedLanguages).toEqual(["fr"]);
  });

  test("should handle missing config file", async () => {
    loadConfigFromFileSpy.mockResolvedValue(null);
    const selectedDocs = [{ path: "/doc1", title: "Document 1" }];

    const result = await chooseLanguage(
      {
        langs: ["zh"],
        locale: "en",
        selectedDocs,
      },
      mockOptions,
    );

    expect(result.selectedLanguages).toEqual(["zh"]);
  });
});
