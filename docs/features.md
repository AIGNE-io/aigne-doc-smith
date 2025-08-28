---
labels: ["Reference"]
---

# Core Features

AIGNE DocSmith provides a set of commands to manage the entire documentation lifecycle, from initial creation based on your source code to multi-language translation and online publishing. This section gives an overview of the main capabilities. Each feature is designed to automate complex tasks, allowing you to focus on your code.

---

## Generate Documentation

The `aigne doc generate` command is the starting point for all documentation. It intelligently analyzes your codebase, plans a logical document structure, and then generates high-quality content for each section. If you're running it for the first time in a project, it will automatically guide you through a quick setup wizard to configure languages, style, and scope.

![Executing structure planning and document generation](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

[Learn more about generating documentation.](./features-generate-documentation.md)

## Update and Refine

Keeping documentation synchronized with your code is straightforward. DocSmith automatically detects source code changes and updates only the necessary documents when you run the `generate` command. For more targeted changes, you can use `aigne doc update` to regenerate a specific document with new feedback, ensuring your content is always accurate and relevant.

![Interactively select a document to update with new feedback](https://docsmith.aigne.io/image-bin/uploads/75e9cf9823bb369c3d2b5a2e2da4ac06.png)

[Discover how to update and refine your docs.](./features-update-and-refine.md)

## Translate Documentation

Reach a global audience by translating your documentation into more than 12 languages. The `aigne doc translate` command automates this process. You can run it in an interactive mode to choose which documents to translate and which languages to target, making localization simple.

![Choose from over 12 supported languages for translation](https://docsmith.aigne.io/image-bin/uploads/2e243a2488f2060a693fe0ac0c8fb5ad.png)

[See how to translate your documentation.](./features-translate-documentation.md)

## Publish Your Docs

Once your documentation is ready, use `aigne doc publish` to make it available online. The command provides an interactive prompt to publish to the official DocSmith platform or to your own self-hosted instance of Discuss Kit, giving you full control over where your docs are hosted.

![Publish documentation to the official platform or a self-hosted instance](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

[Read the guide on publishing your docs.](./features-publish-your-docs.md)

---

These core features work together to create a streamlined documentation workflow. For a complete list of all available commands and their specific options, refer to the [CLI Command Reference](./cli-reference.md).