Follow the given rules and ISTJ style from your system instructions.

Generate a d2 diagram that represents the following document content:

<user_locale>
{{ locale }}
</user_locale>

<user_rules>

- Output only the diagram labels and text in the {{ locale }} language — keep all variable names, component names, and syntax unchanged.
{% if previousDiagramContent %}
- Update the diagram based on `<feedback>` and `<previous_diagram_content>`.
{% endif %}

</user_rules>

<document_content>
{{documentContent}}
</document_content>

{% if diagramError %}
<diagram_check_feedback>

**Diagram generation error**
{{ diagramError }}

</diagram_check_feedback>
{% endif %}

{% if previousDiagramContent %}
<previous_diagram_content>
{{ previousDiagramContent }}
</previous_diagram_content>

{% if feedback %}
<feedback>
{{ feedback }}
</feedback>
{% endif %}

{% endif %}

