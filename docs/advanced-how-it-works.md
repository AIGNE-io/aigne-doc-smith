---
labels: ["Reference"]
---

# How It Works

AIGNE DocSmith provides a sophisticated, automated documentation solution by leveraging a multi-agent system built on the AIGNE Framework. Instead of relying on a single, monolithic AI, DocSmith orchestrates a pipeline of specialized AI agents, each an expert in its specific task. This collaborative approach ensures the generation of structured, detailed, and high-quality documentation directly from your source code.

## Architectural Overview

DocSmith is an integral part of the AIGNE ecosystem, a comprehensive platform for AI application development. It seamlessly integrates with other AIGNE components, utilizing the platform's core AI capabilities and infrastructure.

![AIGNE Ecosystem Architecture](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

At its core, DocSmith operates as a pipeline, processing your source code through several distinct stages, each managed by one or more dedicated AI agents.

## The Documentation Generation Pipeline

The entire process, from analyzing your code to publishing the final documents, follows a structured pipeline. This ensures consistency and allows for targeted refinements at any stage.

```d2
direction: down

"Source Code & Config": {
  shape: step
  label: "Input: Source Code & Configuration"
}

"Structure Planning": {
  shape: step
  label: "1. Structure Planning"
}

"Content Generation": {
  shape: step
  label: "2. Content Generation"
}

"Saving & Output": {
  shape: step
  label: "3. Saving & Output"
}

"Optional Processes": {
  shape: diamond
  label: "4. Optional Processes"
}

"Translation": {
  shape: step
  label: "Translation"
}

"Publishing": {
  shape: step
  label: "Publishing"
}

"Feedback Loop": {
  shape: callout
  label: "User Feedback Loop"
}

"Source Code & Config" -> "Structure Planning"
"Structure Planning" -> "Content Generation"
"Content Generation" -> "Saving & Output"
"Saving & Output" -> "Optional Processes"

"Optional Processes" -> "Translation": "Translate Docs"
"Optional Processes" -> "Publishing": "Publish Docs"

"Structure Planning" <- "Feedback Loop": "Refine Structure"
"Content Generation" <- "Feedback Loop": "Regenerate Content"

```

1.  **Input Analysis**: The process begins with agents like `load-sources` and `load-config`, which gather your source code, configuration files (`aigne.yaml`), and any user-defined rules.

2.  **Structure Planning**: The `reflective-structure-planner` agent analyzes the codebase to propose a comprehensive and logical document structure. It considers your specified target audience, rules, and feedback to create an optimal outline.

3.  **Content Generation**: Once the structure is approved, the `content-detail-generator` and `batch-docs-detail-generator` agents take over. They populate each section of the document plan with detailed, high-quality content, ensuring technical accuracy and adherence to the defined style.

4.  **Refinement and Updates**: If you provide feedback using `aigne doc update` or `aigne doc generate --feedback`, the `detail-regenerator` and `feedback-refiner` agents are activated. They intelligently update specific documents or adjust the overall structure based on your input.

5.  **Translation and Publishing**: Finally, optional agents like `translate` and `publish-docs` handle multi-language translation and publishing to Discuss Kit platforms, completing the end-to-end workflow.

## Key AI Agents

DocSmith's power comes from its team of specialized agents. While many agents work behind the scenes, here are some of the key players in the documentation pipeline:

| Agent Role | Primary Function | Governing File(s) |
|---|---|---|
| **Structure Planner** | Analyzes source code and rules to generate the overall documentation outline. | `structure-planning.yaml`, `reflective-structure-planner.yaml` |
| **Content Generator** | Writes detailed content for each individual document section based on the plan. | `content-detail-generator.yaml`, `batch-docs-detail-generator.yaml` |
| **Translation Agent** | Translates generated documentation into multiple target languages. | `translate.yaml`, `batch-translate.yaml` |
| **Refinement Agent** | Regenerates or modifies content and structure based on user feedback. | `detail-regenerator.yaml`, `feedback-refiner.yaml` |
| **Publishing Agent** | Manages the process of publishing documents to Discuss Kit instances. | `publish-docs.mjs`, `team-publish-docs.yaml` |
| **Configuration Loader** | Reads and interprets the project's configuration from `aigne.yaml`. | `load-config.mjs` |

This modular, agent-based architecture makes DocSmith highly flexible and robust, allowing each step of the process to be optimized independently.

---

Now that you understand the mechanics behind DocSmith, learn about the measures in place to guarantee high-quality output in the [Quality Assurance](./advanced-quality-assurance.md) section.
