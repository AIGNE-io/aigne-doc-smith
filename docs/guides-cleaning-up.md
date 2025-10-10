# Cleaning Up

The `aigne doc clear` command provides a straightforward method for removing generated files, cached data, and configuration settings. This is useful when you want to reset your documentation project, start from a clean state, or troubleshoot issues related to outdated or corrupted files.

## Interactive Cleaning

The simplest way to use the command is to run it without any arguments:

```bash
aigne doc clear
```

Executing this command will launch an interactive prompt, allowing you to select precisely which items you want to remove. This is the recommended approach for most use cases as it provides clear descriptions for each option and prevents accidental data loss.

## Cleanup Targets

The `clear` command can remove several distinct types of data. The following table details each available target, what it does, and the specific files or directories it affects.

| Target | Description | Files and Directories Affected |
| :--- | :--- | :--- |
| **Generated Documents** | Deletes all Markdown files that were generated in your documentation output directory. | The directory specified by `docsDir` in your configuration. |
| **Documentation Structure** | Deletes the structure plan file and all generated documents. This effectively resets your documentation content. | The `.aigne/doc-smith/output/structure-plan.json` file and the `docsDir` directory. |
| **Document Configuration** | Deletes the project's configuration file. After running this, you will need to re-initialize the project. | The `.aigne/doc-smith/config.yaml` file. |
| **Authorizations** | Removes saved authorization tokens used for publishing your documentation. You will be prompted to select specific sites to clear. | The `~/.aigne/doc-smith-connected.yaml` file in your home directory. |

## Non-Interactive Cleaning

For automated scripts or users who prefer the command line, you can specify one or more targets to clear directly using the `--targets` flag. This will bypass the interactive prompt.

### Clear a Single Target

To clear only the generated documents, use the following command:

```bash
aigne doc clear --targets generatedDocs
```

### Clear Multiple Targets

You can provide multiple target names to clear several items at once. For example, to remove both the document configuration and the documentation structure, run:

```bash
aigne doc clear --targets documentConfig documentStructure
```

After clearing your configuration, you can start fresh by running the setup process again.

---

For more information on the initial setup, refer to the [Initial Setup](./configuration-initial-setup.md) guide.