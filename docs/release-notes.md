# Release Notes

Stay up-to-date with the latest developments for AIGNE DocSmith. This page provides a chronological record of new features, performance improvements, and bug fixes for each version of the tool.

## Version 0.9.0-beta (2025-11-11)

This is a maintenance release focused on general stability and performance improvements.

## Version 0.8.16-beta.1 (2025-11-11)

### New Features

- **Document Icon Generation**: Added the capability to automatically generate icons for documents.
- **Auto-Open Evaluation Reports**: Evaluation reports can now be configured to open automatically after being generated.

### Bug Fixes

- **Improved Prompts**: Fine-tuned internal prompts to generate more expressive and detailed documents.

## Version 0.8.16-beta (2025-11-10)

### New Features

- **Enhanced Interactive Mode**: The interactive mode agent now utilizes the AIGNE File System (AFS) to access your project's context, leading to more accurate and relevant assistance.
- **Title Streamlining**: Implemented a function to automatically streamline and standardize document titles.

### Bug Fixes

- **Model Update**: The chat model has been updated from a custom hub to the official `google/gemini-2.5-pro` for improved performance.

## Version 0.8.15 (2025-11-07)

This version includes general maintenance and stability improvements.

## Version 0.8.15-beta.16 (2025-11-07)

### New Features

- **Customizable Diagram Generation**: You can now specify the number of diagrams to be generated for your documents.

## Version 0.8.15-beta.15 (2025-11-07)

### Bug Fixes

- **Configuration System**: Added a two-tier configuration system for managing the AI's "thinking effort," allowing for more granular control over creation quality and speed.

## Version 0.8.15-beta.14 (2025-11-06)

### New Features

- **Reasoning Effort Configuration**: Introduced a setting to adjust the AI model's reasoning effort, providing customizable control over the depth of analysis.
- **Enhanced Publishing Authentication**: The publishing process now provides short-link responses and more detailed error reporting for authentication issues.

### Bug Fixes

- **Configuration Compatibility**: Ensured that existing configurations use a default reasoning effort to maintain compatibility.

## Version 0.8.15-beta.13 (2025-11-05)

### Bug Fixes

- **Publishing Stability**: Improved the stability and smoothness of the paid deployment process.
- **Validation and Viewing**: The tool now validates the document directory during initialization and ensures the latest version is displayed after publishing.

## Version 0.8.15-beta.12 (2025-11-05)

### New Features

- **Optimized Updates**: Reduced token consumption during document updates by implementing intent analysis to identify necessary changes more efficiently.

## Version 0.8.15-beta.11 (2025-11-04)

### New Features

- **Improved Warnings**: The tool now warns users about invalid source files and provides clearer messages during translation.

### Bug Fixes

- **Efficient Diagram Generation**: Prevented the creation of unnecessary diagrams.
- **Structure Generation**: Improved the process of generating the document structure by iterating through data source chunks more effectively.

## Version 0.8.11 (2025-10-05)

This version includes general maintenance and stability improvements.

## Version 0.8.10 (2025-09-20)

This version includes general maintenance and stability improvements.

## Version 0.8.9 (2025-09-15)

### Bug Fixes

- **Diagram Theme**: Updated the theme color for D2 diagrams to improve visual consistency.

## Version 0.8.8 (2025-09-13)

### Bug Fixes

- **UI Text**: Optimized the text for inquiry feedback prompts to be clearer and more helpful.

## Version 0.8.7 (2025-09-12)

### New Features

- **API Parameter Fields**: Added support for defining API parameters using the `<x-field>` custom component for more structured API documents.

## Version 0.8.6 (2025-09-11)

### New Features

- **Publish URL Display**: The document URL is now displayed by default after a successful publishing process.

### Bug Fixes

- **Deployment Logs**: Ensured that logs are saved correctly during deployment to prevent data loss.

## Version 0.8.5 (2025-09-10)

### New Features

- **Enterprise Publishing**: Added support for publishing documents to enterprise spaces.

## Version 0.8.4 (2025-09-09)

### Bug Fixes

- **Code Block Parsing**: Markdown code blocks are now parsed into a custom element that supports enhanced attributes like titles and icons.
- **Diagram Background**: Made the background for D2 diagrams transparent for better integration with different themes.

## Version 0.8.3 (2025-09-05)

### Bug Fixes

- **Image Dimensions**: Added automatic dimension detection for local images to ensure they are displayed correctly without manual configuration.

## Version 0.8.1 (2025-09-03)

### New Features

- **Improved D2 Charts**: Enhanced D2 chart creation with more comprehensive internal examples to improve the quality and accuracy of visual outputs.

## Version 0.8.0 (2025-09-03)

### New Features

- **Custom Component Guidelines**: Updated the guidelines for custom components with new formatting restrictions to ensure proper rendering.

## Version 0.7.1 (2025-08-31)

### Bug Fixes

- **Path Selection**: Fixed a bug where using the Tab key for path selection in the command-line interface did not work as expected.

## Version 0.7.0 (2025-08-30)

### New Features

- **Interactive Mode**: Added interactive mode for generating and managing documents interactively. See the [Interactive Mode](./guides-interactive-chat.md) guide for more details.
- **D2 Chart Support**: Introduced support for D2 charts in the document creation and publishing workflow.
- **Custom Components**: Enabled support for custom components and more robust configuration handling.

## Version 0.6.0 (2025-08-27)

### New Features

- **Media Processing**: Implemented support for media file processing before publishing documents, ensuring images and other assets are handled correctly.

## Version 0.5.0 (2025-08-26)

### New Features

- **Persistent Preferences**: User feedback can now be saved as persistent preferences for future sessions. Learn more in our [Managing Preferences](./configuration-managing-preferences.md) guide.

### Bug Fixes

- **Setup Questions**: Polished the text of questions asked during the initial setup process for clarity.

## Version 0.4.0 (2025-08-20)

### New Features

- **Localize Command**: Introduced a new `localize` command for translating documents into multiple languages. See the [Localize Document](./guides-translating-documentation.md) guide to get started.

## Version 0.3.0 (2025-08-19)

### New Features

- **Context Collection**: Refined the workflow for collecting context during document creation, leading to more relevant output.

## Version 0.2.0 (2025-08-05)

### New Features

- **Automatic Configuration**: The tool will now automatically initialize the configuration if it is missing when a command is run.
- **Update Command**: Added a new `update` command to refresh documents when source files have changed. You can find more information in the [Update Document](./guides-updating-documentation.md) guide.
