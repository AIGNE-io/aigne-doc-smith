# Configuration Reference

The `config.yaml` file is the core control panel for your documentation generation. By adjusting its settings, you can control how AI generates documentation, including document structure, content style, and language support. This guide provides detailed explanations for each configuration field to help you fine-tune according to your project needs.

## Overview

The `config.yaml` file is the primary configuration file for AIGNE DocSmith. It stores all configuration parameters in YAML format. When you run commands such as `create`, `update`, or `translate`, DocSmith reads this file to understand your configuration requirements.

- **File name:** `config.yaml`
- **Location:** `.aigne/doc-smith/config.yaml` (relative to your project root)
- **Format:** YAML (UTF-8)

Through this file, you can set documentation goals, target readers, content generation rules, document structure, multilingual support, and publishing settings.

### Creating and Updating Configuration

The `config.yaml` file is automatically created when you first use DocSmith.

**Creating:**

You can create this file in two ways:

1. **During initial generation:** Running `aigne doc create` in a new project will launch an interactive wizard to create the `config.yaml` file before starting the generation process.
2. **Create separately:** Running `aigne doc init` will launch the same wizard to create the configuration file without immediately generating documentation.

```sh aigne doc init icon=lucide:terminal
aigne doc init
```

**Updating:**

You can update your configuration using one of the following methods:

1. **Edit the file directly:** Open `.aigne/doc-smith/config.yaml` in a text editor and modify the fields.
2. **Use the interactive wizard:** Run `aigne doc init` again. The wizard will load your existing settings and guide you through updates.

## Configuration Parameters

Fields in `config.yaml` are organized by functional groups. The following sections explain each parameter in detail.

### Project Basics

These fields define basic project information used for document branding, search engine optimization, and social media sharing.

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>The display name of your project, which appears in document titles, navigation bars, and other branding elements. It is recommended to keep it under 50 characters to ensure it displays completely in various interfaces.</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>A brief description of your project, used for search engine optimization and social sharing preview text. It is recommended to keep it under 150 characters, clearly and concisely describing the core value of your project.</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>The URL or local file path to your project logo. The logo will be displayed in document website headers, browser tab icons, and social media sharing previews. Supports full URLs (e.g., `https://example.com/logo.png`) or relative paths (e.g., `./assets/logo.png`).</x-field-desc>
  </x-field>
</x-field-group>

### AI Thinking Configuration

These settings control the depth of AI thinking and processing intensity when generating document content, affecting the balance between generation quality and speed.

<x-field-group>
  <x-field data-name="thinking" data-type="object" data-required="false">
    <x-field-desc markdown>Configure AI reasoning intensity.</x-field-desc>
    <x-field data-name="effort" data-type="string" data-default="standard" data-required="false">
      <x-field-desc markdown>Control AI thinking intensity. Options: `lite` (fast mode, suitable for simple documentation), `standard` (standard mode, recommended for most scenarios), `pro` (deep mode, suitable for complex documentation but with longer generation times).</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### Documentation Strategy

These settings define documentation generation strategy, including document goals, reader types, content depth, etc., directly affecting how AI organizes and generates content.

<x-field-group>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>Define the primary goals of the documentation (multiple selection allowed). Options include: `getStarted` (quick start guide), `completeTasks` (task operation manual), `findAnswers` (reference query manual), `understandSystem` (system understanding documentation), `solveProblems` (troubleshooting guide), and `mixedPurpose` (comprehensive documentation). Choosing different goals affects document structure and content organization.</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>Specify target reader types (multiple selection allowed). Options include: `endUsers` (general users), `developers` (developers), `devops` (operations engineers), `decisionMakers` (technical decision makers), `supportTeams` (technical support teams), and `mixedTechnical` (mixed technical backgrounds). Choosing different reader types affects document language style, technical depth, and example types.</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>Set the technical knowledge level of target readers. Options include: `completeBeginners` (complete novices, need detailed explanations), `domainFamiliar` (familiar with related domains but first-time users of this tool), `experiencedUsers` (experienced users, need reference manuals), `emergencyTroubleshooting` (emergency troubleshooting, need quick solutions), and `exploringEvaluating` (evaluating suitability, need quick understanding).</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>Control the level of detail in documentation. Options include: `essentialOnly` (core features only, concise version), `balancedCoverage` (balanced coverage, recommended for most projects), `comprehensive` (comprehensive coverage, including all features and edge cases), and `aiDecide` (automatically decided by AI based on code complexity).</x-field-desc>
  </x-field>
  <x-field data-name="targetAudience" data-type="string" data-required="false">
    <x-field-desc markdown>A detailed description of target readers, used to supplement `targetAudienceTypes` settings. Can describe readers' specific backgrounds, use cases, tech stacks, or special requirements. Supports multi-line text, helping AI better understand reader needs.</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>Provide detailed generation rules and guidance for AI, including content structure, writing style, format requirements, etc. This is one of the most important configuration fields, directly affecting the quality and style of generated documentation. Supports Markdown format, allowing multi-line rules. It is recommended to specify your specific requirements in detail, such as: "avoid using vague words", "must include code examples", etc.</x-field-desc>
  </x-field>
