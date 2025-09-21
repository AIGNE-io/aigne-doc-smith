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
- **Discuss Kit Publishing**: Deploy to [docsmith.aigne.io](https://docsmith.aigne.io/app/) or your own [Discuss Kit](https://www.arcblock.io/docs/web3-kit/en/discuss-kit) instance

### 🔄 Smart Updates
- **Change Detection**: Automatically identifies code changes and updates relevant documentation
- **Targeted Regeneration**: Update specific sections with custom feedback and requirements
- **Version Awareness**: Maintains documentation history and tracks changes over time

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- No API keys required (uses AIGNE Hub by default)

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

| Language | Code | Support Level |
|----------|------|---------------|
| English | `en` | ✅ Native |
| 简体中文 | `zh-CN` | ✅ Full |
| 繁體中文 | `zh-TW` | ✅ Full |
| 日本語 | `ja` | ✅ Full |
| 한국어 | `ko` | ✅ Full |
| Español | `es` | ✅ Full |
| Français | `fr` | ✅ Full |
| Deutsch | `de` | ✅ Full |
| Português | `pt-BR` | ✅ Full |
| Русский | `ru` | ✅ Full |
| Italiano | `it` | ✅ Full |
| العربية | `ar` | ✅ Full |


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
```

### 📜 Code of Conduct
Please read our [Code of Conduct](https://github.com/AIGNE-io/aigne-doc-smith/blob/main/CODE_OF_CONDUCT.md) before contributing.

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
- 📖 [Official Documentation](https://docsmith.aigne.io/docs/)
- 🎥 [Video Tutorials](https://www.youtube.com/@aigne-io)
- 📝 [Best Practices Guide](https://docsmith.aigne.io/guides/best-practices)
- 🔧 [API Reference](https://docsmith.aigne.io/api/)

### 💬 Community Support
- 💭 [GitHub Discussions](https://github.com/AIGNE-io/aigne-doc-smith/discussions) - Q&A and feature discussions
- 🐦 [Twitter](https://twitter.com/aigne_io) - Updates and announcements
- 🎮 [Discord Server](https://discord.gg/aigne) - Real-time community chat
- 📧 [Newsletter](https://www.aigne.io/newsletter) - Monthly updates and tips

### 🏆 Showcase
See DocSmith in action with real-world examples:
- [AIGNE Framework Docs](https://docs.aigne.io) - Generated with DocSmith
- [Community Projects](https://github.com/topics/aigne-docsmith) - Browse repositories using DocSmith

## 📄 License

This project is licensed under the **Elastic License 2.0** - see the [LICENSE](LICENSE) file for details.

### What does this mean?
- ✅ **Free for most use cases**: Personal projects, internal use, and most commercial applications
- ✅ **Open source**: Full source code available for review and contributions
- ✅ **Commercial friendly**: Use in your business applications and services
- ❌ **Restrictions**: Cannot offer DocSmith as a competing hosted service

[Learn more about Elastic License 2.0](https://www.elastic.co/licensing/elastic-license)

---

<div align="center">

**🚀 Start generating amazing documentation today!**

[![Get Started](https://img.shields.io/badge/Get_Started-brightgreen?style=for-the-badge&logo=rocket)](https://docsmith.aigne.io/get-started)
[![Join Community](https://img.shields.io/badge/Join_Community-blue?style=for-the-badge&logo=discord)](https://discord.gg/aigne)
[![Star on GitHub](https://img.shields.io/badge/Star_on_GitHub-yellow?style=for-the-badge&logo=github)](https://github.com/AIGNE-io/aigne-doc-smith)

Made with ❤️ by the [AIGNE Team](https://www.aigne.io/team)

</div>

"My first edit"
