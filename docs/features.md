# Core Features

AIGNE DocSmith provides a set of commands to manage the documentation lifecycle, from initial creation to global distribution. The process is organized into a standard workflow: generating, refining,translating, and publishing your documentation.

```d2
direction: down

source-code: {
  label: "Source Code"
  shape: rectangle
}

generate-documentation: {
  label: "Generate Documentation"
  shape: rectangle
}

update-and-refine: {
  label: "Update and Refine"
  shape: rectangle
}

translate-documentation: {
  label: "Translate Documentation"
  shape: rectangle
}

publish-docs: {
  label: "Publish Your Docs"
  shape: rectangle
}

platform: {
  label: "DocSmith Platform\n(or self-hosted)"
  shape: cylinder
}

source-code -> generate-documentation
generate-documentation -> update-and-refine
update-and-refine -> translate-documentation
translate-documentation -> publish-docs
publish-docs -> platform
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

These features provide a structured workflow for creating and maintaining documentation. For a detailed list of all available commands and their options, refer to the [CLI Command Reference](./cli-reference.md).