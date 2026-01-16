# DocSmith

AI-powered documentation generation tool built on the Aigne Framework.

[中文文档](./README.zh.md)

## Features

DocSmith is a complete documentation generation system that provides:
- 📚 Generate comprehensive documentation from code repositories, text files, and media resources
- 🏗️ Build organized documentation structures and documentation sites
- 📝 Intelligently analyze workspace content and generate structured documentation
- 🔄 Convert code/project content into readable documentation
- 🌍 Multi-language support and documentation localization
- 🖼️ Automatic generation and updating of documentation images
- 📤 One-click publishing to multiple platforms

Supports generating:
- Technical documentation
- User guides
- API references
- Tutorials and examples
- Product documentation

### User Intent Analysis

DocSmith automatically analyzes workspace content to infer:
- **Target audience** - Primary readers of the documentation (developers, operators, end users, etc.)
- **Use cases** - Context in which users consult the documentation (first contact, development integration, troubleshooting, etc.)
- **Documentation focus** - Documentation type (user guide, API reference, quick start, architecture overview, etc.)

Inference results are presented to users for confirmation, with support for multiple rounds of adjustments until satisfied.

### Structure Confirmation Mechanism

Before generating documentation, DocSmith displays the planned documentation structure:
- Total number of documents and hierarchy
- Title, description, and source files for each document
- Clear emoji indicators for quick browsing

Users can:
- Delete/add documents
- Adjust hierarchy (merge, split, adjust parent-child relationships)
- Modify content scope

Actual content generation begins only after user confirms the structure.

## Project Structure

```
aigne-doc-smith/
├── aigne.yaml                # Aigne framework configuration
├── package.json              # Project dependencies and metadata
├── CLAUDE.md                 # Claude Code project description
├── README.md                 # This file
│
├── agents/                   # Specialized Agents
│   ├── bash-executor/        # Bash command execution agent
│   ├── clear/                # Configuration cleanup agent
│   ├── content-checker/      # Content checking agent
│   ├── generate-images/      # Image generation agent
│   ├── localize/             # Documentation localization agent
│   ├── publish/              # Documentation publishing agent
│   ├── save-document/        # Document saving agent
│   ├── structure-checker/    # Structure checking agent
│   └── update-image/         # Image update agent
│
├── skills/                   # Skill definitions
│   └── doc-smith/            # DocSmith Skill
│       ├── SKILL.md          # Skill main document
│       └── references/       # Reference documents
│
├── skills-entry/             # Aigne framework entry configuration
│   └── doc-smith/
│       ├── index.yaml        # Main entry configuration
│       └── prompt.md         # Prompt template
│
├── utils/                    # Utility library
│   ├── config.mjs            # Configuration management
│   ├── docs.mjs              # Document processing
│   ├── git.mjs               # Git operations
│   ├── image-utils.mjs       # Image utilities
│   ├── workspace.mjs         # Workspace management
│   └── ...                   # More utilities
│
└── scripts/                  # Helper scripts
    └── ...
```

## Quick Start

### 1. Install Aigne CLI

```bash
npm install -g @aigne/cli
```

### 2. Start DocSmith

Run directly in your project root:

```bash
cd my-project
aigne doc
```

On first execution, Aigne CLI will automatically install DocSmith and start the interactive documentation generation process.

**Automatic Initialization:**

DocSmith will automatically:
- Detect the current project
- Create workspace in `.aigne/doc-smith/` directory
- Generate config.yaml configuration file

**Completed During Conversation:**

DocSmith will guide you through:
1. Ask for output language (if not specified)
2. Analyze project content
3. Infer user intent
4. Plan documentation structure
5. Generate structured Markdown documentation

### 3. Generated Directory Structure

```
my-project/
├── .aigne/
│   └── doc-smith/              # DocSmith workspace
│       ├── config.yaml         # Configuration file
│       ├── intent/             # User intent
│       ├── planning/           # Documentation structure planning
│       ├── docs/               # Generated documentation
│       │   ├── overview.md
│       │   ├── getting-started.md
│       │   └── api/
│       │       └── authentication.md
│       └── cache/              # Temporary data
└── (other project files...)
```

### 4. Independent Workspace Mode (Optional)

To separate documentation project from source code, use independent workspace:

```bash
# Create independent workspace
mkdir my-docs
cd my-docs
aigne doc
```

Independent mode supports multiple data source configuration:

```yaml
# config.yaml
sources:
  - name: "main"
    type: local-path
    path: "../my-project"

  - name: "other-repo"
    type: git-clone
    url: "https://github.com/example/repo.git"
    branch: "main"
```

## Core Features

### Documentation Generation
- Intelligent analysis of source code and project structure
- Automatic inference of user intent and target audience
- Generation of structured Markdown documentation
- Support for documentation hierarchy planning and confirmation

### Image Management
- Automatic generation of documentation images
- Image placeholder system support
- Batch update and edit images
- Multiple image generation model support

### Multi-language Support
- Documentation localization and translation
- Multi-language documentation structure management
- Automatic synchronization of different language versions

### Publishing and Deployment
- One-click publishing to multiple platforms
- Custom publishing configuration support
- Documentation site building and deployment

## Development

### Install Dependencies

```bash
pnpm install
```

### Code Quality

Project uses Biome for code linting and formatting:

```bash
# Check code
pnpm run lint

# Auto fix
pnpm run lint:fix
```

### Modifying Agents

To add or modify agents:

1. Create or modify agent in `agents/` directory
2. Register new agent in `aigne.yaml`
3. Write agent prompts and configuration files

### Modifying Utility Functions

To extend or optimize utility functions:

1. Add or modify utility functions in `utils/` directory
2. Ensure ES module syntax (`.mjs` files)
3. Import and use where needed

## Tech Stack

- **Aigne Framework** - AI agent orchestration framework
- **Node.js** - Runtime environment (ES modules)
- **pnpm** - Package manager
- **Biome** - Code linting and formatting
- **YAML** - Configuration and data format

## Notes

- Ensure Node.js (v18+) and pnpm are installed
- Ensure Git is installed (for submodule and version management)
- Anthropic API key or other LLM provider configuration required
- Image generation features require corresponding API key configuration

## Migration Guide

If you previously used an older version (`.aigne/doc-smith/` directory structure), we recommend:
1. Create a new workspace directory
2. Regenerate documentation
3. Old version data can be manually migrated to the new workspace directory structure

## Version

Current version: `0.9.11`

## Support

For issues or suggestions, please open an issue in the project.

## Author

**Arcblock** - [blocklet@arcblock.io](mailto:blocklet@arcblock.io)

GitHub: [@blocklet](https://github.com/blocklet)

## License

Elastic-2.0 License

## Related Links

- [Aigne Framework](https://www.npmjs.com/package/@aigne/cli)
- [Arcblock](https://www.arcblock.io/)
