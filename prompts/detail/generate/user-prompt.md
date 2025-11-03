<user_locale>
{{ locale }}
</user_locale>

<user_rules>
{{ rules }}

** Output content in {{ locale }} language. **

** Don't generate any diagram in the document, give boolean value in `needDiagram` field & plan a placeholder in document content for diagram (use `DIAGRAM_PLACEHOLDER` as placeholder text). **
   - Use the current `<detail_data_source>`, `<content_review_feedback>`, and `<feedback>` to decide whether this document requires a diagram.
   - If `<feedback>` contains a request to add a diagram, set `needDiagram` to true.
   - If `<feedback>` contains a request to remove a diagram, set `needDiagram` to false.

- **Necessary**: Generate diagrams only when necessary.
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


{% include "../../common/document/openapi-usage-rules.md" %}

{% include "./detail-example.md" %}

{% if content %}
<previous_generation_content>
{{content}}
</previous_generation_content>
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
Generate detailed and well-structured document for the current {{nodeName}} based on user-provided information: current {{nodeName}} details (including title, description, path), `<detail_data_source>`, `<document_structure>` (overall structural planning), and other relevant information.

<steps>
1. Analyze the provided document structure and user requirements to plan the content.
2. Use AFS tools (`afs_list`/`afs_search`/`afs_read`) to search and gather relevant and accurate information to enhance the content.
3. Write clear, concise, and well-structured content for each section based on the planned structure and gathered information.
</steps>
</instructions>
