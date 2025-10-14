# Configuration

Proper configuration is fundamental to guiding the AIGNE DocSmith tool in generating documentation that aligns with your project's specific needs. This process involves defining project-level settings through a central configuration file and managing personal preferences for fine-tuning the generation process.

This section provides an overview of how to configure the tool. For detailed, step-by-step instructions, please refer to the specific guides linked below.

<x-cards data-columns="2">
  <x-card data-title="Initial Setup" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">
    Follow the interactive setup guide to create the main `config.yaml` file. This is the essential first step for any new documentation project.
  </x-card>
  <x-card data-title="Managing Preferences" data-icon="lucide:user-cog" data-href="/configuration/managing-preferences">
    Learn how to view, enable, disable, or delete personal preferences. These allow you to apply specific rules that can supplement the main project configuration.
  </x-card>
</x-cards>

## Understanding the `config.yaml` File

The `config.yaml` file serves as the primary source of truth for your documentation project. It is generated during the initial setup process and contains all the core directives that the AI uses to analyze your source code and generate content. A correctly configured file ensures that the output is tailored to your intended audience, purpose, and style.

Below is a breakdown of the key parameters you will find in the `config.yaml` file.

### Core Configuration Parameters

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>The official name of your project. This will be used in titles and other metadata throughout the documentation.</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>A concise, one-sentence description of your project's purpose and functionality.</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>A URL pointing to your project's logo image. This will be used for branding the published documentation site.</x-field-desc>
  </x-field>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>Defines the primary goals of the documentation. Examples include `getStarted` for onboarding guides or `completeTasks` for procedural instructions.</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>Specifies the intended readers. Examples include `endUsers` for non-technical individuals or `developers` for engineers.</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>Describes the assumed technical knowledge and background of the target audience, such as `completeBeginners`.</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>Controls the level of detail in the generated content. Options range from `essentialOnly` to `comprehensive`.</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>A set of custom instructions, guidelines, or constraints for the AI to follow during the content generation process.</x-field-desc>
  </x-field>
  <x-field data-name="locale" data-type="string" data-required="true">
    <x-field-desc markdown>The primary language code for the documentation, such as `en` for English.</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>A list of language codes into which the primary documentation should be translated, for example, `zh` (Chinese) or `ja` (Japanese).</x-field-desc>
  </x-field>
  <x-field data-name="docsDir" data-type="string" data-required="true">
    <x-field-desc markdown>The local directory path where the generated documentation files will be saved.</x-field-desc>
  </x-field>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>A list of source files, directories, or glob patterns that the tool should analyze to generate documentation.</x-field-desc>
  </x-field>
</x-field-group>

## Summary

A well-defined configuration is essential for producing accurate, relevant, and effective documentation. By completing the initial setup and understanding the `config.yaml` file, you establish a solid foundation for all documentation tasks.

To proceed with configuring your project, please refer to the following guides:
*   **[Initial Setup](./configuration-initial-setup.md)**: Create your project's `config.yaml` file.
*   **[Managing Preferences](./configuration-managing-preferences.md)**: Customize the tool's behavior with personal rules.