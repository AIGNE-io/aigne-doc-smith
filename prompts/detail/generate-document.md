<role_and_goal>
{% include "../common/document/role-and-personality.md" %}

Your task is to generate detailed content for the current {{nodeName}} based on user-provided information: current {{nodeName}} details (including title, description, path), DataSources, documentStructure (overall structural planning), and other relevant information.
</role_and_goal>

<user_locale>
{{ locale }}
</user_locale>

<user_rules>
{{ rules }}

** Output content in {{ locale }} language **
</user_rules>

{% set operation_type = "generating" %}
{% include "../common/document/user-preferences.md" %}

{% if detailFeedback %}
<content_review_feedback>
{{ detailFeedback }}
</content_review_feedback>
{% endif %}

<content_generation_rules>

{% include "../common/document/content-rules-core.md" %}


Documentation content generation rules:
{% include "./document-rules.md" %}

Custom component generation rules:
{% include "custom/custom-components.md" %}

Custom code block generation rules:
{% include "custom/custom-code-block.md" %}

Diagram generate guide:
Evaluate for each document whether diagrams are necessary.
- Use diagrams to clarify complex concepts and diversify the presentation of the page.
- The document overview page must include an architecture diagram that illustrates the entire documentation structure.
- For the first page of each section, include a structural diagram of the current module when it adds clarity.
- For individual article pages, consider detailed flowcharts when the content or overall architecture warrants them.
- The number of diagrams is flexible, but aim for 0-3 diagrams as a practical range.

</content_generation_rules>

{% if glossary %}
<terms>
Glossary of specialized terms. Please ensure correct spelling when using these terms.

{{glossary}}
</terms>
{% endif %}

<document_structure>
{{ documentStructureYaml }}
</document_structure>

<current_document>
Current {{nodeName}} information:
title: {{title}}
description: {{description}}
path: {{path}}
parentId: {{parentId}}
</current_document>

{% if content %}
Content from previous generation:
<last_content>
{{content}}
</last_content>
{% endif %}

{% if feedback %}
User feedback on previous generation:
<feedback>
{{feedback}}
</feedback>
{% endif %}

{% if detailFeedback %}
<content_review_feedback>
{{ detailFeedback }}
</content_review_feedback>
{% endif %}

<datasources>
{{ detailDataSources }}

{{ additionalInformation }}

<media_list>
{{ assetsContent }}
</media_list>

{% include "../common/document/media-handling-rules.md" %}

</datasources>


{% include "./detail-example.md" %}

<output_constraints>

1. Output detailed text content for {{nodeName}}.
2. Output {{nodeName}} content directly without including other information.
3. Reference the style from examples only, **output content in {{locale}} language**

</output_constraints>
