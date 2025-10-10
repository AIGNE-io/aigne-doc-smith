# Release Notes

This document provides a summary of new features, improvements, and bug fixes for each version of the tool. All changes are listed in reverse chronological order.

## Version 0.8.12-beta.3 (2025-10-09)

### Bug Fixes

- Resolved an issue where publishing to the cloud incorrectly required administrator permissions.

## Version 0.8.12-beta.2 (2025-10-09)

### Bug Fixes

- Corrected an error with file paths when updating documents.
- Fixed a problem that could cause document generation and updates to fail.

## Version 0.8.12-beta.1 (2025-10-08)

### New Features

- Introduced history tracking, allowing you to view past changes to your documents.
- Translation is now an optional step during the document update process, providing more flexibility.

### Improvements

- The document generation and update process has been refined for better reliability.

## Version 0.8.12-beta (2025-10-07)

### Bug Fixes

- The internal file reading tool now correctly supports relative paths.

## Version 0.8.11 (2025-10-05)

This version includes general maintenance and stability improvements.

## Version 0.8.11-beta.7 (2025-10-03)

### New Features

- Enhanced the document generator and updater for better performance.
- Improved the speed of document structure analysis and content refinement by using a shared context.

### Bug Fixes

- Updated internal documentation and refined prompts for custom components to improve accuracy.

## Version 0.8.11-beta.5 (2025-10-01)

### New Features

- Added support for user role requirements for publishing and custom rule configurations.
- Separated D2 diagram generation into an independent tool for more focused functionality.

## Version 0.8.11-beta.4 (2025-09-30)

### New Features

- Added a "check-only" option for agents that use selection inputs.

### Bug Fixes

- Improved error handling in the document selection utility.
- Tuned the translation prompt; comments within code blocks are now translated correctly.

## Version 0.8.11-beta.3 (2025-09-29)

### Bug Fixes

- Added a command-line entry for the evaluation agents.

## Version 0.8.11-beta.2 (2025-09-27)

### Bug Fixes

- Resolved dependency conflicts to ensure smoother operation.

## Version 0.8.11-beta.1 (2025-09-27)

### New Features

- Introduced a document evaluation feature to generate quality reports.
- Enhanced the document and structure update process with improved tools.
- Improved vendor handling and debugging capabilities during the publishing process.

### Bug Fixes

- Fixed an issue where component descriptions were treated as attributes instead of text, improving custom component rendering.

## Version 0.8.10 (2025-09-20)

This version includes general maintenance and stability improvements.

## Version 0.8.10-beta.3 (2025-09-19)

### Bug Fixes

- Added links related to enterprise deployment.
- Polished the copywriting for the document review prompt.

## Version 0.8.10-beta.2 (2025-09-18)

### Bug Fixes

- Improved the prompts and display for the documentation structure review.
- Updated the usage rules for field elements to ensure correct rendering.

## Version 0.8.10-beta.1 (2025-09-18)

### New Features

- Added a workflow to review the documentation structure before generation.

### Bug Fixes

- Improved the consistency and clarity of English-language text in the user interface.
- Updated the DocSmith logo.

## Version 0.8.9 (2025-09-15)

### Bug Fixes

- Updated the theme color for D2 diagrams for better visual consistency.

## Version 0.8.8 (2025-09-13)

### Bug Fixes

- Optimized the copy for inquiry feedback to be clearer and more helpful.

## Version 0.8.7 (2025-09-12)

### New Features

- Added support for defining API parameters using the `<x-field>` custom component.

## Version 0.8.6 (2025-09-11)

### New Features

- The URL is now displayed by default after a successful publishing process.

### Bug Fixes

- Ensured that logs are saved correctly during the deployment process to prevent data loss.

## Version 0.8.5 (2025-09-10)

### New Features

- Added support for publishing documents to enterprise spaces.

## Version 0.8.4 (2025-09-09)

### Bug Fixes

- Markdown code blocks are now parsed into a custom `<x-code>` element with support for enhanced attributes like titles and icons.
- Made the background for D2 diagrams transparent for better integration with different themes.

## Version 0.8.3 (2025-09-05)

### Bug Fixes

- Added automatic dimension detection for local images to ensure they are displayed correctly.

## Version 0.8.1 (2025-09-03)

### New Features

- Tuned the D2 chart generation with more comprehensive examples to improve output quality.

## Version 0.8.0 (2025-09-03)

### New Features

- Updated the guidelines for custom components with new formatting restrictions.

## Version 0.7.1 (2025-08-31)

### Bug Fixes

- Fixed a bug where using the tab key for path selection did not work as expected.

## Version 0.7.0 (2025-08-30)

### New Features

- Added an interactive chat mode for generating and managing documentation.
- Introduced support for D2 charts in the document generation and publishing workflow.
- Enabled support for custom components and more robust configuration handling.

## Version 0.6.0 (2025-08-27)

### New Features

- Implemented complete support for media processing before publishing documents.

## Version 0.5.0 (2025-08-26)

### New Features

- User feedback can now be saved as persistent preferences for future sessions.

### Bug Fixes

- Polished the text of the questions asked during the initial setup process.

## Version 0.4.4 (2025-08-22)

### Bug Fixes

- Added support for assigning a board ID during the publishing process.

## Version 0.4.1 (2025-08-21)

### Bug Fixes

- Added support for updating board information.

## Version 0.4.0 (2025-08-20)

### New Features

- Introduced a new `translate` command for translating documents.

## Version 0.3.0 (2025-08-19)

### New Features

- Polished the workflow for collecting context during document generation.

### Bug Fixes

- Optimized the help text for users running a self-hosted Discuss Kit instance.

## Version 0.2.11 (2025-08-15)

### Bug Fixes

- Switched the default language model to improve generation quality.

## Version 0.2.5 (2025-08-08)

### Bug Fixes

- Polished the command-line interface process for a smoother user experience.

## Version 0.2.0 (2025-08-05)

### New Features

- The tool will now automatically initialize the configuration if it's missing when a command is run.
- Added a new `update` command to refresh documents when source files have changed.