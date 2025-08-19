---
labels: ["Reference"]
---

# Configuration Guide

The power of AIGNE DocSmith lies in its high configurability. By adjusting the configuration, you can precisely control how documentation is generated to meet specific project needs, match the background of the target audience, and define the style and depth of the documents.

All configurations are centralized in a file named `config.yaml`, typically located in the `.aigne/doc-smith/` directory. You can easily generate and modify this file through an interactive Q&A process by running the `aigne doc init` command.

![Answer questions to complete project setup](https://www.aigne.io/image-bin/uploads/f797b970e1b138219f41f1614e83c680.png)

Below, we will delve into the core configuration options in the `config.yaml` file to help you better customize the documentation generation process.

## Core Configuration Options

### 1. Document Purpose (documentPurpose)

This option defines the primary goal you want readers to achieve through the documentation. Different purposes will affect the content focus and structure of the documents.

| Option | Name | Description |
|---|---|---|
| `getStarted` | Get Started | Helps new users go from zero to a successful run within 30 minutes. |
| `completeTasks` | Complete Specific Tasks | Guides users through common workflows and use cases. |
| `findAnswers` | Find Answers Quickly | Provides a searchable reference for all features and APIs. |
| `understandSystem` | Understand the System | Explains how the system works and its design decisions. |
| `solveProblems` | Solve Problems | Helps users troubleshoot and fix issues they encounter. |
| `mixedPurpose` | Mixed Purpose | Comprehensive documentation covering multiple needs. |

### 2. Target Audience (targetAudienceTypes)

Defining the primary reader group for the documentation helps the AI generate content that better fits their technical background and reading habits.

| Option | Name | Description |
|---|---|---|
| `endUsers` | End Users (Non-technical) | People who use the product but do not write code. |
| `developers` | Integration Developers | Engineers who integrate this project into their own projects. |
| `devops` | DevOps/Infrastructure Engineers | Teams responsible for deploying, monitoring, and maintaining the system. |
| `decisionMakers` | Technical Decision-Makers | Architects or tech leads who evaluate or plan implementation. |
| `supportTeams` | Support Teams | Technical support staff who help others use the product. |
| `mixedTechnical` | Mixed Technical Audience | A mix of developers, DevOps, and other technical users. |

### 3. Reader Knowledge Level (readerKnowledgeLevel)

This setting informs the AI about the reader's existing knowledge level when reading the documentation, allowing it to adjust the content's depth and the extent of terminological explanations.

| Option | Name | Description |
|---|---|---|
| `completeBeginners` | Complete Beginners | Completely new to the domain or technology. |
| `domainFamiliar` | Familiar with Domain, New to Tool | Understands the problem domain but is unfamiliar with the current solution. |
| `experiencedUsers` | Experienced Users | Regular users who need reference material or advanced topics. |
| `emergencyTroubleshooting` | Emergency Troubleshooting | Encountering an issue and need a quick solution. |
| `exploringEvaluating` | Exploring/Evaluating | Trying to understand if this solution meets their needs. |

### 4. Documentation Depth (documentationDepth)

This option determines the comprehensiveness of the documentation content, ranging from covering only core features to providing exhaustive explanations including all edge cases.

| Option | Name | Description |
|---|---|---|
| `essentialOnly` | Essentials Only | Covers 80% of use cases, keeping it concise. |
| `balancedCoverage` | Balanced Coverage | Provides good depth and practical examples [Recommended]. |
| `comprehensive` | Comprehensive | Covers all features, edge cases, and advanced scenarios. |
| `aiDecide` | AI Decides | Analyzes code complexity and suggests an appropriate depth. |

### 5. Language and Path Settings

- **`locale`**: Sets the primary language of the documentation, e.g., `en` for English, `zh` for Simplified Chinese.
- **`translateLanguages`**: A list that defines other languages into which the documentation should be translated.
- **`docsDir`**: Specifies the directory where the generated documentation will be stored.
- **`sourcesPath`**: Specifies the path to the source code files or directories that the AI needs to analyze to generate documentation.

---

## Dive Deeper

For more detailed configuration of your documentation generation process, please refer to the following guides:

- **[AI Model Providers](./configuration-llm-providers.md)**: Learn how to configure different Large Language Model (LLM) providers, including the API-key-free AIGNE Hub.
- **[Supported Languages](./configuration-supported-languages.md)**: View the list of all languages that DocSmith supports for automatic translation and learn how to enable multilingual support for your documentation.

Now that you understand the core configuration options of DocSmith. Once configured, you can proceed to **[Generate Docs](./core-features-generate-docs.md)** to learn how to apply these settings to create your first document.