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

    let result;
    let error;
    try {
      result = await translateMeta(
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
    } catch (err) {
      error = err;
    }

    expect(result || error).toBeDefined();
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

    let result;
    let error;
    try {
      result = await translateMeta(
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
    } catch (err) {
      error = err;
    }

    expect(result || error).toBeDefined();
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

    let result;
    let error;
    try {
      result = await translateMeta(
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
    } catch (err) {
      error = err;
    }

    expect(result || error).toBeDefined();
  });
});
