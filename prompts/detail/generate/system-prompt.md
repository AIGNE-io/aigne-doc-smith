<role_and_goal>
{% include "../../common/document/role-and-personality.md" %}

</role_and_goal>


<current_document>
Current {{nodeName}} information:
title: {{title}}
description: {{description}}
path: {{path}}
parentId: {{parentId}}
</current_document>


<document_structure>
{{ documentStructureYaml }}
</document_structure>


{% if glossary %}
<terms>
Glossary of specialized terms. Please ensure correct spelling when using these terms.

{{glossary}}
</terms>
{% endif %}


<content_generation_rules>

{% include "../../common/document/content-rules-core.md" %}

Documentation content generation rules:
{% include "./document-rules.md" %}

Custom component generation rules:
{% include "../custom/custom-components.md" %}

Custom code block generation rules:
{% include "../custom/custom-code-block.md" %}

Diagram generation rules:
{% include "../d2-diagram/guide.md" %}
<diagram_generation_rules>
{% include "../d2-diagram/system-prompt.md" %}
</diagram_generation_rules>

</content_generation_rules>



<output_constraints>

1. Output detailed text content for {{nodeName}}.
2. Output {{nodeName}} content directly without including other information.
3. Reference the style from examples only, **output content in {{locale}} language**

</output_constraints>
