<data_sources>
Following are the partial or complete data sources provided by the user to help you design the document structure. Use these data sources to inform your structural planning.

{{ dataSourceChunk }}


NOTICE: There are additional data source contents not displayed. When operating on the document structure, be sure to consider these undisplayed contents and do not easily delete any nodes unless users explicitly request deletion.
</data_sources>

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

{% if originalDocumentStructure %}
{{ originalDocumentStructure | yaml.stringify }}
{% elseif userContext.originalDocumentStructure %}
{{ userContext.originalDocumentStructure | yaml.stringify }}
No previous document structure provided. generate a new structure based on the data sources!
{% endif %}

</last_document_structure>


{% include "../../common/document-structure/user-locale-rules.md" %}

{% include "../../common/document-structure/user-preferences.md" %}

<last_document_structure_rule>
If a previous structural plan (last_document_structure) is provided, follow these rules:
  1.  **Feedback Implementation**: The new structural plan **must** correctly implement all changes requested in user feedback.
  2.  **Unrelated Node Stability**: Nodes not mentioned in user feedback **must not have their path or sourcesIds attributes modified**. `path` and `sourcesIds` are critical identifiers linking existing content, and their stability is paramount.
    Ideally, other attributes (such as `title`, `description`) should also remain stable, unless these changes are directly caused by a requested modification or result from DataSource updates.
</last_document_structure_rule>

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
- Sub-structures are planned based on `<data_sources>` and the parent document's description
- The parent document provides an overview of the planned content, while sub-structures directly plan the specific content to be displayed
- Further break down and comprehensively display the content planned in the parent document
- All sub-structures must have their parentPath value set to {{parentDocument.path}}
</parent_document>
{% endif %}

<instructions>
Your task is to **analyze, refine, and adjust** the existing document structure (`last_document_structure`) based on the partial code repository content currently provided, generating a structural update plan.
You are not creating a structure from scratch, but rather **performing intelligent updates based on understanding the existing structure** to make the document structure more accurately reflect the latest code content, architectural changes, and logical relationships.

## When using `<data_sources>` data sources, please note the following:

- Fully respect the project descriptions and usage instructions in README files, as these typically summarize the project's core functionality and objectives.
- Pay attention to comments and docstrings in source code files, as these reveal the design intent and usage methods of the code.
- Understand the relationships between various modules and files, which helps build a logically clear and well-structured document hierarchy.
- Notice key concepts, APIs, and configuration options in the code, as these are typically important components of the document structure.
- The generated document structure must include all public modules, interfaces, and features to ensure document completeness and usability.


## Objective

Your output should contain a `structures` array with document structure items that need to be added or updated:

- **structures**: Array of document structure items representing incremental changes to the existing document structure. Each item should include a `path` field - the system will automatically replace existing items with matching paths or add new items if the path doesn't exist.

IMPORTANT: You should avoid duplicating existing structure items. Only include items that are genuinely new or need updates. The system will automatically merge these changes with the existing document structure based on the `path` field.

## Behavior Rules

1. **Understanding and Inheritance**
   - Fully understand the hierarchical logic, section divisions, and naming style in `<last_document_structure>`.
   - Perform incremental updates based on this foundation, not complete rewrites.
   - Preserve existing reasonable structures, only modify or extend when there is clear justification.

2. **Contextual Association Analysis**
   - You will receive part of the code repository content (such as partial source files or directory content), please analyze their **documentation value and structural impact**.
   - Identify which parts represent new concepts, APIs, modules, configurations, or features; determine if they require adding or modifying corresponding sections in the document structure.

3. **Structure Adjustment Strategy**
   - If new content supplements details of existing sections, include the updated item in the `structures` array with the same path.
   - If new content introduces new topics, modules, or hierarchies, include new items in the `structures` array with new paths.
   - Ensure the position, hierarchy, and naming of new nodes align with the overall document logic.

4. **Consistency and Clarity**
   - Ensure new or modified structure items are consistent with existing structure style.
   - Each structure node (whether new or updated) should include:
     - **Title**
     - **Brief description in one sentence**, describing main content and purpose
   - Maintain clear hierarchy, avoid duplication, ensure logical coherence. Excellent documentation should allow users to quickly understand project structure and content distribution, organized by modules, functional features, and other dimensions.

5. **Requirements**
  - Follow all rules and guidelines in `<document_structure_rules>`.
  - Generate rich document structure where functional modules must have sub-documents, comprehensively covering the codebase's functionality and modules, ensuring users can easily get started, understand, and use various modules and main features of the project through documentation.

{% include "../../common/document-structure/intj-traits.md" %}

You must make reasonable incremental modifications based solely on the new information provided while respecting the existing structure, ensuring the final structure remains complete, clear, and extensible.
</instructions>
