# Cleaning Up

This guide provides instructions on how to use the `aigne doc clear` command to remove generated files, configurations, and cached data from your project. This command is useful for starting fresh or removing sensitive information.

The `clear` command can be run in two modes: interactive and non-interactive. Running it without any arguments will launch an interactive wizard that guides you through the available cleanup options.

## Command Usage

To use the cleanup command, run the following in your terminal:

```bash
aigne doc clear
```

Alternatively, you can specify one or more targets directly as arguments to run the command non-interactively.

```bash
aigne doc clear --targets <target1> <target2> ...
```

## Cleanup Options

When you run the `aigne doc clear` command without arguments, you will be presented with an interactive checklist of items to remove. You can select multiple items to clear at once.

The available cleanup targets are detailed below.

| Target | Description |
| :--- | :--- |
| **`generatedDocs`** | Deletes all generated documentation files from the output directory (e.g., `./docs`). This action preserves the documentation structure file. |
| **`documentStructure`** | Deletes all generated documents and the documentation structure file (e.g., `.aigne/doc-smith/output/structure-plan.json`). |
| **`documentConfig`** | Deletes the main project configuration file (e.g., `.aigne/doc-smith/config.yaml`). You must run `aigne doc init` to regenerate it. |
| **`authTokens`** | Deletes saved authorization tokens from a file (e.g., `~/.aigne/doc-smith-connected.yaml`). You will be prompted to select which site authorizations to clear. |
| **`deploymentConfig`** | Removes the `appUrl` from the document configuration file, leaving other settings intact. |
| **`mediaDescription`** | Deletes cached, AI-generated descriptions for media files (e.g., from `.aigne/doc-smith/media-description.yaml`). They will be regenerated on the next run. |

## Examples

### Interactive Cleanup

To start the interactive cleanup process, run the command without any arguments. This will present a checklist where you can select the items you wish to remove using the spacebar and confirm with Enter.

```bash
aigne doc clear
```

### Non-Interactive Cleanup

To clear specific items directly, provide their target names as arguments.

#### Clear Generated Documents Only

This command removes the `docs` directory but leaves the `structure-plan.json` intact.

```bash
aigne doc clear --targets generatedDocs
```

#### Clear Structure and Configuration

This command removes the generated documents, the structure plan, and the configuration file.

```bash
aigne doc clear --targets documentStructure documentConfig
```

## Summary

The `clear` command is a tool for managing your project's state. Use the interactive mode for a guided process or specify targets directly for faster execution. As these actions are irreversible, ensure you have backed up any critical data before performing a cleanup.