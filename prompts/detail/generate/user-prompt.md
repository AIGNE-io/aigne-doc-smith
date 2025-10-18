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
OpenAPI doc for this project, this **MUST be used** to increase the presentation of the document.
<openapi_doc>
{{ openAPIDoc }}
</openapi_doc>
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
