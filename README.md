[![GitHub stars](https://img.shields.io/github/stars/AIGNE-io/aigne-doc-smith?style=flat-square)](https://github.com/AIGNE-io/aigne-doc-smith/stargazers)
[![NPM Version](https://img.shields.io/npm/v/@aigne/doc-smith?style=flat-square)](https://www.npmjs.com/package/@aigne/doc-smith)
[![NPM Downloads](https://img.shields.io/npm/dm/@aigne/doc-smith?style=flat-square)](https://www.npmjs.com/package/@aigne/doc-smith)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-doc-smith?style=flat-square)](https://github.com/AIGNE-io/aigne-doc-smith/issues)
[![License](https://img.shields.io/github/license/AIGNE-io/aigne-doc-smith?style=flat-square)](https://github.com/AIGNE-io/aigne-doc-smith/blob/main/LICENSE)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-doc-smith/graph/badge.svg?token=95TQO2NKYC)](https://codecov.io/gh/AIGNE-io/aigne-doc-smith)

# AIGNE DocSmith

> 🚀 **AI-powered documentation generation that understands your code**

AIGNE DocSmith is a powerful, AI-driven documentation generation tool built on the [AIGNE Framework](https://www.aigne.io/en/framework). It automatically analyzes your codebase and generates comprehensive, structured, and multi-language documentation that stays in sync with your code.

## 🎯 Why DocSmith?

- **🧠 Intelligent Analysis**: Understands your code structure, patterns, and intent
- **📚 Comprehensive Coverage**: Generates complete documentation from API references to user guides
- **🌍 Global Ready**: Supports 12 languages with professional translation
- **🔄 Always Current**: Automatically detects changes and updates documentation
- **⚡ Zero Config**: Works out of the box with smart defaults and auto-detection

## AIGNE Ecosystem

DocSmith is part of the [AIGNE](https://www.aigne.io) ecosystem, a comprehensive AI application development platform. Here's the architecture overview:

![AIGNE Ecosystem Architecture](https://docsmith.aigne.io/image-bin/uploads/def424c20bbdb3c77483894fe0e22819.png)

As shown in the diagram, DocSmith integrates seamlessly with other [AIGNE](https://www.aigne.io) components, leveraging the platform's AI capabilities and infrastructure.

## ✨ Features

### 🤖 AI-Powered Generation

- **Smart Structure Planning**: Automatically analyzes your codebase to create logical, comprehensive documentation structure
- **Intelligent Content Creation**: Generates detailed, contextual content that explains both "what" and "why"
- **Adaptive Writing Styles**: Supports multiple documentation styles (Technical, User-Friendly, Developer-Focused, etc.)

### 🌍 Multi-Language Excellence

- **12 Language Support**: English, Chinese (Simplified & Traditional), Japanese, Korean, Spanish, French, German, Portuguese, Russian, Italian, and Arabic
- **Professional Translation**: Context-aware translation that maintains technical accuracy
- **Glossary Integration**: Consistent terminology across all languages

### 🔗 Seamless Integration

- **AIGNE Hub Integration**: Use [AIGNE Hub](https://www.aigne.io/en/hub) without API keys, switch between Google Gemini, OpenAI GPT, Claude, and more
- **Multiple LLM Support**: Bring your own API keys for OpenAI, Anthropic, Google, and other providers
- **Discuss Kit Publishing**: Deploy to [docsmith.aigne.io](https://docsmith.aigne.io/app/) or your own [Discuss Kit](https://www.web3kit.rocks/discuss-kit) instance

### 🔄 Smart Updates

- **Change Detection**: Automatically identifies code changes and updates relevant documentation
- **Targeted Regeneration**: Update specific sections with custom feedback and requirements
- **Version Awareness**: Maintains documentation history and tracks changes over time

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm/pnpm
- No API keys required (uses AIGNE Hub by default)


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
# One command to rule them all
aigne doc generate
```

DocSmith will:

1. 🔍 Auto-detect your project structure and tech stack
2. 🎯 Guide you through an interactive setup (first time only)
3. 📝 Generate comprehensive documentation
4. 🌍 Optionally translate to multiple languages
5. 🚀 Publish to your preferred platform

## 🔧 Advanced Configuration

### LLM Providers

DocSmith supports multiple AI providers:

**🎯 AIGNE Hub (Recommended)**

- ✅ No API keys required
- ✅ Easy model switching
- ✅ Built-in rate limiting and optimization

```bash
# Switch models effortlessly
aigne doc generate --model google:gemini-2.5-pro
aigne doc generate --model claude:claude-3-5-sonnet
aigne doc generate --model openai:gpt-4o
```

**🔑 Custom API Keys**
Configure your own API keys for direct provider access:

- OpenAI GPT models
- Anthropic Claude models
- Google Gemini models
- And more...

## 📖 Usage Guide

### Core Commands

#### 📝 Generate Documentation

```bash
# Smart generation with auto-configuration
aigne doc generate

# Force complete regeneration
aigne doc generate --forceRegenerate

# Generate with custom feedback
aigne doc generate --feedback "Add more API examples and troubleshooting sections"
```

#### 🔄 Update Existing Documents

```bash
# Interactive document selection and update
aigne doc update

# Update specific document with feedback
aigne doc update --docs overview.md --feedback "Add comprehensive FAQ section"
```

#### 🌍 Multi-Language Translation

```bash
# Interactive translation with smart language selection
aigne doc translate

# Translate specific documents to multiple languages
aigne doc translate --langs zh --langs ja --docs examples.md --docs overview.md

# Translation with custom glossary for consistent terminology
aigne doc translate --glossary @path/to/glossary.md --feedback "Use technical terminology consistently"
```

#### 🚀 Publishing & Deployment

```bash
# Interactive publishing with platform selection
aigne doc publish

# Publish to custom Discuss Kit instance
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

#### ⚙️ Configuration Management

```bash
# Interactive configuration setup
aigne doc init

# View current configuration
aigne doc prefs
```

### Configuration Options

DocSmith automatically detects your project structure, but you can customize:

- **📝 Documentation Styles**: Technical, User-Friendly, Developer-Focused, Academic
- **🎯 Target Audiences**: Developers, End Users, System Administrators, Business Users
- **🌍 Languages**: Choose from 12 supported languages
- **📁 Source Paths**: Customize which files and directories to analyze
- **📤 Output Settings**: Configure documentation structure and formatting

## 🌐 Supported Languages

DocSmith provides professional translation for 12 languages:

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

- 🔍 [Search existing issues](https://github.com/AIGNE-io/aigne-doc-smith/issues) first
- 📝 Use our issue templates for bug reports and feature requests
- 🚨 Include clear reproduction steps and environment details

### 💡 Feature Requests

- 🌟 Share your ideas in [GitHub Discussions](https://github.com/AIGNE-io/aigne-doc-smith/discussions)
- 📋 Check our [roadmap](https://github.com/AIGNE-io/aigne-doc-smith/projects) for planned features
- 🗳️ Vote on existing feature requests

### 🔧 Development Setup

```bash
# Clone the repository
git clone https://github.com/AIGNE-io/aigne-doc-smith.git
cd aigne-doc-smith

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linting
pnpm run lint

# Auto fix lint error
pnpm run lint:fix
```

### 📜 Code of Conduct

Please follow our community guidelines and maintain respectful, constructive communication when contributing.

## 💼 Enterprise & Production Use

### 🏢 Enterprise Features

- **Team Collaboration**: Multi-user workflows with role-based access
- **Custom Branding**: White-label documentation with your brand identity
- **API Integration**: REST APIs for automated documentation pipelines
- **Analytics**: Track documentation usage and effectiveness

### 🔒 Security & Compliance

- **Private Cloud**: Deploy on your own infrastructure
- **SSO Integration**: Connect with your identity providers
- **Audit Logs**: Complete activity tracking and compliance reporting
- **Data Privacy**: Your code never leaves your environment in private deployments

### 📞 Support & Services

- **Priority Support**: Direct access to our engineering team
- **Custom Training**: Team onboarding and best practices workshops
- **Professional Services**: Custom integrations and deployment assistance

[Contact us](https://www.aigne.io/contact) for enterprise licensing and deployment options.

## 📊 Community & Resources

### 📚 Documentation & Tutorials

- 📖 [Documentation](https://docsmith.aigne.io/docs/)

### 💬 Community Support

- 🐦 [Twitter](https://twitter.com/arcblock_io) - Updates and announcements
- 🎮 [Community](https://community.arcblock.io/discussions/boards/aigne) - Real-time community chat

### 🏆 Showcase

See DocSmith in action with real-world examples:

- [Docs Repository](https://docsmith.aigne.io/app) - Generated with DocSmith

## 📄 License

This project is licensed under the **Elastic License 2.0** - see the [LICENSE](LICENSE) file for details.

### What does this mean?

- ✅ **Free for most use cases**: Personal projects, internal use, and most commercial applications
- ✅ **Open source**: Full source code available for review and contributions
- ✅ **Commercial friendly**: Use in your business applications and services
- ❌ **Restrictions**: Cannot offer DocSmith as a competing hosted service

[Learn more about Elastic License 2.0](https://www.elastic.co/licensing/elastic-license)

