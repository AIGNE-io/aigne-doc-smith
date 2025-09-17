# How It Works

AIGNE DocSmith operates on a multi-agent system built within the AIGNE Framework. Instead of a single monolithic process, it orchestrates a pipeline of specialized AI agents, where each agent is responsible for a specific task. This approach allows for a structured and modular process that transforms source code into complete documentation.

The tool is an integral part of the larger AIGNE ecosystem, which provides a platform for developing and deploying AI applications.

![AIGNE Ecosystem Architecture](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## The Documentation Generation Pipeline

The core of DocSmith is a pipeline that processes your source code through several distinct stages. Each stage is managed by one or more dedicated agents. The primary workflow, typically initiated by the `aigne doc generate` command, can be visualized as follows:

```d2
direction: down

Input: {
  label: "Source Code & Config"
  shape: rectangle
}

Pipeline: {
  label: "Core Generation Pipeline"
  shape: rectangle
  grid-columns: 1
  grid-gap: 40

  Structure-Planning: {
    label: "1. Structure Planning"
    shape: rectangle
  }

  Content-Generation: {
    label: "2. Content Generation"
    shape: rectangle
  }

  Saving: {
    label: "3. Save Documents"
    shape: rectangle
  }
}

User-Feedback: {
  label: "User Feedback Loop\n(via --feedback flag)"
  shape: rectangle
}

Optional-Steps: {
  label: "Optional Post-Generation Steps"
  shape: rectangle
  grid-columns: 2
  grid-gap: 40
  
  Translation: {
    label: "Translate\n(aigne doc translate)"
    shape: rectangle
  }

  Publishing: {
    label: "Publish\n(aigne doc publish)"
    shape: rectangle
  }
}

Input -> Pipeline.Structure-Planning
Pipeline.Structure-Planning -> Pipeline.Content-Generation
Pipeline.Content-Generation -> Pipeline.Saving
Pipeline.Saving -> Optional-Steps

User-Feedback -> Pipeline.Structure-Planning: "Refine Structure"
User-Feedback -> Pipeline.Content-Generation: "Regenerate Content"
```

1.  **Input Analysis**: The process begins when agents load your source code and project configuration (`aigne.yaml`).

2.  **Structure Planning**: An agent analyzes the codebase to propose a logical document structure. It creates an outline based on the project's composition and any specified rules.

3.  **Content Generation**: With the structure in place, content generation agents populate each section of the document plan with detailed text, code examples, and explanations.

4.  **Refinement and Updates**: When you provide input via `aigne doc update` or `aigne doc generate --feedback`, specific agents are activated to update individual documents or adjust the overall structure.

5.  **Translation and Publishing**: After the primary content is generated, optional agents handle tasks like multi-language translation and publishing the final documentation to a web platform.

## Key AI Agents

DocSmith's functionality is provided by a collection of agents defined in the project's configuration. Each agent has a specific role. The table below lists some of the key agents and their functions.

| Functional Role          | Key Agent Files                                      | Description                                                                          |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Structure Planning**   | `generate/generate-structure.yaml`                   | Analyzes source code to propose the initial document outline.                        |
| **Structure Refinement** | `generate/refine-document-structure.yaml`            | Modifies the document structure based on user feedback.                              |
| **Content Generation**   | `update/batch-generate-document.yaml`, `generate-document.yaml` | Populates the document structure with detailed content for each section.             |
| **Translation**          | `translate/translate-document.yaml`, `translate-multilingual.yaml` | Translates generated documentation into multiple target languages.                   |
| **Publishing**           | `publish/publish-docs.mjs`                           | Manages the process of publishing documents to Discuss Kit instances.                |
| **Data I/O**             | `utils/load-sources.mjs`, `utils/save-docs.mjs`      | Responsible for reading source files and writing the final markdown documents to disk. |

This agent-based architecture allows each step of the documentation process to be handled by a specialized tool, ensuring a structured and maintainable workflow.

---

To understand the measures DocSmith takes to ensure the accuracy and format of the output, proceed to the [Quality Assurance](./advanced-quality-assurance.md) section.