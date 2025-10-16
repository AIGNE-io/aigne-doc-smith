# Cleaning Up

The `aigne doc clear` command provides a systematic method for removing generated files, cached data, and configuration settings from your project. This is a practical step when you need to reset the documentation workspace, start from a clean state, or resolve issues that may be caused by outdated files.

## Interactive Cleaning

For controlled and precise cleanup, running the command without any arguments is the recommended procedure.

```bash
aigne doc clear
```

This action initiates an interactive prompt, which lists all available cleanup options. Each option is presented with a clear description of what it does, allowing you to select the exact items for removal. This interactive method prevents the accidental deletion of important data.

## Cleanup Options

The `clear` command can remove several distinct types of data. The following table provides a detailed breakdown of each available option, its function, and the specific files or directories it affects.

| Option | Description | Files and Directories Affected |
| :--- | :--- | :--- |
| `generatedDocs` | Deletes all generated documents located in the output directory. The documentation structure plan is preserved. | The directory specified by `docsDir` in your configuration. |
| `documentStructure` | Deletes all generated documents and the documentation structure plan. This action resets all documentation content. | The `.aigne/doc-smith/output/structure-plan.json` file and the `docsDir` directory. |
| `documentConfig` | Deletes the project's configuration file. After this action, `aigne doc init` must be run to create a new configuration. | The `.aigne/doc-smith/config.yaml` file. |
| `authTokens` | Removes saved authorization tokens for publishing sites. You will be prompted to select which site authorizations to clear. | The `~/.aigne/doc-smith-connected.yaml` file located in your home directory. |
| `deploymentConfig` | Removes only the `appUrl` setting from your configuration file, leaving other settings intact. | The `.aigne/doc-smith/config.yaml` file. |
| `mediaDescription` | Deletes the cached, AI-generated descriptions for your media files. These will be regenerated during the next documentation build. | The `.aigne/doc-smith/cache/media-description.json` file. |

## Non-Interactive Cleaning

For use in automated scripts or for users who prefer direct command-line operations, you can specify one or more cleanup targets using the `--targets` flag. This bypasses the interactive prompt and executes the cleanup immediately.

### Clear a Single Option

To remove only the generated documents, execute the following command:

```bash
aigne doc clear --targets generatedDocs
```

### Clear Multiple Options

You can provide a space-separated list of target names to remove several items at once. For instance, to delete both the document configuration and the documentation structure, run the command below:

```bash
aigne doc clear --targets documentConfig documentStructure
```

After clearing the configuration, you can begin a new setup process.

---

For detailed instructions on creating a new configuration, please refer to the [Initial Setup](./configuration-initial-setup.md) guide.