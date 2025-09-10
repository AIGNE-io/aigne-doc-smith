# Core Features

AIGNE DocSmith provides a set of commands to manage your documentation lifecycle, from initial creation to global distribution. The process is organized into a standard workflow: generating, refining, translating, and publishing your documentation.

```d2
direction: down

Generate: {
  label: "1. Generate\naigne doc generate"
  shape: rectangle
  description: "Create a full documentation set from your source code."
}

Refine: {
  label: "2. Update & Refine\naigne doc update"
  shape: rectangle
  description: "Keep docs in sync with code and apply targeted feedback."
}

Translate: {
  label: "3. Translate\naigne doc translate"
  shape: rectangle
  description: "Localize content into multiple languages for a global audience."
}

Publish: {
  label: "4. Publish\naigne doc publish"
  shape: rectangle
  description: "Deploy your documentation to public or private platforms."
}

Generate -> Refine -> Translate -> Publish
```

Explore the main capabilities of DocSmith in the following sections:

<x-cards data-columns="2">
  <x-card data-title="Generate Documentation" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    Create a complete set of documentation from your source code using a single command.
  </x-card>
  <x-card data-title="Update and Refine" data-icon="lucide:edit" data-href="/features/update-and-refine">
    Keep your documentation synchronized with code changes or regenerate specific documents with targeted feedback.
  </x-card>
  <x-card data-title="Translate Documentation" data-icon="lucide:languages" data-href="/features/translate-documentation">
    Translate your content into multiple supported languages to make your project accessible to a global audience.
  </x-card>
  <x-card data-title="Publish Your Docs" data-icon="lucide:send" data-href="/features/publish-your-docs">
    Publish your generated documentation to the official DocSmith platform or your own self-hosted instance.
  </x-card>
</x-cards>

These features provide a structured workflow for documentation. For a detailed list of all available commands and their options, see the [CLI Command Reference](./cli-reference.md).
