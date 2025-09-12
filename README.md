[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-doc-smith?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-doc-smith)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-doc-smith?style=flat-square)](https://github.com/AIGNE-io/aigne-doc-smith/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-doc-smith/graph/badge.svg?token=95TQO2NKYC)](https://codecov.io/gh/AIGNE-io/aigne-doc-smith)
[![NPM Version](https://img.shields.io/npm/v/@aigne/doc-smith)](https://www.npmjs.com/package/@aigne/doc-smith)

# AIGNE DocSmith

AIGNE DocSmith is a powerful, AI-driven documentation generation tool built on the [AIGNE Framework](https://www.aigne.io/en/framework). It automates the creation of detailed, structured, and multi-language documentation directly from your source code.

## AIGNE Ecosystem

DocSmith is part of the [AIGNE](https://www.aigne.io) ecosystem, a comprehensive AI application development platform. Here's the architecture overview:

![AIGNE Ecosystem Architecture](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

As shown in the diagram, DocSmith integrates seamlessly with other [AIGNE](https://www.aigne.io) components, leveraging the platform's AI capabilities and infrastructure.

## Features

- **Automated Generate Document Structure:** Intelligently analyzes your codebase to generate a comprehensive and logical document structure.
- **AI-Powered Content Generation:** Populates the document structure with detailed, high-quality content.
- **Multi-Language Support:** Seamlessly translates your documentation into 12 languages including English, Chinese, Japanese, Korean, Spanish, French, German, Portuguese, Russian, Italian, and Arabic.
- **AIGNE Hub Integration:** Use [AIGNE Hub](https://www.aigne.io/en/hub) as your LLM provider without needing your own API keys, with easy switching between different large language models.
- **Document Publishing:** Preview your documentation on the official platform at [docsmith.aigne.io](https://docsmith.aigne.io/app/), or publish to your own [Discuss Kit](https://www.arcblock.io/docs/web3-kit/en/discuss-kit) instance for full control.
- **Document Update Mechanism:** Automatically detects source code changes and updates documentation accordingly.
- **Individual Document Optimization:** Regenerate and optimize specific documents with targeted feedback.

## Getting Started

### Prerequisites

- Node.js and npm
- AIGNE CLI

### Node.js Installation

#### Windows
1. Download Node.js installer from [nodejs.org](https://nodejs.org/)
2. Run the installer (.msi file)
3. Follow installation wizard steps
4. Verify installation: `node --version`

#### macOS
**Option 1: Using Homebrew (Recommended)**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option 2: Using the Official Installer**
1. Download the macOS installer from [nodejs.org](https://nodejs.org/)
2. Double-click the .pkg file to run the installer
3. Follow the installation wizard
4. Verify installation: `node --version`

#### Linux

**Ubuntu/Debian:**
```bash
# Update package index
sudo apt update

# Install Node.js
sudo apt install nodejs npm

# Or install latest LTS version using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS/RHEL/Fedora:**
```bash
# For CentOS/RHEL
sudo yum install nodejs npm

# For Fedora
sudo dnf install nodejs npm

# Or using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs
```

**Using Node Version Manager (nvm) - All Linux Distributions:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
```

#### Verification
After installation on any platform, verify Node.js and npm are installed correctly:
```bash
node --version
npm --version
```

### Installation

Install the latest version of AIGNE CLI globally:

```bash
npm i -g @aigne/cli
```

Verify the installation:

```bash
aigne doc -h
```

That's it! You can now use DocSmith directly through the AIGNE CLI.

### LLM Configuration

DocSmith supports multiple LLM providers through AIGNE Hub:

- **AIGNE Hub (Recommended):** No API key required, easy model switching
- **Custom API Keys:** Support for OpenAI, Anthropic, and other providers

To use AIGNE Hub, simply run commands without specifying API keys:

```bash
# Using AIGNE Hub with different models
aigne doc generate --model google:gemini-2.5-flash
aigne doc generate --model claude:claude-3-5-sonnet
aigne doc generate --model openai:gpt-4o
```

### Usage

#### Generate Documentation

To generate documentation, simply run:

```bash
aigne doc generate
```

**Smart Auto-Configuration:** If you haven't run `init` before, DocSmith will automatically detect this and guide you through the interactive configuration wizard first. This includes:
- Document generation rules and style selection
- Target audience definition
- Primary and translation language settings
- Source code path configuration
- Output directory setup

**Force Regeneration:** To regenerate all documentation from scratch, use:

```bash
aigne doc generate --forceRegenerate
```

This will regenerate all documentation based on the latest source code and configuration.

#### Manual Configuration (Optional)

If you prefer to set up configuration manually or want to modify existing settings:

```bash
aigne doc init
```

This will start the interactive configuration wizard directly.

#### Update Individual Documents

Optimize specific documents with targeted feedback:

```bash
# Interactive document selection and update
aigne doc update

# Update a specific document
aigne doc update --docs overview.md --feedback "Add more comprehensive FAQ entries"
```

**Interactive Mode:** When run without parameters, `aigne doc update` will present an interactive menu for you to select which document to regenerate and provide feedback.

#### Optimize Document Structure

Improve the overall documentation structure based on feedback:

```bash
# Optimize structure with feedback
aigne doc generate --feedback "Remove About section and add API Reference"

# Regenerate structure with specific improvements
aigne doc generate --feedback "Add more detailed installation guide and troubleshooting section"
```

**Structure Optimization:** Use `aigne doc generate` with `--feedback` to refine the overall documentation structure, add new sections, or reorganize existing content.

#### Document Translation

Translate existing documentation to multiple languages:

```bash
# Translate specific documents to multiple languages
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md

# Interactive translation with document and language selection
aigne doc translate
```

**Command Parameters:**
- `--langs`: Specify target languages (can be used multiple times)
- `--docs`: Specify document paths to translate (can be used multiple times)
- `--feedback`: Provide feedback for translation improvement
- `--glossary`: Use a glossary file for consistent terminology (@path/to/glossary.md)

**Interactive Mode:** When run without parameters, `aigne doc translate` will present interactive menus to:
- Select documents to translate from your documentation
- Choose target languages from 12 supported languages
- Add new translation languages to your configuration

#### Publishing to Discuss Kit

Publish your documentation to Discuss Kit platforms:

```bash
# Interactive publishing with platform selection
aigne doc publish
```

**Interactive Publishing:** When run `aigne doc publish` will present an interactive menu for you to choose between:
- **Official Platform:** [docsmith.aigne.io](https://docsmith.aigne.io/app/)
- **Own Instance:** Your own deployed [Discuss Kit](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu) instance



## Supported Languages

DocSmith supports 12 languages with automatic translation:

- English (en)
- 简体中文 (zh-CN)
- 繁體中文 (zh-TW)
- 日本語 (ja)
- 한국어 (ko)
- Español (es)
- Français (fr)
- Deutsch (de)
- Português (pt-BR)
- Русский (ru)
- Italiano (it)
- العربية (ar)


## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have any suggestions or find any bugs.

## Command Examples

### Basic Usage

```shell
# Interactive setup and configuration
aigne doc init

# Generate documentation with default settings
aigne doc generate

# Generate with specific model
aigne doc generate --model google:gemini-2.5-flash

# Force regenerate all documentation from scratch
aigne doc generate --forceRegenerate
```

### Advanced Usage

```shell
# Update structure with feedback
aigne doc generate --feedback "Remove About section and add API Reference"

# Update specific document
aigne doc update --doc-path /faq --feedback "Add more comprehensive FAQ entries"

# Translate documents to multiple languages
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md

# Interactive translation (select documents and languages)
aigne doc translate

# Translate with custom glossary and feedback
aigne doc translate --glossary @glossary.md --feedback "Use technical terminology consistently"
```

### Publishing and Integration

```shell
# Interactive publishing with platform selection
aigne doc publish

# Publish to custom Discuss Kit instance
aigne doc publish --appUrl https://your-discuss-kit-instance.com


```
