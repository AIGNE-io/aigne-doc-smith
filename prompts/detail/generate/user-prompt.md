<user_locale>
{{ locale }}
</user_locale>

<user_rules>
{{ rules }}

** Output content in {{ locale }} language. **

</user_rules>

{% set operation_type = "generating" %}
{% include "../../common/document/user-preferences.md" %}

<detail_data_source>
{{ detailDataSource }}

{{ additionalInformation }}

{% if assetsContent %}
<media_file_list>
{{ assetsContent }}
</media_file_list>
{% endif %}

</detail_data_source>

{% if openAPISpec %}
<openapi_spec_content>

## OpenAPI File Content
{{ openAPISpec }}

</openapi_spec_content>
{% endif %}

{% include "./detail-example.md" %}

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

{% if content or originalContent %}
{% set previousContent = content or originalContent %}

<previous_generation_content>
{{previousContent}}
</previous_generation_content>

<instructions>
Analyze the user feedback carefully.

{% if intentType and intentType in ["addDiagram", "updateDiagram", "deleteDiagram"] %}
**CRITICAL INSTRUCTION FOR DIAGRAM/IMAGE UPDATES:**
The user intent is to {{ intentType }} (diagram-related operation). You MUST:
1. **DO NOT** change the text content.
2. **DO NOT** rewrite, summarize, or "improve" the existing text.
3. **DO NOT** use any search tools.
4. **OUTPUT the `previous_generation_content` VERBATIM (exactly as is).**
   The system has a dedicated downstream agent that will handle the image generation based on your output. Your job is to preserve the text so the image agent can work on the same context.
{% else %}
**CRITICAL INSTRUCTION FOR DIAGRAM/IMAGE UPDATES:**
If the user feedback is ONLY about updating diagrams, images, or visual styles (e.g., "update diagram", "change image", "use 16:9 ratio", "fix flowchart") and does NOT explicitly ask for text changes:
1. **DO NOT** change the text content.
2. **DO NOT** rewrite, summarize, or "improve" the existing text.
3. **DO NOT** use any search tools.
4. **OUTPUT the `previous_generation_content` VERBATIM (exactly as is).**
   The system has a dedicated downstream agent that will handle the image generation based on your output. Your job is to preserve the text so the image agent can work on the same context.

Only if the feedback explicitly requests changes to the text content (e.g., "fix typo", "rewrite introduction", "add info"):
1. Analyze the previous document content and user feedback.
2. Use available tools to implement the requested improvements.
3. Maintain the document's integrity and style.
{% endif %}
</instructions>

{% else %}

<instructions>
Generate detailed and well-structured document for the current {{nodeName}} based on user-provided information: current {{nodeName}} details (including title, description, path), `<detail_data_source>`, `<document_structure>` (overall structural planning), and other relevant information.

<steps>
1. Analyze the provided document structure and user requirements to plan the content.
2. Use AFS tools (`afs_list`/`afs_search`/`afs_read`) to search and gather relevant and accurate information to enhance the content.
3. Write clear, concise, and well-structured content for each section based on the planned structure and gathered information.
</steps>
</instructions>

{% endif %}

