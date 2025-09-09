---
labels: ["Reference"]
---

# Extending with MCP

The Multi-Agent Collaboration Platform (MCP) is a powerful feature within AIGNE that transforms your documentation into an interactive experience. By exposing AI agents as a web server, you can build custom tools like intelligent search engines, Q&A bots, and dynamic content generators directly on top of your docs.

This guide will walk you through how to leverage the MCP server to create a powerful, AI-driven search feature for your documentation site.

## How it Works

The MCP server acts as a bridge between your AI agents and any web application. You define agents to perform specific tasks—like fetching document structures or analyzing content—and then configure the `mcp_server` in your `aigne.yaml` file to make them available over a simple HTTP API.

This allows a frontend application (like your documentation website) to call these complex AI workflows with a standard API request.

## Use Case: Building a Documentation Search Engine

Let's build a practical example: a search engine that understands natural language queries and provides synthesized answers based on your documentation content.

### The Workflow

The search process involves several collaborating agents, orchestrated by a `team` agent called `docs-search`.

```d2 A Documentation Search Workflow with MCP icon=mdi:graph
direction: down

user: {
  shape: c4-person
  label: "End User"
}

web-app: {
  label: "Interactive Docs\n(Web Application)"
  shape: rectangle
}

mcp-server: {
  label: "AIGNE MCP Server"

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

user -> web-app: "1. Enters search query"
web-app -> mcp-server.docs-search: "2. API Call with query"
mcp-server.docs-search -> mcp-server.get-structure: "3. Get doc list"
mcp-server.docs-search -> mcp-server.analyze-relevance: "4. Find relevant docs"
mcp-server.docs-search -> mcp-server.read-content: "5. Read content of docs"
mcp-server.docs-search -> mcp-server.synthesize-answer: "6. Synthesize final answer"
mcp-server.synthesize-answer -> web-app: "7. Return synthesized answer"
web-app -> user: "8. Display search results"
```

### 1. Define the Agents

Our search functionality relies on a set of specialized agents:

*   `get-docs-structure.mjs`: An agent that reads and returns the `structure-plan.json` file, providing a complete map of all documentation pages.
*   `get-docs-detail.mjs`: An agent that fetches the full Markdown content of a single documentation page by its path.
*   `docs-search.yaml`: A `team` agent that orchestrates the entire search workflow. It takes a user's query and uses other agents to find relevant documents, read their content, and generate a comprehensive answer.

### 2. Configure the MCP Server

To expose these agents via an API, you need to list them in the `mcp_server` section of your `aigne.yaml` configuration file.

```yaml aigne.yaml icon=logos:yaml
mcp_server:
  agents:
    - ./docs-mcp/get-docs-structure.mjs
    - ./docs-mcp/get-docs-detail.mjs
    - ./docs-mcp/docs-search.yaml
```

With this configuration, running the AIGNE development server will start the MCP server and make these agents accessible.

### 3. The `docs-search` Team

The `docs-search.yaml` file defines a sequential workflow, chaining multiple agents together to process the search query. This shows the power of agent orchestration.

```yaml docs-search.yaml icon=mdi:account-group
type: team
name: docs-search
description: Search relevant documents based on user query
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
      description: User search query
      required: true
```

This `team` agent first analyzes relevance based on titles and descriptions, then reads the content of the most relevant documents, and finally synthesizes an answer from that content.

### 4. Calling the Agent from Your Application

Once the MCP server is running, your frontend application can call the `docs-search` agent with a simple POST request.

```bash Calling the search agent icon=mdi:console
curl -X POST http://localhost:3000/api/run/docs-search \
-H "Content-Type: application/json" \
-d '{
  "query": "How do I configure my LLM provider?"
}'
```

The server will execute the `docs-search` workflow and return a JSON object containing the synthesized `relevantContent` and a list of `relevantDocs`.

By leveraging the MCP server, you can unlock advanced, AI-powered features for your documentation, making it more dynamic, helpful, and engaging for your users.

---

Now that you understand how to extend DocSmith with custom agent workflows, you can explore the underlying architecture in more detail. Learn more about how agents and prompts work together in the [How It Works](./advanced-how-it-works.md) section.