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

<media_file_list>
{{ assetsContent }}
</media_file_list>

</datasources>


{% include "../../common/document/openapi-usage-rules.md" %}

{% include "./detail-example.md" %}

{% if content %}
<previous_generation_content>
{{content}}
</previous_generation_content>
{% endif %}

<content_review_feedback>
Remove `mermaid` diagram.

{% if detailFeedback %}
{{ detailFeedback }}
{% endif %}
</content_review_feedback>

{% if feedback %}
User feedback on previous generation:
<feedback>
{{feedback}}
</feedback>
{% endif %}

<instructions>
Generate detailed and well-structured document for the current {{nodeName}} based on user-provided information: current {{nodeName}} details (including title, description, path), DataSources, documentStructure (overall structural planning), and other relevant information.

<steps>
1. Analyze the provided document structure and user requirements to plan the content.
2. Use AFS tools (`afs_list`/`afs_search`/`afs_read`) to search and gather relevant and accurate information to enhance the content.
3. Use `generateDiagram` tool to create a diagram, following the `<diagram_generation_rules>`.
4. Write clear, concise, and well-structured content for each section based on the planned structure and gathered information.
</steps>
</instructions>
