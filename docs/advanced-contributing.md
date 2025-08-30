---
labels: ["Reference"]
---

# Contributing

Contributions to AIGNE DocSmith are welcome. Your input helps make the tool better for everyone, whether you're reporting a bug, suggesting a new feature, or contributing directly to the code.

## How to Contribute

There are two main ways to contribute to the project:

1.  **Open an Issue**: If you find a bug, have a suggestion for an improvement, or want to propose a new feature, the best starting point is to open an issue in the project repository. Please provide clear and detailed information to help us understand your feedback.

2.  **Submit a Pull Request**: If you have made changes to the code that you would like to share, you can submit a pull request. We review all submissions and appreciate your efforts to improve DocSmith.

## Development Commands

For those contributing code, it is necessary to run the local version of the application for development and debugging. These commands use `npx` to execute your local code, bypassing any globally installed version of the AIGNE CLI.

Here are the primary commands for local development:

| Command | Description |
| --- | --- |
| `npx --no doc-smith run --entry-agent init` | Runs the local version of the interactive configuration agent. |
| `npx --no doc-smith run --entry-agent generate` | Executes the documentation generation process using your local code. |
| `npx --no doc-smith run --entry-agent update` | Runs the document update agent from your local codebase. |
| `npx --no doc-smith run --entry-agent retranslate` | Triggers the re-translation process using your local code. |
| `npx --no doc-smith run --entry-agent publish` | Runs the publishing agent from your local codebase. |

Using these commands ensures that you are testing your changes against the local codebase before submitting a contribution.