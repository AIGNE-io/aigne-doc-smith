# Cleanup Workspace

Need to reset your project or remove sensitive data? This guide explains how to use the `aigne doc clear` command to safely remove generated files, configuration settings, and cached information, helping you maintain a clean and organized workspace.

The `clear` command offers two modes: an interactive wizard for guided cleanup and a non-interactive mode for quick, specific actions.

## Command Usage

To begin the cleanup process, execute the following command in your project's root directory:

```sh aigne doc clear icon=lucide:trash-2
aigne doc clear
```

Running the command without any arguments starts an interactive wizard, which will prompt you to select the items you wish to remove.

For faster, non-interactive cleanup, you can specify one or more targets directly using the `--targets` flag.

```sh aigne doc clear --targets generatedDocs icon=lucide:trash-2
aigne doc clear --targets <target1> <target2>
```

## Cleanup Options

The interactive wizard presents a checklist of items you can remove. The table below details each available option, which can also be used as a target in non-interactive mode.

| Target | Description |
| :--- | :--- |
| **`generatedDocs`** | Allows you to select and delete specific generated documents from your output directory (e.g., `./docs`). The overall document structure is preserved. |
| **`documentStructure`** | Deletes all generated document files and the structure plan file (e.g., `.aigne/doc-smith/output/structure-plan.json`). |
| **`documentConfig`** | Removes the main project configuration file (e.g., `.aigne/doc-smith/config.yaml`). After deleting it, you will need to run `aigne doc init` to create a new one. |
| **`authTokens`** | Deletes saved authorization credentials used for publishing (e.g., from `~/.aigne/doc-smith-connected.yaml`). You will be prompted to select which site authorizations to clear. |
| **`deploymentConfig`** | Removes only the `appUrl` key from your project's configuration file, leaving all other settings intact. |
| **`mediaDescription`** | Deletes the cache of AI-generated descriptions for your project's media files (e.g., `.aigne/doc-smith/media-description.yaml`). These will be automatically regenerated the next time they are needed. |

## Examples

### Interactive Cleanup

For a guided experience, run the command without any arguments. You will be presented with a checklist. Use the arrow keys to navigate, the spacebar to select or deselect items, and the Enter key to confirm your selections and proceed with the cleanup.

```sh aigne doc clear icon=lucide:mouse-pointer-click
aigne doc clear
```

### Non-Interactive Cleanup

To clear specific items without prompts, use the `--targets` flag followed by the names of the targets you wish to remove.

#### Clear Created Documents Only

This command deletes the created document files but preserves the `structure-plan.json` file, allowing you to regenerate the content later.

```sh aigne doc clear --targets generatedDocs icon=lucide:file-minus
aigne doc clear --targets generatedDocs
```

#### Clear Structure and Configuration

This command performs a more thorough cleanup by removing all created documents, the structure plan, and the main configuration file.

```sh aigne doc clear --targets documentStructure documentConfig icon=lucide:files
aigne doc clear --targets documentStructure documentConfig
```

## Summary

The `clear` command provides a straightforward method for managing your project's created assets and configuration. Use the interactive mode for a safe, guided process or specify targets directly for automated workflows. Since these actions permanently delete files, it is advisable to back up any important data before proceeding.
