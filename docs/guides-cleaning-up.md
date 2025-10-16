# Cleaning Up

This guide provides instructions on how to use the `aigne doc clear` command to remove generated files, configurations, and cached data from your project. This command is useful for starting fresh or removing sensitive information.

The `clear` command can be run in two modes: interactive and non-interactive. Running it without any arguments will launch an interactive wizard that guides you through the available cleanup options.

```d2
direction: down

User: {
  shape: c4-person
}

Command-Execution: {
  label: "Command Execution"
  shape: rectangle

  CLI: {
    label: "`aigne doc clear [targets]`"
  }

  Decision: {
    label: "Arguments\nProvided?"
    shape: diamond
  }

  Interactive-Wizard: {
    label: "Interactive Wizard\n(Checklist of targets)"
  }
}

Cleanup-Targets: {
  label: "Cleanup Targets"
  shape: rectangle
  grid-columns: 3

  generatedDocs: {}
  documentStructure: {}
  documentConfig: {}
  authTokens: {}
  deploymentConfig: {}
  mediaDescription: {}
}

Project-Artifacts: {
  label: "Project Artifacts"
  shape: rectangle
  grid-columns: 3

  docs: {
    label: "./docs"
  }
  structure-plan: {
    label: "structure-plan.json"
  }
  config-yaml: {
    label: "config.yaml"
  }
  auth-config: {
    label: "~/.aigne/doc-smith-connected.yaml"
  }
  media-cache: {
    label: "Media Description\nCache"
  }
}

User -> Command-Execution.CLI

Command-Execution.CLI -> Command-Execution.Decision

Command-Execution.Decision -> Command-Execution.Interactive-Wizard: "No"
Command-Execution.Decision -> Cleanup-Targets: "Yes"

Command-Execution.Interactive-Wizard -> Cleanup-Targets: "User Selects"

Cleanup-Targets.generatedDocs -> Project-Artifacts.docs: "Deletes"
Cleanup-Targets.documentStructure -> Project-Artifacts.docs: "Deletes"
Cleanup-Targets.documentStructure -> Project-Artifacts.structure-plan: "Deletes"
Cleanup-Targets.documentConfig -> Project-Artifacts.config-yaml: "Deletes"
Cleanup-Targets.authTokens -> Project-Artifacts.auth-config: "Deletes"
Cleanup-Targets.deploymentConfig -> Project-Artifacts.config-yaml: "Removes appUrl"
Cleanup-Targets.mediaDescription -> Project-Artifacts.media-cache: "Deletes"
```

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