---
labels: ["Reference"]
---

# Advanced Topics

For those who wish to look under the hood, this section provides a deeper dive into the architecture of AIGNE DocSmith. Here, you'll learn how the tool functions, its place within the AIGNE ecosystem, and the internal mechanisms it uses to generate high-quality documentation.

While a deep understanding of these topics isn't necessary for general use, it can be valuable for customizing behavior, troubleshooting issues, or contributing to the project.

## The AIGNE Ecosystem

AIGNE DocSmith is not a standalone tool; it is a key component of the [AIGNE Framework](https://www.aigne.io/en/framework), a comprehensive platform for AI application development. This integration allows DocSmith to leverage the platform's advanced AI capabilities and robust infrastructure. The following diagram illustrates how DocSmith fits into the broader ecosystem.

```d2
direction: down

User: { shape: person }

Source-Code: {
  label: "Source Code"
  shape: document
}

AIGNE-Framework: {
  label: "AIGNE Framework"
  shape: package
  grid-columns: 1
  grid-gap: 100

  AIGNE-CLI: {
    label: "AIGNE CLI"
    shape: rectangle
    grid-columns: 3

    DocSmith: { label: "aigne doc\n(DocSmith)" }
    aigne-app: { label: "aigne app" }
    aigne-agent: { label: "aigne agent" }
  }

  AIGNE-Core: {
    label: "AIGNE Core"
    shape: rectangle
    grid-columns: 3

    Agent-Orchestration: { label: "Agent Orchestration" }
    Memory-Management: { label: "Memory Management" }
    Tool-Integration: { label: "Tool Integration" }
  }

  AIGNE-Hub: {
    label: "AIGNE Hub"
    shape: rectangle

    LLM-Providers: {
      label: "LLM Providers"
      shape: package
      grid-columns: 3

      OpenAI: { label: "OpenAI" }
      Google: { label: "Google" }
      Anthropic: { label: "Anthropic" }
    }
  }
}

Generated-Documentation: {
  label: "Generated\nDocumentation"
  shape: document
}

Discuss-Kit-Platform: {
  label: "Discuss Kit Platform"
  shape: rectangle
}

# Connections
User -> AIGNE-Framework.AIGNE-CLI.DocSmith: "Uses"
Source-Code -> AIGNE-Framework.AIGNE-CLI.DocSmith: "Input"
AIGNE-Framework.AIGNE-CLI.DocSmith -> AIGNE-Framework.AIGNE-Core: "Leverages"
AIGNE-Framework.AIGNE-Core -> AIGNE-Framework.AIGNE-Hub: "Connects via"
AIGNE-Framework.AIGNE-CLI.DocSmith -> Generated-Documentation: "Generates"
Generated-Documentation -> Discuss-Kit-Platform: "Publishes to"
```

To better understand the internal processes and quality controls, explore the following sections.

<x-cards data-columns="2">
  <x-card data-title="How It Works" data-href="/advanced/how-it-works" data-icon="lucide:cpu">
    An architectural overview of DocSmith, explaining the role of AI agents in the documentation generation pipeline.
  </x-card>
  <x-card data-title="Quality Assurance" data-href="/advanced/quality-assurance" data-icon="lucide:shield-check">
    Understand the built-in checks DocSmith performs to ensure high-quality, well-formatted, and error-free documentation.
  </x-card>
</x-cards>

By exploring these topics, you can gain a more complete understanding of DocSmith's capabilities. For a detailed breakdown of all available commands and their options, proceed to the [CLI Command Reference](./cli-reference.md).