</x-field-group>

### Language

Configure the primary language and any additional languages for translation.

<x-field-group>
  <x-field data-name="locale" data-type="string" data-default="en" data-required="false">
    <x-field-desc markdown>The primary language of the documentation, using standard language codes. Common values include: `en` (English), `zh` (Simplified Chinese), `zh-TW` (Traditional Chinese), `ja` (Japanese), etc. Documentation will first be generated in this language, then can be translated to other languages.</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>A list of target languages for translation (multiple selection allowed). Each language code will generate a complete set of translated documentation. For example, setting `["zh", "ja"]` will generate Simplified Chinese and Japanese versions of the documentation. Note: Do not include language codes that are the same as `locale`.</x-field-desc>
  </x-field>
</x-field-group>

### Data Sources

These settings specify the reference materials used by AI when analyzing source code and documentation, directly affecting the quality and accuracy of generated documentation.

<x-field-group>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>A list of source code and documentation paths for AI analysis. **This is the most important configuration field** because AI will only generate documentation based on content in these paths. It is recommended to include: README files, main source code directories, configuration files (such as `package.json`, `aigne.yaml`), existing documentation directories, etc. Supports multiple formats: directory paths (e.g., `./src`), file paths (e.g., `./README.md`), glob patterns (e.g., `src/**/*.js`), and remote URLs.</x-field-desc>
  </x-field>
</x-field-group>

### Output and Deployment

Configure the save location for generated documentation and the publishing address.

<x-field-group>
  <x-field data-name="docsDir" data-type="string" data-default="./aigne/doc-smith/docs" data-required="false">
    <x-field-desc markdown>The directory where generated documentation is saved. All generated Markdown files will be saved in this directory. If the directory does not exist, DocSmith will automatically create it. It is recommended to use relative paths for easier project migration.</x-field-desc>
  </x-field>
  <x-field data-name="appUrl" data-type="string" data-required="false">
    <x-field-desc markdown>The access address after documentation is published. After running the `publish` command, DocSmith will automatically update this field. Usually does not need to be set manually unless you want to specify a particular publishing address.</x-field-desc>
  </x-field>
</x-field-group>

### Media and Display

These settings control how media assets such as images are handled.

<x-field-group>
  <x-field data-name="media" data-type="object" data-required="false">
    <x-field-desc markdown>Media file processing settings.</x-field-desc>
    <x-field data-name="minImageWidth" data-type="integer" data-default="800" data-required="false">
      <x-field-desc markdown>Minimum width (in pixels) for images to be included in documentation. Only images wider than this value will be used, helping to filter out low-quality or too-small images. Recommended values: 600-800 pixels (balance quality and quantity), 800-1000 pixels (high-quality requirements).</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### Diagramming Configuration

Control diagram generation behavior and AI effort level.

<x-field-group>
  <x-field data-name="diagramming" data-type="object" data-required="false">
    <x-field-desc markdown>Diagram generation configuration.</x-field-desc>
    <x-field data-name="effort" data-type="integer" data-default="5" data-required="false">
      <x-field-desc markdown>AI effort level when generating diagrams, range 0-10. Higher values result in fewer diagrams. Recommended settings: 0-3 (generate many diagrams, suitable for documentation requiring rich visual explanations), 4-6 (balanced mode, recommended), 7-10 (generate few diagrams, focus more on text content).</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

### System-Managed Fields

These fields are automatically managed by DocSmith and generally do not require manual editing. Modifying these fields may cause unexpected issues.

