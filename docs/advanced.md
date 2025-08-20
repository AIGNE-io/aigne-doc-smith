---
labels: ["Reference"]
---

# Advanced Topics

This section provides information for users who want to go beyond the standard features of AIGNE DocSmith. Here you will find guides on how to contribute to the project and use commands for local development.

## Contributing

AIGNE DocSmith is an open project, and contributions are welcome. Whether you have suggestions, find bugs, or want to add new features, this guide provides the information you need to get involved.

For detailed instructions on how to submit a pull request or open an issue, please refer to our dedicated guide.

[Learn how to contribute](./advanced-contributing.md)

## Development Commands

If you are developing or debugging DocSmith locally, you can use `npx` to run commands from your local source code, bypassing the globally installed CLI. This is useful for testing changes before creating a pull request.

```shell
# Development and debugging commands using npx to run local code
npx --no doc-smith run --entry-agent init
npx --no doc-smith run --entry-agent generate
npx --no doc-smith run --entry-agent update
npx --no doc-smith run --entry-agent retranslate
npx --no doc-smith run --entry-agent publish
```

These commands ensure you are executing the version of the code in your current working directory for testing purposes.