import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { join } from "node:path";
import { AIAgent } from "@aigne/core";
import fs from "fs-extra";
import { parse as yamlParse, stringify as yamlStringify } from "yaml";

import translateMeta from "../../../agents/publish/translate-meta.mjs";
import { DOC_SMITH_DIR } from "../../../utils/constants/index.mjs";
import * as utils from "../../../utils/utils.mjs";

const CACHE_PATH = join(DOC_SMITH_DIR, "translation-cache.yaml");

describe("translate-meta", () => {
  let loadConfigSpy;
  let ensureFileSpy;
  let readFileSpy;
  let writeFileSpy;
  let agentFromSpy;

  beforeEach(() => {
    loadConfigSpy = spyOn(utils, "loadConfigFromFile");
    ensureFileSpy = spyOn(fs, "ensureFile").mockResolvedValue();
    readFileSpy = spyOn(fs, "readFile").mockResolvedValue("");
    writeFileSpy = spyOn(fs, "writeFile").mockResolvedValue();
    agentFromSpy = spyOn(AIAgent, "from");
  });

  afterEach(() => {
    loadConfigSpy.mockRestore();
    ensureFileSpy.mockRestore();
    readFileSpy.mockRestore();
    writeFileSpy.mockRestore();
    agentFromSpy.mockRestore();
  });

  test("translates missing languages and updates the cache", async () => {
    loadConfigSpy.mockResolvedValue({
      locale: "en",
      translateLanguages: ["fr", "ja"],
    });

    const mockAgent = { name: "translateMetaAgent" };
    agentFromSpy.mockReturnValue(mockAgent);

    const contextInvokeMock = mock(async () => ({
      title: {
        fr: "Titre du projet",
        ja: "プロジェクトタイトル",
      },
      desc: {
        fr: "Description du projet",
        ja: "プロジェクトの説明",
      },
    }));

    const result = await translateMeta(
      {
        projectName: "My Project",
        projectDesc: "Project Description",
        locale: "en",
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(ensureFileSpy).toHaveBeenCalledWith(CACHE_PATH);
    expect(readFileSpy).toHaveBeenCalledWith(CACHE_PATH, "utf-8");
    expect(agentFromSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "translateMeta",
      }),
    );

    expect(contextInvokeMock).toHaveBeenCalledWith(
      mockAgent,
      expect.objectContaining({
        message: expect.stringContaining("title: en, fr, ja"),
      }),
    );
    expect(contextInvokeMock.mock.calls[0][1].message).toContain("desc: en, fr, ja");
    expect(contextInvokeMock.mock.calls[0][1].message).toContain("Source Language: en");

    expect(writeFileSpy).toHaveBeenCalledWith(CACHE_PATH, expect.any(String), { encoding: "utf8" });

    const savedCache = yamlParse(writeFileSpy.mock.calls[0][1]);
    expect(savedCache["My Project"]).toEqual({
      fr: "Titre du projet",
      ja: "プロジェクトタイトル",
    });
    expect(savedCache["Project Description"]).toEqual({
      fr: "Description du projet",
      ja: "プロジェクトの説明",
    });
    expect(result.translatedMetadata.title).toEqual(savedCache["My Project"]);
    expect(result.translatedMetadata.desc).toEqual(savedCache["Project Description"]);
  });

  test("skips agent invocation when all translations exist", async () => {
    const existingCache = {
      "My Project": {
        en: "Project Title",
        fr: "Titre du projet",
      },
      "Project Description": {
        en: "Project description",
        fr: "Description du projet",
      },
    };

    loadConfigSpy.mockResolvedValue({
      locale: "en",
      translateLanguages: ["fr"],
    });
    readFileSpy.mockResolvedValue(yamlStringify(existingCache));

    const mockAgent = { name: "translateMetaAgent" };
    agentFromSpy.mockReturnValue(mockAgent);

    const contextInvokeMock = mock(async () => {
      throw new Error("Agent should not be invoked when cache is complete");
    });

    const result = await translateMeta(
      {
        projectName: "My Project",
        projectDesc: "Project Description",
        locale: "en",
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(contextInvokeMock).not.toHaveBeenCalled();
    expect(writeFileSpy).toHaveBeenCalledWith(CACHE_PATH, expect.any(String), { encoding: "utf8" });

    const savedCache = yamlParse(writeFileSpy.mock.calls[0][1]);
    expect(savedCache).toEqual(existingCache);
    expect(result.translatedMetadata.title).toEqual(existingCache["My Project"]);
    expect(result.translatedMetadata.desc).toEqual(existingCache["Project Description"]);
  });

  test("ignores empty translation values returned by the agent", async () => {
    loadConfigSpy.mockResolvedValue({
      locale: "en",
      translateLanguages: ["fr"],
    });

    const mockAgent = { name: "translateMetaAgent" };
    agentFromSpy.mockReturnValue(mockAgent);

    const contextInvokeMock = mock(async () => ({
      title: {
        fr: "",
      },
      desc: {
        fr: "",
      },
    }));

    const result = await translateMeta(
      {
        projectName: "My Project",
        projectDesc: "Project Description",
        locale: "en",
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(contextInvokeMock).toHaveBeenCalled();
    expect(writeFileSpy).toHaveBeenCalledWith(CACHE_PATH, expect.any(String), { encoding: "utf8" });

    const savedCache = yamlParse(writeFileSpy.mock.calls[0][1]);
    expect(savedCache["My Project"]).toEqual({});
    expect(savedCache["Project Description"]).toEqual({});
    expect(result.translatedMetadata.title).toEqual({});
    expect(result.translatedMetadata.desc).toEqual({});
  });
});