<x-field-group>
  <x-field data-name="lastGitHead" data-type="string" data-required="false">
    <x-field-desc markdown>The Git commit hash from the last documentation generation. DocSmith uses this value to determine which files have changed, enabling incremental updates. **Do not modify manually**.</x-field-desc>
  </x-field>
  <x-field data-name="boardId" data-type="string" data-required="false">
    <x-field-desc markdown>The unique identifier for the documentation publishing board, automatically generated by the system. **Do not modify manually**, otherwise it will disconnect the project from its publishing history and may lose published documentation.</x-field-desc>
  </x-field>
  <x-field data-name="checkoutId" data-type="string" data-required="false">
    <x-field-desc markdown>A temporary identifier used during document deployment, automatically managed by the system. **Do not modify manually**.</x-field-desc>
  </x-field>
  <x-field data-name="shouldSyncBranding" data-type="string" data-required="false">
    <x-field-desc markdown>A temporary variable controlling whether to sync branding, automatically managed by the system. **Do not modify manually**.</x-field-desc>
  </x-field>
</x-field-group>

## Applying Changes

After modifying the `config.yaml` file, you need to run the corresponding commands for the changes to take effect. Different fields require different commands, as shown in the table below.

| Field | Command to Apply Changes | Description |
| :-------------------------------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------ |
| `documentPurpose`, `targetAudienceTypes`, `readerKnowledgeLevel`, `documentationDepth`, `locale` | `aigne doc clear && aigne doc create` | These fields affect the overall document structure and require clearing old documentation and regenerating. |
| `rules`, `targetAudience`, `media.minImageWidth`, `thinking.effort`, `diagramming.effort` | `aigne doc update` | These fields only affect content generation methods and can directly update existing documentation without regeneration. |
| `sourcesPath` | `aigne doc clear && aigne doc create` or `aigne doc update` | After adding new data sources, you can choose to fully regenerate or incrementally update. It is recommended to use `create` when adding for the first time, and `update` for subsequent additions. |
| `translateLanguages` | `aigne doc translate` | After adding new translation languages, run this command to generate documentation versions in the corresponding languages. |
| `projectName`, `projectDesc`, `projectLogo`, `appUrl` | `aigne doc publish` | These fields are mainly used for metadata during publishing. After modification, republish to take effect. |
| `docsDir` | `aigne doc create` | After modifying the output directory, the next documentation generation will save to the new directory. |

## Complete Configuration Example

Below is the complete `config.yaml` file from the AIGNE DocSmith project itself, demonstrating a real-world configuration.

```yaml config.yaml
# Project information for documentation publishing
projectName: AIGNE DocSmith
projectDesc: AIGNE DocSmith is a powerful, AI-driven documentation creation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.
projectLogo: https://docsmith.aigne.io/image-bin/uploads/9645caf64b4232699982c4d940b03b90.svg

# =============================================================================
# Documentation Configuration
# =============================================================================

# Purpose: What's the main outcome you want readers to achieve?
documentPurpose:
  - getStarted
  - completeTasks

# Target Audience: Who will be reading this most often?
targetAudienceTypes:
  - endUsers

# Reader Knowledge Level: What do readers typically know when they arrive?
readerKnowledgeLevel: completeBeginners

# Documentation Depth: How comprehensive should the documentation be?
documentationDepth: comprehensive

# Custom Rules: Define specific documentation generation rules and requirements
rules: |
  Avoid using vague or empty words that don't provide measurable or specific details, such as 'intelligently', 'seamlessly', 'comprehensive', or 'high-quality'. Focus on concrete, verifiable facts and information.
  Focus on concrete, verifiable facts and information.
  Must cover all subcommands of DocSmith

# Target Audience: Describe your specific target audience and their characteristics
targetAudience: |

locale: en
translateLanguages:
  - zh
  - zh-TW
  - ja
docsDir: .aigne/doc-smith/docs
sourcesPath:
  - ./README.md
  - ./CHANGELOG.md
  - ./aigne.yaml
  - ./agents
  - ./.aigne/doc-smith/config.yaml
  - ./assets/screenshots
lastGitHead: d9d2584f23aee352485f369f60142949db601283
# ⚠️ Warning: boardId is auto-generated by system, please do not edit manually
boardId: "docsmith"
appUrl: https://docsmith.aigne.io
# Checkout ID for document deployment service
checkoutId: ""

diagramming:
  effort: 5 # AI effort level for diagramming, 0-10, large is less diagram
# AI Thinking Configuration
# thinking.effort: Determines the depth of reasoning and cognitive effort the AI uses when responding, available options:
#   - lite: Fast responses with basic reasoning
#   - standard: Balanced speed and reasoning capability
#   - pro: In-depth reasoning with longer response times
thinking:
  effort: standard
# Should sync branding for documentation
shouldSyncBranding: ""
```

## Summary

The `config.yaml` file is the core of controlling documentation generation. By properly configuring project information, documentation strategy, and data sources, you can guide AI to generate high-quality documentation that meets your project needs. It is recommended to start with basic configuration and gradually adjust parameters based on actual results.
