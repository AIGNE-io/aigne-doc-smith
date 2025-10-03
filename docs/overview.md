# Overview

AIGNE DocSmith is an AI-driven tool that generates documentation directly from your source code. Built on the [AIGNE Framework](https://www.aigne.io/en/framework), it automates the creation of structured, multi-language documents. This process reduces the manual effort of writing and maintaining documentation, ensuring it stays synchronized with the codebase.

The following diagram illustrates the high-level workflow of DocSmith:

```d2
direction: right
style: {
  font-size: 14
}

# Actors
source_code: "Source Code Repository" {
  shape: cloud
  style: {
    fill: "#F0F4F8"
    stroke: "#4A5568"
  }
}

docsmith: "AIGNE DocSmith Engine" {
  shape: hexagon
  style: {
    fill: "#E6FFFA"
    stroke: "#2C7A7B"
  }
}

published_docs: "Published Documentation" {
  shape: document
  style: {
    fill: "#FEFCBF"
    stroke: "#B7791F"
  }
}

# Main Flow
source_code -> docsmith: "1. Analyze Code"
docsmith -> published_docs: "2. Generate & Publish"

# DocSmith Internal Process
subflow: {
  direction: down
  
  analyze: "Analyze & Plan Structure"
  generate: "Generate Content"
  translate: "Translate (Optional)"
  publish: "Publish"
  
  analyze -> generate -> translate -> publish
}

docsmith.subflow: subflow
```

## Core Features

DocSmith provides a set of features to automate and simplify the documentation process:

*   **Structure Planning:** Analyzes a codebase to generate a logical documentation structure.
*   **Content Generation:** Populates the planned documentation structure with content generated from the source code.
*   **Multi-Language Support:** Translates documentation into 12 languages, including English, Chinese, and Spanish.
*   **AIGNE Hub Integration:** Uses [AIGNE Hub](https://www.aigne.io/en/hub), a service that provides access to various Large Language Models (LLMs) like those from Google, OpenAI, and Anthropic, allowing model switching without managing individual API keys.
*   **One-Click Publishing:** Makes your documentation live with shareable links. You can publish to the official platform or run your own instance using [Discuss Kit](https://www.web3kit.rocks/discuss-kit).
*   **Iterative Updates:** Detects source code changes to update documentation and supports targeted regeneration of specific documents based on user feedback.

## Part of the AIGNE Ecosystem

DocSmith is a component of the [AIGNE](https://www.aigne.io) ecosystem, a platform for developing AI applications. It integrates with other AIGNE components to use the platform's AI capabilities and infrastructure.

The following diagram shows how DocSmith fits within the AIGNE architecture:

![AIGNE Ecosystem Architecture](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

## Next Steps

To begin using DocSmith, proceed to the installation and configuration guide.

<x-card data-title="Next: Getting Started" data-href="/getting-started" data-icon="lucide:arrow-right-circle" data-cta="Start the guide">
Follow the step-by-step guide to install the tool, configure your first project, and generate documentation.
</x-card>