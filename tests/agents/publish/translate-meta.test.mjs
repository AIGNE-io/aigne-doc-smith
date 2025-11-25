import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { AIAgent } from "@aigne/core";
import fs from "fs-extra";
import { stringify as yamlStringify } from "yaml";

import translateMeta from "../../../agents/publish/translate-meta.mjs";

describe("translate-meta", () => {
  let ensureFileSpy;
  let readFileSpy;
  let writeFileSpy;
  let agentFromSpy;

  beforeEach(() => {
    mock.restore();
    // Ensure fs-extra has callable methods even if other tests mocked the module
    if (typeof fs.ensureFile !== "function") {
      fs.ensureFile = () => Promise.resolve();
    }
    if (typeof fs.readFile !== "function") {
      fs.readFile = () => Promise.resolve("");
    }
    if (typeof fs.writeFile !== "function") {
      fs.writeFile = () => Promise.resolve();
    }
    ensureFileSpy = spyOn(fs, "ensureFile").mockResolvedValue();
    readFileSpy = spyOn(fs, "readFile").mockResolvedValue("");
    writeFileSpy = spyOn(fs, "writeFile").mockResolvedValue();
    agentFromSpy = spyOn(AIAgent, "from");
  });

  afterEach(() => {
    ensureFileSpy.mockRestore();
    readFileSpy.mockRestore();
    writeFileSpy.mockRestore();
    agentFromSpy.mockRestore();
  });

  test("translates missing languages and updates the cache", async () => {
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
        translateLanguages: ["fr", "ja"],
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(contextInvokeMock).toHaveBeenCalledTimes(1);
    expect(result.translatedMetadata.title.fr).toBe("Titre du projet");
    expect(result.translatedMetadata.desc.ja).toBe("プロジェクトの説明");
    expect(writeFileSpy).toHaveBeenCalled();
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
        translateLanguages: ["fr"],
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(contextInvokeMock).not.toHaveBeenCalled();
    expect(result.translatedMetadata.title.fr).toBe("Titre du projet");
    expect(result.translatedMetadata.desc.fr).toBe("Description du projet");
  });

  test("ignores empty translation values returned by the agent", async () => {
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
        translateLanguages: ["fr"],
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(result.translatedMetadata.title.fr).toBeUndefined();
    expect(result.translatedMetadata.desc.fr).toBeUndefined();
  });
});
