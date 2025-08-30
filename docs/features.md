---
labels: ["Reference"]
---

# Core Features

AIGNE DocSmith provides a comprehensive suite of tools to manage your documentation lifecycle, from initial creation to global distribution. It streamlines the process with a few simple commands, leveraging AI to automate complex tasks.

The typical workflow follows a logical progression, allowing you to generate, refine, translate, and finally publish your documentation.

```d2
direction: right

"Generate Docs": {
  shape: step
  description: "Automated creation from source code"
}

"Update & Refine": {
  shape: step
  description: "Sync with code changes and apply feedback"
}

"Translate": {
  shape: step
  description: "Reach a global audience with 12+ languages"
}

"Publish": {
  shape: step
  description: "Share your docs on public or private platforms"
}

"Generate Docs" -> "Update & Refine" -> "Translate" -> "Publish" {
  style.animated: true
}
```

Explore the main capabilities of DocSmith in the following sections:

<x-cards data-columns="2">
  <x-card data-title="Generate Documentation" data-icon="lucide:file-plus-2" data-href="/features/generate-documentation">
    Automatically create a complete, well-structured set of documentation directly from your source code with a single command.
  </x-card>
  <x-card data-title="Update and Refine" data-icon="lucide:edit" data-href="/features/update-and-refine">
    Keep your documentation synchronized with code changes or regenerate specific sections with targeted feedback to improve quality.
  </x-card>
  <x-card data-title="Translate Documentation" data-icon="lucide:languages" data-href="/features/translate-documentation">
    Effortlessly translate your content into over 12 languages, making your project accessible to a global audience.
  </x-card>
  <x-card data-title="Publish Your Docs" data-icon="lucide:send" data-href="/features/publish-your-docs">
    Publish your generated documentation to the official DocSmith platform or your own self-hosted instance with an interactive command.
  </x-card>
</x-cards>

These core features work together to create a seamless documentation workflow. To see all available commands and their options in detail, head over to the [CLI Command Reference](./cli-reference.md).