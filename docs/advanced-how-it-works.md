# How It Works

AIGNE DocSmith provides an automated documentation solution by using a multi-agent system. Instead of relying on a single AI model, DocSmith orchestrates a pipeline of specialized AI agents, each an expert in its specific task. This collaborative approach generates structured and detailed documentation directly from your source code.

At its core, DocSmith operates as a pipeline, processing your source code through several distinct stages, each managed by one or more dedicated AI agents.

## The Documentation Generation Pipeline

The entire process, from analyzing your code to publishing the final documents, follows a structured pipeline. This ensures consistency and allows for targeted refinements at any stage.

```d2
direction: down

Input: {
  label: "Source Code & Config"
  shape: package
}

Pipeline: {
  label: "Documentation Generation Pipeline"
  grid-columns: 1
  grid-gap: 40

  Structure-Planning: {
    label: "1. Structure Planning\n(reflective-structure-planner)"
    shape: step
  }

  Content-Generation: {
    label: "2. Content Generation\n(content-detail-generator)"
    shape: step
  }

  Saving: {
    label: "3. Save Documents\n(save-docs)"
    shape: step
  }
}

User-Feedback: {
  label: "User Feedback Loop\n(via --feedback flag)"
  shape: callout
}

Optional-Steps: {
  label: "Optional Steps"
  grid-columns: 2
  grid-gap: 40
  
  Translation: {
    label: "Translate\n(aigne doc translate)"
    shape: step
  }

  Publishing: {
    label: "Publish\n(aigne doc publish)"
    shape: step
  }
}

Input -> Pipeline.Structure-Planning
Pipeline.Structure-Planning -> Pipeline.Content-Generation
Pipeline.Content-Generation -> Pipeline.Saving
Pipeline.Saving -> Optional-Steps

User-Feedback -> Pipeline.Structure-Planning: "Refine Structure"
User-Feedback -> Pipeline.Content-Generation: "Regenerate Content"
```

1.  **Input Analysis**: The process begins with agents like `load-sources` and `load-config`, which gather your source code, configuration files (`aigne.yaml`), and any user-defined rules.

2.  **Structure Planning**: The `reflective-structure-planner` agent analyzes the codebase to propose a logical document structure. It considers your specified target audience, rules, and feedback to create an optimal outline.

3.  **Content Generation**: Once the structure is approved, the `content-detail-generator` and `batch-docs-detail-generator` agents take over. They populate each section of the document plan with detailed content, ensuring technical accuracy and adherence to the defined style.

4.  **Refinement and Updates**: If you provide feedback using `aigne doc update` or `aigne doc generate --feedback`, the `detail-regenerator` and `feedback-refiner` agents are activated. They update specific documents or adjust the overall structure based on your input.

5.  **Translation and Publishing**: Finally, optional agents like `translate` and `publish-docs` handle multi-language translation and publishing to Discuss Kit platforms, completing the end-to-end workflow.

## Key AI Agents

DocSmith's functionality comes from its team of specialized agents. While many agents work behind the scenes, here are some of the key players in the documentation pipeline:

| Agent Role | Primary Function | Governing File(s) |
|---|---|---|
| **Structure Planner** | Analyzes source code and rules to generate the overall documentation outline. | `structure-planning.yaml`, `reflective-structure-planner.yaml` |
| **Content Generator** | Writes detailed content for each individual document section based on the plan. | `content-detail-generator.yaml`, `batch-docs-detail-generator.yaml` |
| **Translation Agent** | Translates generated documentation into multiple target languages. | `translate.yaml`, `batch-translate.yaml` |
| **Refinement Agent** | Regenerates or modifies content and structure based on user feedback. | `detail-regenerator.yaml`, `feedback-refiner.yaml` |
| **Publishing Agent** | Manages the process of publishing documents to Discuss Kit instances. | `publish-docs.mjs`, `team-publish-docs.yaml` |
| **Configuration Loader** | Reads and interprets the project's configuration and source files. | `load-config.mjs`, `load-sources.mjs` |

This modular, agent-based architecture makes DocSmith flexible and robust, allowing each step of the process to be optimized independently.

---

Now that you understand the mechanics behind DocSmith, learn about the measures in place to guarantee output quality in the [Quality Assurance](./advanced-quality-assurance.md) section.