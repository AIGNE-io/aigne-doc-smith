[![GitHub stars](https://img.shields.io/github/stars/AIGNE-io/aigne-doc-smith?style=flat-square)](https://github.com/AIGNE-io/aigne-doc-smith/stargazers)
[![NPM Version](https://img.shields.io/npm/v/@aigne/doc-smith?style=flat-square)](https://www.npmjs.com/package/@aigne/doc-smith)
[![NPM Downloads](https://img.shields.io/npm/dm/@aigne/doc-smith?style=flat-square)](https://www.npmjs.com/package/@aigne/doc-smith)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-doc-smith?style=flat-square)](https://github.com/AIGNE-io/aigne-doc-smith/issues)
[![License](https://img.shields.io/github/license/AIGNE-io/aigne-doc-smith?style=flat-square)](https://github.com/AIGNE-io/aigne-doc-smith/blob/main/LICENSE)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-doc-smith/graph/badge.svg?token=95TQO2NKYC)](https://codecov.io/gh/AIGNE-io/aigne-doc-smith)

# AIGNE DocSmith

> 🚀 **AI-powered documentation that understands your code**

AIGNE DocSmith is a powerful, AI-driven documentation tool built on the [AIGNE Framework](https://www.aigne.io/en/framework). It automatically analyzes your codebase to generate comprehensive, structured, and multi-language documentation that stays in sync with your code.

## 🎯 Why DocSmith?

- **🧠 Intelligent Analysis**: Understands your code's structure, patterns, and intent.
- **📚 Comprehensive Coverage**: Generates everything from API references to user guides.
- **🌍 Global Ready**: Supports 12 languages with professional-grade translation.
- **🔄 Always Current**: Automatically detects changes and updates documentation accordingly.
- **⚡ Zero Config**: Works out of the box with smart defaults and auto-detection.

## AIGNE Ecosystem

DocSmith is part of the [AIGNE](https://www.aigne.io) ecosystem, a comprehensive AI application development platform.

![AIGNE Ecosystem Architecture](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

As shown in the diagram, DocSmith integrates seamlessly with other [AIGNE](https://www.aigne.io) components, leveraging the platform's AI capabilities and infrastructure.

## ✨ Features

### 🤖 AI-Powered Generation

- **Smart Structure Planning**: Analyzes your codebase to create a logical and comprehensive documentation structure.
- **Intelligent Content Creation**: Generates detailed, contextual content that explains both the "what" and the "why."
- **Adaptive Writing Styles**: Supports multiple documentation styles, including Technical, User-Friendly, and Developer-Focused.

### 🌍 Multi-Language Support

- **12 Language Support**: English, Chinese (Simplified & Traditional), Japanese, Korean, Spanish, French, German, Portuguese, Russian, Italian, and Arabic.
- **Professional Translation**: Provides context-aware translations that maintain technical accuracy.
- **Glossary Integration**: Ensures consistent terminology across all languages.

### 🔗 Seamless Integration

- **AIGNE Hub Integration**: Use the [AIGNE Hub](https://www.aigne.io/en/hub) without API keys and switch between Google Gemini, OpenAI GPT, Claude, and more.
- **Multiple LLM Support**: Bring your own API keys for OpenAI, Anthropic, Google, and other providers.
- **One-Click Publishing**: Publish your docs and generate shareable links for your team. Publish to [docsmith.aigne.io](https://docsmith.aigne.io/app/) or your own [Discuss Kit](https://www.web3kit.rocks/discuss-kit) instance.

### 🔄 Smart Updates

- **Change Detection**: Automatically identifies code changes and updates the relevant documentation.
- **Targeted Regeneration**: Updates specific sections with custom feedback and requirements.
- **Version Awareness**: Maintains a history of your documentation and tracks changes over time.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm/pnpm
- No API keys required (uses the AIGNE Hub by default).

### 📦 Installation

Install the AIGNE CLI globally:

```bash
npm install -g @aigne/cli
```

Verify the installation:

```bash
aigne doc --help
```

### 🎉 Generate Your First Documentation

Navigate to your project directory and run:

```bash
# One command to generate your documentation
aigne doc create
```

DocSmith will:

1. 🔍 Auto-detect your project's structure and tech stack.
2. 🎯 Guide you through an interactive setup (first time only).
3. 📝 Generate comprehensive documentation.
4. 🌍 Optionally translate it into multiple languages.
5. 🚀 Publish it to your preferred platform.

## 🔧 Advanced Configuration

### LLM Providers

DocSmith supports multiple AI providers:

**🎯 AIGNE Hub (Recommended)**

- ✅ No API keys required.
- ✅ Easy model switching.
- ✅ Built-in rate limiting and optimization.

```bash
# Switch models effortlessly
aigne doc create --model google:gemini-2.5-pro
aigne doc create --model anthropic:claude-sonnet-4-5
aigne doc create --model openai:gpt-4o
```

**🔑 Custom API Keys**
Configure your own API keys for direct provider access:

- OpenAI GPT models
- Anthropic Claude models
- Google Gemini models
- and more...

## 📖 Usage Guide

### Core Commands

#### 📝 Generate Documentation

```bash
# Smart generation with auto-configuration
aigne doc create

# Force a complete regeneration of the documentation
aigne doc create --forceRegenerate

# Generate with custom feedback
aigne doc create --feedback "Add more API examples and troubleshooting sections"
```

#### 🔄 Update Existing Documents

```bash
# Interactively select and update a document
aigne doc update

# Update specific document with feedback
aigne doc update --docs overview.md --feedback "Add comprehensive FAQ section"
```

#### 🌍 Multi-Language Translation

```bash
# Interactive translation with smart language selection
aigne doc localize

# Translate specific documents into multiple languages
aigne doc localize --langs zh --langs ja --docs examples.md --docs overview.md

# Translate with a custom glossary for consistent terminology
aigne doc localize --glossary @path/to/glossary.md --feedback "Use technical terminology consistently"
```

#### 🚀 Publishing & Deployment

```bash
# Interactive publishing with platform selection
aigne doc publish

# Publish to a custom Discuss Kit instance
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

#### ⚙️ Configuration Management

```bash
# Interactive configuration setup
aigne doc init

# View the current configuration
aigne doc prefs
```

### Configuration Options

DocSmith automatically detects your project's structure, but you can customize it to your needs:

- **📝 Documentation Styles**: Technical, User-Friendly, Developer-Focused, Academic
- **🎯 Target Audiences**: Developers, End Users, System Administrators, Business Users
- **🌍 Languages**: Choose from 12 supported languages.
- **📁 Source Paths**: Customize which files and directories to analyze.
- **📤 Output Settings**: Configure the documentation structure and formatting.

## 🌐 Supported Languages

DocSmith provides professional-grade translations for 12 languages:

| Language  | Code    | Support Level |
| --------- | ------- | ------------- |
| English   | `en`    | ✅ Native     |
| 简体中文  | `zh-CN` | ✅ Full       |
| 繁體中文  | `zh-TW` | ✅ Full       |
| 日本語    | `ja`    | ✅ Full       |
| 한국어    | `ko`    | ✅ Full       |
| Español   | `es`    | ✅ Full       |
| Français  | `fr`    | ✅ Full       |
| Deutsch   | `de`    | ✅ Full       |
| Português | `pt-BR` | ✅ Full       |
| Русский   | `ru`    | ✅ Full       |
| Italiano  | `it`    | ✅ Full       |
| العربية   | `ar`    | ✅ Full       |

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Reporting Issues

- 🔍 [Search existing issues](https://github.com/AIGNE-io/aigne-doc-smith/issues) first.
- 📝 Use our issue templates for bug reports and feature requests.
- 🚨 Include clear reproduction steps and details about your environment.

### 💡 Feature Requests

- 🌟 Share your ideas in [GitHub Discussions](https://github.com/AIGNE-io/aigne-doc-smith/discussions).
- 📋 Check our [roadmap](https://github.com/AIGNE-io/aigne-doc-smith/projects) for planned features.
- 🗳️ Vote on existing feature requests.

### 🔧 Development Setup

```bash
# Clone the repository
git clone https://github.com/AIGNE-io/aigne-doc-smith.git
cd aigne-doc-smith

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run the linter
pnpm run lint

# Automatically fix lint errors
pnpm run lint:fix
```

### 📜 Code of Conduct

Please follow our community guidelines and maintain respectful, constructive communication.

## 💼 Enterprise & Production Use

### 🏢 Enterprise Features

- **Team Collaboration**: Multi-user workflows with role-based access.
- **Custom Branding**: White-label your documentation with your brand's identity.
- **API Integration**: Use REST APIs for automated documentation pipelines.
- **Analytics**: Track documentation usage and effectiveness.

### 🔒 Security & Compliance

- **Private Cloud**: Deploy on your own infrastructure.
- **SSO Integration**: Connect with your existing identity providers.
- **Audit Logs**: Complete activity tracking and compliance reporting.
- **Data Privacy**: Your code never leaves your environment in private deployments.

### 📞 Support & Services

- **Priority Support**: Get direct access to our engineering team.
- **Custom Training**: We offer team onboarding and best practices workshops.
- **Professional Services**: We provide custom integrations and deployment assistance.

[Contact us](https://www.aigne.io/contact) for enterprise licensing and deployment options.

## 📊 Community & Resources

### 📚 Documentation & Tutorials

- 📖 [Documentation](https://docsmith.aigne.io/docs/)

### 💬 Community Support

- 🐦 [Twitter](https://twitter.com/arcblock_io) - For updates and announcements.
- 🎮 [Community](https://community.arcblock.io/discussions/boards/aigne) - For real-time community chat.

### 🏆 Showcase

See DocSmith in action with these real-world examples:

- [Docs Repository](https://docsmith.aigne.io/app) - Generated with DocSmith.

## 📄 License

This project is licensed under the **Elastic License 2.0**. See the [LICENSE](LICENSE) file for details.

### What does this mean?

- ✅ **Free for most use cases**: Including personal projects, internal use, and most commercial applications.
- ✅ **Open source**: The full source code is available for review and contributions.
- ✅ **Commercial friendly**: Use it in your business applications and services.
- ❌ **Restrictions**: You cannot offer DocSmith as a competing hosted service.

[Learn more about the Elastic License 2.0](https://www.elastic.co/licensing/elastic-license)
