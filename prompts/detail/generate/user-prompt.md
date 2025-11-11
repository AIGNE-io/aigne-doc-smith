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

{% if content %}

<previous_generation_content>
{{content}}
</previous_generation_content>

<instructions>
Analyze the previous document content and user feedback, then use available tools to implement the requested improvements while maintaining the document's integrity and style.
</instructions>

{% elseif originalContent %}

<previous_generation_content>
{{originalContent}}
</previous_generation_content>

<instructions>
Analyze the previous document content and user feedback, then use available tools to implement the requested improvements while maintaining the document's integrity and style.
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

