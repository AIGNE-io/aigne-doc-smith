---
labels: ["Reference"]
---

# How It Works

AIGNE DocSmith transforms your source code into comprehensive documentation through a sophisticated, multi-agent AI pipeline built on the AIGNE Framework. Instead of a single, monolithic process, DocSmith employs a team of specialized AI agents, each responsible for a specific task in the documentation lifecycle. This section provides an architectural overview of this process.

## The Agent-Based Architecture

The core of DocSmith is its collection of AI agents. Each agent is a specialized AI model configured to perform a distinct function, such as planning the document structure, generating detailed content, or translating text. These agents are defined in configuration files (like `structure-planning.yaml` and `content-detail-generator.yaml`) and are orchestrated to work together in a pipeline.

This modular approach allows for greater control, quality, and maintainability. Each step of the process is handled by an expert, ensuring a high-quality result.

## The Documentation Generation Pipeline

The process of generating documentation follows a clear, multi-step pipeline:

```d2
direction: down

Source-Code: {
  label: "Source Code & User Input"
  shape: cylinder
}

Structure-Planner: {
  label: "1. Structure Planning Agent"
  shape: rectangle
}

Structure-Plan: {
  label: "Logical Document Structure (structurePlan.yaml)"
  shape: rectangle
}

Content-Generator: {
  label: "2. Content Generation Agent"
  shape: rectangle
}

Markdown-Docs: {
  label: "Detailed Markdown Documents"
  shape: rectangle
}

Translation-Agent: {
  label: "3. Translation Agent"
  shape: rectangle
}

Translated-Docs: {
  label: "Multi-Language Documentation"
  shape: rectangle
}

Source-Code -> Structure-Planner: "Analyzes codebase"
Structure-Planner -> Structure-Plan: "Generates blueprint"
Structure-Plan -> Content-Generator: "Provides context"
Source-Code -> Content-Generator: "Provides details"
Content-Generator -> Markdown-Docs: "Writes content for each section"
Markdown-Docs -> Translation-Agent: "Translates"
Translation-Agent -> Translated-Docs: "Outputs localized versions"

```

### 1. Structure Planning

The process begins when the `structurePlanGenerator` agent analyzes your codebase, user requirements, and any existing documentation. Guided by a sophisticated prompt (`prompts/structure-planning.md`), it produces a comprehensive and logical document structure, known as the `structurePlan`. This plan acts as a blueprint, defining every section, its title, description, and the relevant source files it should be based on.

DocSmith also employs a `reflective-structure-planner` that can review and refine the initial plan based on feedback, ensuring the final structure is optimal.

### 2. Content Generation

Once the structure is defined, the `contentDetailGenerator` agent takes over. It iterates through each item in the `structurePlan` and generates detailed, high-quality content. For each section, it receives:

- The section's **title, description, and path**.
- The specific **source code snippets** associated with that section.
- The **overall structure plan** for context.
- A detailed **prompt** (`prompts/content-detail-generator.md`) that instructs it on tone, style, and format.

This ensures that the content is not only technically accurate but also contextually aware and consistent with the rest of the documentation.

### 3. Translation and Refinement

After the primary language documentation is generated, agents like `translate` and `batch-translate` can be invoked. They take the generated Markdown files and translate them into the multiple languages you've configured, leveraging powerful language models to provide accurate and natural-sounding translations.

Furthermore, agents like `detail-regenerator` allow you to update and refine individual documents with specific feedback, ensuring the documentation can be iteratively improved over time.