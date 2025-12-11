import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";

import aggregateDocumentStructure from "../../../agents/create/aggregate-document-structure.mjs";
import * as utils from "../../../utils/utils.mjs";

describe("aggregate-document-structure", () => {
  let saveValueToConfigSpy;

  beforeEach(() => {
    saveValueToConfigSpy = spyOn(utils, "saveValueToConfig").mockResolvedValue();
  });

  afterEach(() => {
    saveValueToConfigSpy.mockRestore();
  });

  test("maps document structure with ids and indices", async () => {
    const originalStructure = [
      { title: "Getting Started", path: "/getting-started" },
      { title: "API Reference", path: "/api" },
      { title: "Configuration Guide", path: "/config" },
    ];

    const options = {
      context: {
        userContext: {
          originalDocumentStructure: originalStructure,
          projectName: "Test Project",
          projectDesc: "Test Description",
        },
      },
    };

    const result = await aggregateDocumentStructure({}, options);

    expect(result.documentStructure).toHaveLength(3);
    expect(result.documentStructure[0]).toEqual({
      title: "Getting Started",
      path: "/getting-started",
      id: "getting-started",
      index: 0,
    });
    expect(result.documentStructure[1]).toEqual({
      title: "API Reference",
      path: "/api",
      id: "api-reference",
      index: 1,
    });
    expect(result.documentStructure[2]).toEqual({
      title: "Configuration Guide",
      path: "/config",
      id: "configuration-guide",
      index: 2,
    });
    expect(result.projectName).toBe("Test Project");
    expect(result.projectDesc).toBe("Test Description");
  });

  test("handles titles with multiple spaces", async () => {
    const originalStructure = [{ title: "Getting  Started  Guide", path: "/getting-started" }];

    const options = {
      context: {
        userContext: {
          originalDocumentStructure: originalStructure,
        },
      },
    };

    const result = await aggregateDocumentStructure({}, options);

    expect(result.documentStructure[0].id).toBe("getting-started-guide");
  });

  test("uses input projectName when provided", async () => {
    const originalStructure = [{ title: "Overview", path: "/overview" }];

    const options = {
      context: {
        userContext: {
          originalDocumentStructure: originalStructure,
          projectName: "Context Project",
          projectDesc: "Context Description",
        },
      },
    };

    const result = await aggregateDocumentStructure({ projectName: "Input Project" }, options);

    expect(result.projectName).toBe("Input Project");
    expect(result.projectDesc).toBe("Context Description");
  });

  test("uses input projectDesc when provided", async () => {
    const originalStructure = [{ title: "Overview", path: "/overview" }];

    const options = {
      context: {
        userContext: {
          originalDocumentStructure: originalStructure,
          projectName: "Test Project",
          projectDesc: "Context Description",
        },
      },
    };

    const result = await aggregateDocumentStructure({ projectDesc: "Input Description" }, options);

    expect(result.projectDesc).toBe("Input Description");
    expect(saveValueToConfigSpy).not.toHaveBeenCalled();
  });

  test("saves projectDesc to config when not provided in input", async () => {
    const originalStructure = [{ title: "Overview", path: "/overview" }];

    const options = {
      context: {
        userContext: {
          originalDocumentStructure: originalStructure,
          projectName: "Test Project",
          projectDesc: "Context Description",
        },
      },
    };

    await aggregateDocumentStructure({}, options);

    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "projectDesc",
      "Context Description",
      "Project description",
    );
  });

  test("handles empty document structure", async () => {
    const options = {
      context: {
        userContext: {
          originalDocumentStructure: [],
          projectName: "Test Project",
          projectDesc: "Test Description",
        },
      },
    };

    const result = await aggregateDocumentStructure({}, options);

    expect(result.documentStructure).toEqual([]);
    expect(result.projectName).toBe("Test Project");
    expect(result.projectDesc).toBe("Test Description");
  });

  test("initializes originalDocumentStructure if not exists", async () => {
    const options = {
      context: {
        userContext: {},
      },
    };

    const result = await aggregateDocumentStructure({}, options);

    expect(result.documentStructure).toEqual([]);
    expect(options.context.userContext.originalDocumentStructure).toEqual([]);
  });

  test("handles titles with special characters", async () => {
    const originalStructure = [
      { title: "API & SDK Reference", path: "/api" },
      { title: "What's New?", path: "/whats-new" },
    ];

    const options = {
      context: {
        userContext: {
          originalDocumentStructure: originalStructure,
        },
      },
    };

    const result = await aggregateDocumentStructure({}, options);

    expect(result.documentStructure[0].id).toBe("api-&-sdk-reference");
    expect(result.documentStructure[1].id).toBe("what's-new?");
  });

  test("preserves all original properties in document structure", async () => {
    const originalStructure = [
      {
        title: "Getting Started",
        path: "/getting-started",
        description: "A guide to get started",
        icon: "lucide:rocket",
        customProp: "custom value",
      },
    ];

    const options = {
      context: {
        userContext: {
          originalDocumentStructure: originalStructure,
        },
      },
    };

    const result = await aggregateDocumentStructure({}, options);

    expect(result.documentStructure[0]).toEqual({
      title: "Getting Started",
      path: "/getting-started",
      description: "A guide to get started",
      icon: "lucide:rocket",
      customProp: "custom value",
      id: "getting-started",
      index: 0,
    });
  });
});
