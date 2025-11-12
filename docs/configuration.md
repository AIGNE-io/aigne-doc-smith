# Configuration

Proper configuration is fundamental to guiding AIGNE DocSmith in generating documents that align with your project's specific needs. This process involves defining project-level settings through a central configuration file and managing personal preferences to fine-tune the creation process.

This section provides an overview of how to configure the tool. For detailed, step-by-step instructions, please refer to the specific guides linked below.

<x-cards data-columns="2">
  <x-card data-title="Initial Setup" data-icon="lucide:settings-2" data-href="/configuration/initial-setup">
    Follow the interactive setup guide to create the main `config.yaml` file. This is the essential first step for any new document project.
  </x-card>
  <x-card data-title="Manage Preferences" data-icon="lucide:user-cog" data-href="/configuration/managing-preferences">
    Learn how to view, enable, disable, or delete personal preferences. These allow you to apply specific rules that can supplement the main project configuration.
  </x-card>
</x-cards>

## Understanding the `config.yaml` File

The `config.yaml` file serves as the primary source of instruction for your documents project. It is generated during the initial setup process and contains all the core directives that the AI uses to analyze your source code and generate content. A correctly configured file ensures that the output is tailored to your intended audience, purpose, and style.

Below is a breakdown of the key parameters you will find in the `config.yaml` file.

### Core Configuration Parameters

<x-field-group>
  <x-field data-name="projectName" data-type="string" data-required="true">
    <x-field-desc markdown>The official name of your project. This is used in titles and other metadata throughout the documents.</x-field-desc>
  </x-field>
  <x-field data-name="projectDesc" data-type="string" data-required="true">
    <x-field-desc markdown>A concise, one-sentence description of your project's purpose and functionality.</x-field-desc>
  </x-field>
  <x-field data-name="projectLogo" data-type="string" data-required="false">
    <x-field-desc markdown>A URL pointing to your project's logo image. This is used for branding the published document site.</x-field-desc>
  </x-field>
  <x-field data-name="thinking" data-type="object" data-required="false">
    <x-field-desc markdown>Configures the AI's reasoning effort.</x-field-desc>
    <x-field data-name="effort" data-type="string" data-default="standard" data-required="false">
      <x-field-desc markdown>Determines the depth of reasoning. Options are `lite` (fast, basic), `standard` (balanced), and `pro` (in-depth, slower).</x-field-desc>
    </x-field>
  </x-field>
  <x-field data-name="documentPurpose" data-type="array" data-required="true">
    <x-field-desc markdown>Defines the primary goals of the documents. Examples include `getStarted` for onboarding guides or `completeTasks` for procedural instructions.</x-field-desc>
  </x-field>
  <x-field data-name="targetAudienceTypes" data-type="array" data-required="true">
    <x-field-desc markdown>Specifies the intended readers. Examples include `endUsers` for non-technical individuals or `developers` for engineers.</x-field-desc>
  </x-field>
  <x-field data-name="readerKnowledgeLevel" data-type="string" data-required="true">
    <x-field-desc markdown>Describes the assumed technical knowledge of the target audience, such as `completeBeginners`.</x-field-desc>
  </x-field>
  <x-field data-name="documentationDepth" data-type="string" data-required="true">
    <x-field-desc markdown>Controls the level of detail in the generated content. Options range from `essentialOnly` to `comprehensive`.</x-field-desc>
  </x-field>
  <x-field data-name="rules" data-type="string" data-required="false">
    <x-field-desc markdown>A set of custom instructions or constraints for the AI to follow during content creation.</x-field-desc>
  </x-field>
  <x-field data-name="locale" data-type="string" data-required="true" data-default="en">
    <x-field-desc markdown>The primary language code for the documents, such as `en` for English.</x-field-desc>
  </x-field>
  <x-field data-name="translateLanguages" data-type="array" data-required="false">
    <x-field-desc markdown>A list of language codes into which the documents should be translated, for example, `zh` (Chinese) or `ja` (Japanese).</x-field-desc>
  </x-field>
  <x-field data-name="docsDir" data-type="string" data-required="true">
    <x-field-desc markdown>The local directory path where the created document files will be saved.</x-field-desc>
  </x-field>
  <x-field data-name="sourcesPath" data-type="array" data-required="true">
    <x-field-desc markdown>A list of source files, directories, or glob patterns that the tool should analyze to generate documents.</x-field-desc>
  </x-field>
  <x-field data-name="media" data-type="object" data-required="false">
    <x-field-desc markdown>Settings for media file processing.</x-field-desc>
    <x-field data-name="minImageWidth" data-type="number" data-default="800" data-required="false">
      <x-field-desc markdown>Only images wider than this value in pixels will be used in page creation.</x-field-desc>
    </x-field>
  </x-field>
</x-field-group>

## Summary

A well-defined configuration is essential for producing accurate, relevant, and effective documents. By completing the initial setup and understanding the `config.yaml` file, you establish a solid foundation for all document tasks.

To proceed with configuring your project, please refer to the following guides:

*   **[Initial Setup](./configuration-initial-setup.md)**: Create your project's `config.yaml` file.
*   **[Manage Preferences](./configuration-managing-preferences.md)**: Customize the tool's behavior with personal rules.
