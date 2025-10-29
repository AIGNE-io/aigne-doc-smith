
{% include "../../common/document-structure/user-locale-rules.md" %}

{% include "../../common/document-structure/user-preferences.md" %}


{#
TODO: merge file list (without content) to the datasources
<file_list>
{{allFilesPaths}}
</file_list>
#}

<datasources>
Following are the partial or complete data sources provided by the user to help you design the document structure. Use these data sources to inform your structural planning.

在使用这些数据源时，请注意以下几点：
1. 充分尊重 readme 文件中的项目描述和使用说明，这些内容通常概括了项目的核心功能和目标。
2. 关注源代码文件中的注释和文档字符串，这些内容揭示了代码的设计意图和使用方法。
3. 理解各个模块和文件之间的关系，这有助于构建逻辑清晰、层次分明的文档结构。
4. 注意代码中的关键概念、API 和配置选项，这些内容通常是文档结构的重要组成部分。
5. 综合考虑所有数据源，确保生成的文档结构全面反映项目的实际内容和用户需求。

{{ datasources }}
</datasources>

{% if userContext.openAPISpec %}
<openapi>

**Goal:** Use the provided OpenAPI (Swagger) specification to design how the OpenAPI content and the overall document should be structured together.

**OpenAPI File Content:** 
<openapi_doc>

{{ userContext.openAPISpec }}

</openapi_doc>

---

### **Documentation Requirements and Constraints**

1.  **Section structure and titles:**
    * Create a dedicated top-level section for the OpenAPI content.
    * The section title must be professional and user friendly; **never** include terms such as OpenAPI, Swagger, or file formats. Recommended titles include **"API Interface Reference"** or **"Interface Reference"**.

2.  **Content hierarchy and presentation:**
    * **Ideal state (single-level page):** Prefer to present all API endpoints within **one Markdown file (one page)**.
    * **Split criteria (two-level pages):** Only when the number of endpoints is too large for a single file should you split by OpenAPI tags or logical modules, creating individual Markdown files per module.
    * **Forced file hierarchy constraint:** Whether using one or two levels, the generated API reference files (Markdown) may contain **no more than two levels.**
        * **Example (two-level structure):** `/api-reference.md` (index) -> `/api/user.md`, `/api/order.md` (module pages)
        * **Disallow any third level or deeper structure:** for example, `/api/v1/user/get.md`.

3.  **Mandatory API description constraints (deduplication rule):**
    * **Ensure that for the entire document (including preface, overview, etc.), any introduction to the project APIs appears only within this OpenAPI-generated "API reference" section.**
    * **Never** repeat or extend the API list elsewhere in the document (for example, "Quick Start" or "Architecture Overview" sections).

</openapi>
{% endif %}


<last_document_structure>
projectName: |
  {{projectName}}
projectDesc: |
  {{projectDesc}}

{{originalDocumentStructure}}
</last_document_structure>


{#
TODO: Use following rules for update workflow
<last_document_structure_rule>
If a previous structural plan (last_document_structure) is provided, follow these rules:
  1.  **Feedback Implementation**: The new structural plan **must** correctly implement all changes requested in user feedback.
  2.  **Unrelated Node Stability**: Nodes not mentioned in user feedback **must not have their path or sourcesIds attributes modified**. `path` and `sourcesIds` are critical identifiers linking existing content, and their stability is paramount.
    Ideally, other attributes (such as `title`, `description`) should also remain stable, unless these changes are directly caused by a requested modification or result from DataSource updates.
</last_document_structure_rule>
#}


{% if documentStructure %}
<review_document_structure>
{{ documentStructure }}
</review_document_structure>
{% endif %}


{% if feedback %}
<document_structure_user_feedback>
{{ feedback }}
</document_structure_user_feedback>
{% endif %}


{% if structureReviewFeedback %}
<document_structure_review_feedback>
{{ structureReviewFeedback }}
</document_structure_review_feedback>
{% endif %}

{% if isSubStructure %}
<parent_document>
The current process is planning sub-structures for the following section:

{{parentDocument}}

Sub-structures must meet the following requirements:
- Sub-structures are planned based on DataSources and the parent document's description
- The parent document provides an overview of the planned content, while sub-structures directly plan the specific content to be displayed
- Further break down and comprehensively display the content planned in the parent document
- All sub-structures must have their parentId value set to {{parentDocument.path}}
</parent_document>
{% endif %}

<instructions>
你的任务是基于当前提供的代码仓库部分内容，对现有的文档结构（`last_document_structure`）进行**分析、完善与调整**，生成一份结构性更新计划。
你不是从零开始创建结构，而是**在理解已有结构的基础上进行智能更新**，使文档结构更准确地反映最新的代码内容、架构变化与逻辑关系。

## 工作目标（Objective）

你的输出应为一个包含以下三个部分的结构化变更计划，用于指示如何修改现有文档结构：

- **add**：新增的结构项（数组），可以使用 index 指定插入位置（可选），每个项为一个对象，包含：
  - `index`（可选）：插入位置索引，若不指定则追加到末尾；
  - `item`: 新的结构定义
- **update**：需要修改的结构项（数组），每个项为一个对象，包含：
  - `path`: 指向被更新节点的路径；
  - `update`: 新的结构定义
- **delete**：需要删除的结构项（数组），每个项包含：
  - `path`: 指向要删除节点的路径。

## 行为准则（Behavior Rules）

1. **理解与继承**
   - 充分理解 <last_document_structure> 中的层级逻辑、章节划分与命名风格。
   - 在此基础上进行增量更新，而非全量重写。
   - 保留已有的合理结构，仅在确有依据的情况下进行修改或扩展。

2. **上下文关联分析**
   - 你将获得一部分代码仓库内容（例如部分源文件或目录内容），请分析其**文档价值与结构影响**。
   - 识别哪些部分体现了新的概念、API、模块、配置或功能；
     判断它们是否需要在文档结构中新增或修改对应章节。

3. **结构调整策略**
   - 若新内容补充了现有章节的细节，使用 `update`。
   - 若新内容引入了新的主题、模块或层级，使用 `add`。
   - 若发现结构中已有的章节已不再相关或内容重复，使用 `delete`。
   - 确保新增节点的位置、层级与命名符合文档整体逻辑。

4. **一致性与清晰性**
   - 确保新增或修改的结构项与现有结构风格一致。
   - 每个结构节点（无论新增或更新）应包含：
     - **标题（title）**
     - **一句简要说明（description）**，描述主要内容与目的
   - 保持层次清晰、避免重复、逻辑连贯。

## 能力要求（Key Capabilities）

- **文档结构理解力**：能够准确解析 `last_document_structure` 的层级与语义。
- **增量变更分析**：能基于部分代码内容判断其在整体文档中的结构意义。
- **结构化思维**：能以逻辑层次和语义组织的方式表达新增或更新的节点。
- **审慎修改**：只在必要时变更结构，保持稳定性与演进性。

## 永远遵循的原则

> 你必须在尊重现有结构的前提下，仅基于所提供的新信息进行合理的增量修改，使最终结构始终保持完整、清晰、可扩展。
</instructions>
