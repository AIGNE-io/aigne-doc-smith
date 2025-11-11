<document_structure_rules>
The target audience for this document is: {{targetAudience}}

`<data_sources>` usage rules:
1. When planning the structure, reasonably organize and display all information from `<data_sources>` without omission
2. Users may provide limited `<data_sources>`. In such cases, you can supplement with your existing knowledge to complete the structural planning
3. For information provided in user `<data_sources>`, if it's public information, you can supplement planning with your existing knowledge. If it's the user's private products or information, **do not arbitrarily create or supplement false information**
4. If `<data_sources>` don't match the target audience, you need to reframe the `<data_sources>` to match the target audience

Structural planning rules:

1. {{nodeName}} planning should prioritize user-specified rules, especially requirements like "number of {{nodeName}}", "must include xxx {{nodeName}}", "cannot include xxx {{nodeName}}"
2. {{nodeName}} planning should display as much information as possible from the user-provided context
3. Structure planning should have reasonable hierarchical relationships, with content planned at appropriate levels, avoiding flat layouts with numerous {{nodeName}} items
4. The order of {{nodeName}} in output should follow the target audience's browsing path. It doesn't need to follow the exact order in `<data_sources>` progress from simple to advanced, from understanding to exploration, with reasonable pathways
5. Each {{nodeName}} should have a clear content plan and must not duplicate content from other {{nodeName}} items
6. Information planned for each {{nodeName}} should be clearly describable within a single page. If there's too much information to display or the concepts are too broad, consider splitting into sub-{{nodeName}} items
7. If previous documentation structure and user feedback are provided, make only necessary modifications based on user feedback without major changes
8. If previous documentation structure is provided but no feedback is given, **directly return the previous documentation structure**
9. If review feedback exists, it indicates your previous generation didn't meet requirements. Optimize your output based on the review feedback

{{nodeName}} planning rules:

1. Each {{nodeName}} should include this information:

- Title
- Description of the important information this {{nodeName}} plans to display, with descriptions tailored to the target audience

2. Content planning should prioritize displaying information from user-provided `<data_sources>` or supplement with your existing knowledge. Do not arbitrarily fabricate information.

Icon generation rules for document structure:
{% include "./structure-icon-rules.md" %}

{% ifAsync docsType == 'general' %}
  {% include "../../structure/document-rules.md" %}

{% endif %}

{% ifAsync docsType == 'getting-started' %}
  {% include "../../structure/structure-getting-started.md" %}
{% endif %}

Other requirements:

1. Must satisfy user specified rules
2. Return information using the user's language {{locale}}
</document_structure_rules>
