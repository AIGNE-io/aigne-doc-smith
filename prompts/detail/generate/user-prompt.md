<user_locale>
{{ locale }}
</user_locale>

<user_rules>
{{ rules }}

** Output content in {{ locale }} language. **

** Don't generate any diagram in the document, give boolean value in `needDiagram` field & plan a placeholder in document content for diagram (use `DIAGRAM_PLACEHOLDER` as placeholder text). **

- **Necessary**: Generate diagrams only when necessary.
</user_rules>

{% set operation_type = "generating" %}
{% include "../../common/document/user-preferences.md" %}

<detail_dataSource>
{{ detailDataSource }}

{{ additionalInformation }}

<media_file_list>
{{ assetsContent }}
</media_file_list>

</detail_dataSource>


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
Generate detailed and well-structured document for the current {{nodeName}} based on user-provided information: current {{nodeName}} details (including title, description, path), detailDataSource, documentStructure (overall structural planning), and other relevant information.

<steps>
1. Analyze the provided document structure and user requirements to plan the content.
2. Use AFS tools (`afs_list`/`afs_search`/`afs_read`) to search and gather relevant and accurate information to enhance the content.
3. Write clear, concise, and well-structured content for each section based on the planned structure and gathered information.
</steps>
</instructions>
