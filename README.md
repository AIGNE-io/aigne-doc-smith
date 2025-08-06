# AIGNE DocSmith

AIGNE DocSmith is a powerful, AI-driven documentation generation tool built on the AIGNE Framework. It automates the creation of detailed, structured, and multi-language documentation directly from your source code.

## Features

- **Automated Structure Planning:** Intelligently analyzes your codebase to generate a comprehensive and logical document structure.
- **AI-Powered Content Generation:** Populates the document structure with detailed, high-quality content.
- **Multi-Language Support:** Seamlessly translates your documentation into multiple languages.
- **Smart File Management:** Automatically cleans up invalid .md files that are no longer in the structure plan, preventing file accumulation.
- **Customizable Prompts:** Allows for fine-tuning the output by customizing the prompts used by the AI agents.
- **Extensible Workflow:** Built with a modular agent-based architecture, making it easy to extend and customize the documentation generation process.

## How It Works

AIGNE DocSmith utilizes a chain of AI agents to generate documentation in a three-step process:

1.  **Structure Planning (`structure-planning`):** This agent analyzes the source code and creates a structured plan for the documentation. The plan is defined in `agents/structure-planning.yaml` and uses the prompt in `prompts/structure-planning.md`.
2.  **Content Detail Generation (`content-detail-generator`):** This agent takes the structured plan and generates detailed content for each section of the documentation. This process is defined in `agents/content-detail-generator.yaml` and guided by the prompt in `prompts/document/detail-generator.md`.
3.  **Translation (`translate`):** This agent translates the generated documentation into different languages. The translation agent is defined in `agents/translate.yaml` and uses the prompt in `prompts/translator.md`.

The main workflow is orchestrated by the `docs-generator` agent, as defined in `agents/docs-generator.yaml`.

## Getting Started

### Prerequisites

- Node.js and pnpm
- AIGNE Framework

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/aigne-doc-smith.git
    ```
2.  Install the dependencies:
    ```bash
    pnpm install
    ```

### Usage

To generate documentation, run the following command:

```bash
aigne run docs-generator --datasources.source-code-path=/path/to/your/code
```

This will initiate the documentation generation process, and the output will be saved in the `output` directory.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have any suggestions or find any bugs.

## Test Commands

```shell

# 初始化
npx --no doc-smith run --entry-agent init

# 生成命令
npx --no doc-smith run --entry-agent generate --model gemini:gemini-2.5-flash

aigne run --path /Users/lban/arcblock/code/aigne-doc-smith/ --entry-agent generate --model gemini:gemini-2.5-flash --input-forceRegenerate=true

# 重新生成单篇
npx --no doc-smith run --entry-agent update --input-doc-path bitnet-getting-started

# 结构规划优化
npx --no doc-smith run --entry-agent generate --input-feedback "补充节点的 sourceIds，确保所有节点 sourceIds 都有值" --model gemini:gemini-2.5-pro


# 发布文档
npx --no doc-smith run --entry-agent publish


```

使用 `aigne doc` 运行

```shell
# 初始化
aigne doc init

# 生成文档
aigne doc generate

# 优化结构规划
aigne doc generate --feedback "删除 About 文档"

# 优化单篇文档
# 可使用 structure-plan.json 中的 path ，或 Discuss Kit 中访问的 path
aigne doc update --doc-path /faq --feedback "添加更多的 FAQ" 

# 发布文档
aigne doc publish

# 将文档作为 MCP Server 
aigne doc serve-mcp

```

## Testing

运行测试来验证功能：

```bash
# 测试 saveDocs 方法的文件清理功能
node tests/test-save-docs.mjs
```

更多测试信息请查看 [tests/README.md](tests/README.md)。
