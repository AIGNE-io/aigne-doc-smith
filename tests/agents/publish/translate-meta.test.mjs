import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { AIAgent } from "@aigne/core";
import fs from "fs-extra";
import { stringify as yamlStringify } from "yaml";

import translateMeta from "../../../agents/publish/translate-meta.mjs";
import * as docsFinderUtils from "../../../utils/docs-finder-utils.mjs";
import * as utils from "../../../utils/utils.mjs";

describe("translate-meta", () => {
  let ensureFileSpy;
  let readFileSpy;
  let writeFileSpy;
  let pathExistsSpy;
  let agentFromSpy;
  let loadDocumentStructureSpy;
  let saveValueToConfigSpy;

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
    if (typeof fs.pathExists !== "function") {
      fs.pathExists = () => Promise.resolve(false);
    }
    ensureFileSpy = spyOn(fs, "ensureFile").mockResolvedValue();
    readFileSpy = spyOn(fs, "readFile").mockResolvedValue("");
    writeFileSpy = spyOn(fs, "writeFile").mockResolvedValue();
    pathExistsSpy = spyOn(fs, "pathExists").mockResolvedValue(false);
    agentFromSpy = spyOn(AIAgent, "from");
    loadDocumentStructureSpy = spyOn(docsFinderUtils, "loadDocumentStructure").mockResolvedValue(
      null,
    );
    saveValueToConfigSpy = spyOn(utils, "saveValueToConfig").mockResolvedValue();
  });

  afterEach(() => {
    ensureFileSpy.mockRestore();
    readFileSpy.mockRestore();
    writeFileSpy.mockRestore();
    pathExistsSpy.mockRestore();
    agentFromSpy.mockRestore();
    loadDocumentStructureSpy.mockRestore();
    saveValueToConfigSpy.mockRestore();
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

  test("loads description from overview.md when projectDesc is empty", async () => {
    const overviewContent = "# Overview\n\nThis is the overview content.";
    pathExistsSpy.mockResolvedValue(true);
    readFileSpy.mockResolvedValue(overviewContent);

    const mockAgent = { name: "translateMetaAgent" };
    agentFromSpy.mockReturnValue(mockAgent);

    const contextInvokeMock = mock(async () => ({
      title: {},
      desc: {
        fr: "Description traduite",
      },
    }));

    await translateMeta(
      {
        projectName: "My Project",
        projectDesc: "",
        locale: "en",
        translateLanguages: ["fr"],
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(pathExistsSpy).toHaveBeenCalled();
    expect(readFileSpy).toHaveBeenCalled();
    expect(contextInvokeMock).toHaveBeenCalled();
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "projectDesc",
      overviewContent,
      "Project description",
    );
  });

  test("loads description from structure-plan.json when overview.md doesn't exist", async () => {
    pathExistsSpy.mockResolvedValue(false);
    const documentStructure = [
      {
        title: "Overview",
        description: "Project overview description",
        path: "/overview",
      },
    ];
    loadDocumentStructureSpy.mockResolvedValue(documentStructure);

    const mockAgent = { name: "translateMetaAgent" };
    agentFromSpy.mockReturnValue(mockAgent);

    const contextInvokeMock = mock(async () => ({
      title: {},
      desc: {
        fr: "Description traduite",
      },
    }));

    await translateMeta(
      {
        projectName: "My Project",
        projectDesc: "",
        locale: "en",
        translateLanguages: ["fr"],
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(pathExistsSpy).toHaveBeenCalled();
    expect(loadDocumentStructureSpy).toHaveBeenCalled();
    expect(contextInvokeMock).toHaveBeenCalled();
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "projectDesc",
      "Project overview description",
      "Project description",
    );
  });

  test("uses first item from structure-plan.json when Overview not found", async () => {
    pathExistsSpy.mockResolvedValue(false);
    const documentStructure = [
      {
        title: "Getting Started",
        description: "Getting started description",
        path: "/getting-started",
      },
    ];
    loadDocumentStructureSpy.mockResolvedValue(documentStructure);

    const mockAgent = { name: "translateMetaAgent" };
    agentFromSpy.mockReturnValue(mockAgent);

    const contextInvokeMock = mock(async () => ({
      title: {},
      desc: {
        fr: "Description traduite",
      },
    }));

    await translateMeta(
      {
        projectName: "My Project",
        projectDesc: "",
        locale: "en",
        translateLanguages: ["fr"],
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(loadDocumentStructureSpy).toHaveBeenCalled();
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "projectDesc",
      "Getting started description",
      "Project description",
    );
  });

  test("keeps empty desc when both overview.md and structure-plan.json are unavailable", async () => {
    pathExistsSpy.mockResolvedValue(false);
    loadDocumentStructureSpy.mockResolvedValue(null);

    const mockAgent = { name: "translateMetaAgent" };
    agentFromSpy.mockReturnValue(mockAgent);

    const contextInvokeMock = mock(async () => ({
      title: {},
      desc: {},
    }));

    await translateMeta(
      {
        projectName: "My Project",
        projectDesc: "",
        locale: "en",
        translateLanguages: ["fr"],
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(pathExistsSpy).toHaveBeenCalled();
    expect(loadDocumentStructureSpy).toHaveBeenCalled();
    expect(saveValueToConfigSpy).not.toHaveBeenCalled();
  });

  test("does not save to config when projectDesc is provided", async () => {
    const mockAgent = { name: "translateMetaAgent" };
    agentFromSpy.mockReturnValue(mockAgent);

    const contextInvokeMock = mock(async () => ({
      title: {},
      desc: {},
    }));

    await translateMeta(
      {
        projectName: "My Project",
        projectDesc: "Provided description",
        locale: "en",
        translateLanguages: ["fr"],
      },
      {
        context: {
          invoke: contextInvokeMock,
        },
      },
    );

    expect(saveValueToConfigSpy).not.toHaveBeenCalled();
  });
});
