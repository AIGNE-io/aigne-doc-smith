---
labels: ["Reference"]
---

# Core Features

AIGNE DocSmith streamlines the entire documentation lifecycle through a set of powerful, intuitive commands. From initial creation to global distribution, these core features automate the most time-consuming tasks, allowing you to focus on writing great code while DocSmith handles the documentation.

Explore the main capabilities of DocSmith, each designed to handle a specific stage of the documentation process:

<x-cards data-columns="2">
  <x-card data-title="Generate Documentation" data-icon="lucide:wand-2" data-href="/features/generate-documentation">
    Turn your source code into a complete, well-structured set of documents with a single command. DocSmith analyzes your project and builds everything from scratch.
  </x-card>
  <x-card data-title="Update and Refine" data-icon="lucide:refresh-cw" data-href="/features/update-and-refine">
    Keep your documentation synchronized with your codebase. Intelligently update documents based on code changes or refine specific sections using targeted feedback.
  </x-card>
  <x-card data-title="Translate Documentation" data-icon="lucide:languages" data-href="/features/translate-documentation">
    Reach a global audience effortlessly. Automatically translate your documentation into over 12 languages with high accuracy, maintaining consistent terminology.
  </x-card>
  <x-card data-title="Publish Your Docs" data-icon="lucide:rocket" data-href="/features/publish-your-docs">
    Share your documentation with the world. Publish directly to the official DocSmith platform or your own self-hosted Discuss Kit instance with an interactive command.
  </x-card>
</x-cards>

## The Documentation Workflow

These features are designed to work together in a seamless workflow, taking you from raw source code to a published, multi-language documentation site.

```d2
direction: down

generate: {
  label: "1. Generate Documentation"
  shape: rectangle
}

update: {
  label: "2. Update and Refine"
  shape: rectangle
}

translate: {
  label: "3. Translate"
  shape: rectangle
}

publish: {
  label: "4. Publish"
  shape: rectangle
}

generate -> update: "Code Changes & Feedback"
update -> translate: "Finalize Content"
translate -> publish: "Go Live"
```

Each of these features is designed for both simplicity and power. Dive into the specific guides to learn how to master each command and customize the workflow to fit your project's needs. For a complete list of commands and their options, check out the [CLI Command Reference](./cli-reference.md).