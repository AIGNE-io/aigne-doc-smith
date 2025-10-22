<user_locale>
{{ locale }}
</user_locale>


<user_rules>
{{ rules }}

** Output content in {{ locale }} language **
</user_rules>


{% set operation_type = "generating" %}
{% include "../../common/document/user-preferences.md" %}


<datasources>
{{ detailDataSources }}

{{ additionalInformation }}

<media_list>
{{ assetsContent }}
</media_list>

{% include "../../common/document/media-handling-rules.md" %}

</datasources>

{% if openAPIDoc %}
<openapi>

**Goal:** Using the provided OpenAPI (Swagger) document and the current page's purpose, intelligently leverage the OpenAPI content to improve the current documentation page.

**OpenAPI document content:**
<openapi_doc>

{{ openAPIDoc }}

</openapi_doc>

---

### **Documentation generation requirements and constraints**

1.  **Core content extraction:**
    * For each endpoint (Path Item), clearly include the following:
        * HTTP method and path (Method Path)
        * Short summary (Summary)
        * Detailed description (Description)
        * Request parameters (Parameters): include name, location (in), type, required, description
        * Request body (Request Body): if present, describe its schema
        * Responses: include main status codes (e.g., 200, 201, 400, 500) and their schemas

2.  **De-duplication constraint for Prompt API descriptions:**
    * **Ensure the project's API introduction (in any preface, overview, etc.) appears only once — inside the API Reference section generated from the OpenAPI.**
    * **Do not repeat or add API listings or descriptions anywhere else in the documentation (for example, in "Quick Start" or "Architecture Overview").**

---

**Expected output format:** concise, clear, and easy-to-scan Markdown documentation.

</openapi>
{% endif %}


{% include "./detail-example.md" %}


{% if content %}
Content from previous generation:
<last_content>
{{content}}
</last_content>
{% endif %}


{% if detailFeedback %}
<content_review_feedback>
{{ detailFeedback }}
</content_review_feedback>
{% endif %}


{% if feedback %}
User feedback on previous generation:
<feedback>
{{feedback}}
</feedback>
{% endif %}


<instructions>
Generate detailed and well-structured document for the current {{nodeName}} based on user-provided information: current {{nodeName}} details (including title, description, path), DataSources, documentStructure (overall structural planning), and other relevant information.

YOU SHOULD:
- Use AFS tools `afs_list` `afs_search` or `afs_read` to gather relevant and accurate information to enhance the content.
- Follow rules in `<diagram_generation_guide>`: use `generateDiagram` tool to create and embed a diagram when appropriate, following the diagram generation guidelines.

<steps>
1. Analyze the provided document structure and user requirements to plan the content.
2. Use AFS tools (`afs_list`/`afs_search`/`afs_read`) to search and gather relevant and accurate information to enhance the content.
3. Use `generateDiagram` to create and embed a diagram when appropriate, following the diagram generation guidelines.
4. Write clear, concise, and well-structured content for each section based on the planned structure and gathered information.
</steps>
</instructions>
