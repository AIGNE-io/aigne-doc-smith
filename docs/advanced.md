---
labels: ["Reference"]
---

# Advanced Topics

This section is for users who want to go beyond the standard features of AIGNE DocSmith. Here you will find information on how to contribute to the project and use commands for local development and testing.

## Contributing

Contributions to AIGNE DocSmith are welcome. If you have suggestions, find a bug, or want to improve the tool, we encourage you to get involved. For detailed guidelines on how to submit a pull request or open an issue, please see our dedicated guide.

[Learn more about Contributing](./advanced-contributing.md)

## Development Commands

If you are working on the DocSmith source code locally, you can use `npx` to run your local version for development and debugging. This bypasses the globally installed AIGNE CLI and ensures you are testing your own changes.

Use the following commands to test different agents:

```shell
# Development and debugging commands using npx to run local code
npx --no doc-smith run --entry-agent init
npx --no doc-smith run --entry-agent generate
npx --no doc-smith run --entry-agent update 
npx --no doc-smith run --entry-agent translate 
npx --no doc-smith run --entry-agent publish
```

These commands are essential for testing changes before creating a contribution.