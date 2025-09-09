---
labels: ["Reference"]
---

# 使用 MCP 进行扩展

The Multi-Agent Collaboration Platform (MCP) 是 AIGNE 中的一项强大功能，可将你的文档转变为交互式体验。通过将 AI agents 公开为 Web 服务器，你可以直接在文档基础上构建智能搜索引擎、问答机器人和动态内容生成器等自定义工具。

本指南将引导你学习如何利用 MCP 服务器为你的文档网站创建一个强大的、由 AI 驱动的搜索功能。

## 工作原理

MCP 服务器充当了 AI agents 与任何 Web 应用程序之间的桥梁。你可以定义 agents 来执行特定任务（例如获取文档结构或分析内容），然后在 `aigne.yaml` 文件中配置 `mcp_server`，通过一个简单的 HTTP API 使这些 agents 可用。

这使得前端应用程序（例如你的文档网站）可以通过标准的 API 请求调用这些复杂的 AI 工作流。

## 用例：构建文档搜索引擎

让我们构建一个实际的例子：一个能够理解自然语言查询，并根据你的文档内容提供综合性答案的搜索引擎。

### 工作流

搜索过程涉及多个协同工作的 agents，由一个名为 `docs-search` 的 `team` agent 进行编排。

```d2 A Documentation Search Workflow with MCP icon=mdi:graph
direction: down

user: {
  shape: c4-person
  label: "最终用户"
}

web-app: {
  label: "交互式文档\n(Web 应用程序)"
  shape: rectangle
}

mcp-server: {
  label: "AIGNE MCP 服务器"

  docs-search: {
    label: "docs-search (Team)"
  }

  get-structure: {
    label: "get-docs-structure"
  }

  analyze-relevance: {
    label: "analyze-docs-relevance"
  }

  read-content: {
    label: "read-doc-content"
  }
  
  synthesize-answer: {
    label: "analyze-content-relevance"
  }
}

user -> web-app: "1. 输入搜索查询"
web-app -> mcp-server.docs-search: "2. 使用查询进行 API 调用"
mcp-server.docs-search -> mcp-server.get-structure: "3. 获取文档列表"
mcp-server.docs-search -> mcp-server.analyze-relevance: "4. 查找相关文档"
mcp-server.docs-search -> mcp-server.read-content: "5. 读取文档内容"
mcp-server.docs-search -> mcp-server.synthesize-answer: "6. 综合最终答案"
mcp-server.synthesize-answer -> web-app: "7. 返回综合答案"
web-app -> user: "8. 显示搜索结果"
```

### 1. 定义 Agents

我们的搜索功能依赖于一组专门的 agents：

*   `get-docs-structure.mjs`：一个读取并返回 `structure-plan.json` 文件的 agent，提供所有文档页面的完整映射。
*   `get-docs-detail.mjs`：一个根据路径获取单个文档页面完整 Markdown 内容的 agent。
*   `docs-search.yaml`：一个 `team` agent，负责编排整个搜索工作流。它接收用户的查询，并使用其他 agents 查找相关文档、读取其内容，并生成全面的答案。

### 2. 配置 MCP 服务器

要通过 API 公开这些 agents，你需要在 `aigne.yaml` 配置文件的 `mcp_server` 部分列出它们。

```yaml aigne.yaml icon=logos:yaml
mcp_server:
  agents:
    - ./docs-mcp/get-docs-structure.mjs
    - ./docs-mcp/get-docs-detail.mjs
    - ./docs-mcp/docs-search.yaml
```

完成此配置后，运行 AIGNE 开发服务器将启动 MCP 服务器，并使这些 agents 可被访问。

### 3. `docs-search` 团队

`docs-search.yaml` 文件定义了一个顺序工作流，将多个 agents 链接在一起以处理搜索查询。这展示了 agent 编排的强大功能。

```yaml docs-search.yaml icon=mdi:account-group
type: team
name: docs-search
description: 根据用户查询搜索相关文档
skills:
  - ../agents/load-config.mjs
  - ../agents/load-sources.mjs
  - analyze-docs-relevance.yaml
  - read-doc-content.mjs
  - analyze-content-relevance.yaml
mode: sequential
input_schema:
  type: object
  properties:
    query:
      type: string
      description: 用户搜索查询
      required: true
```

这个 `team` agent 首先根据标题和描述分析相关性，然后读取最相关文档的内容，最后从这些内容中综合出一个答案。

### 4. 从你的应用程序调用 Agent

MCP 服务器运行后，你的前端应用程序可以通过一个简单的 POST 请求调用 `docs-search` agent。

```bash Calling the search agent icon=mdi:console
curl -X POST http://localhost:3000/api/run/docs-search \
-H "Content-Type: application/json" \
-d '{
  "query": "How do I configure my LLM provider?"
}'
```

服务器将执行 `docs-search` 工作流，并返回一个包含综合的 `relevantContent` 和 `relevantDocs` 列表的 JSON 对象。

通过利用 MCP 服务器，你可以为你的文档解锁由 AI 驱动的高级功能，使其对用户更具动态性、实用性和吸引力。

---

现在你已经了解了如何使用自定义 agent 工作流扩展 DocSmith，可以更详细地探索其底层架构。在 [工作原理](./advanced-how-it-works.md) 部分，了解更多关于 agents 和 prompts 如何协同工作的信息。