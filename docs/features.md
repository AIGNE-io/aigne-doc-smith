---
labels: ["Reference"]
---

# Core Features

AIGNE DocSmith streamlines the entire documentation lifecycle through a set of intuitive commands. This section provides an overview of the main capabilities, from initial creation to ongoing updates and final publication. Each feature is designed to automate manual tasks and integrate directly with your development workflow.

---

## Generate Documentation

The `aigne doc generate` command is the starting point for creating your documentation. It analyzes your source code to build a logical structure and then generates detailed content for each section. If you are running it for the first time in a project, it automatically launches an interactive wizard to help you configure settings like target audience, languages, and source paths.

![Executing structure planning and document generation](https://docsmith.aigne.io/image-bin/uploads/d0766c19380a02eb8a6f8ce86a838849.png)

For a complete guide on creating documents from scratch, see the [Generate Documentation](./features-generate-documentation.md) section.

## Update and Refine

Keeping documentation synchronized with your code is straightforward. DocSmith automatically detects changes in your source code and updates only the necessary documents when you run the `generate` command. For more specific changes, you can use `aigne doc update` to regenerate a single document with targeted feedback. This is useful for improving clarity, adding examples, or correcting information.

![Interactively select a single document to update](https://docsmith.aigne.io/image-bin/uploads/b2bab8e5a727f168628a1cc8c5020697.png)

Dive deeper into the update process in the [Update and Refine](./features-update-and-refine.md) section.

## Publish Your Docs

Once your documentation is ready, the `aigne doc publish` command makes it available online. You can choose to publish to the official DocSmith platform or to your own self-hosted Discuss Kit instance. The command provides an interactive menu to guide you through the publishing options.

![Publish documentation to official or self-hosted platforms](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

Find detailed instructions in the [Publish Your Docs](./features-publish-your-docs.md) guide.

---

These core features provide a complete toolkit for managing your project's documentation. To customize the behavior of these commands, you may want to explore the available settings next.

Proceed to the [Configuration Guide](./configuration.md) to learn how to tailor DocSmith to your specific needs.