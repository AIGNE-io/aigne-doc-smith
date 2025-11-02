Follow the given rules and ISTJ style from your system instructions.

Generate a d2 diagram that represents the following document content:

<user_locale>
{{ locale }}
</user_locale>

<user_rules>

- Output only the diagram labels and text in the {{ locale }} language — keep all variable names, component names, and syntax unchanged.

</user_rules>

<diagram_rules>

1. Diagram Triggers and Types: Select the most appropriate type when describing the following specific content
   - Architecture Diagram (High-Level)
     - **Trigger**: When the document provides a high-level overview of a system, project, or the overall documentation set.
     - **Content**: Must illustrate the main components, their relationships, and the overall structure.
   - Structural Diagram (Module-Level)
     - **Trigger**: When generating the introductory document for a major section or module.
     - **Content**: Must show the key sub-components, files, or core concepts within that specific module.
   - Process and Interaction Diagrams (Detailed)
     - **Trigger**: When the document describes a workflow, a sequence of events, user interactions, or data flow.
     - **Diagram Type Selection**:
       - **Flowchart**: Use for step-by-step processes, algorithms, or decision-making logic.
       - **Sequence Diagram**: Use for time-ordered interactions between different components or actors (e.g., API calls).
2. Constraints and Best Practices
   - **Keep it Simple**: Avoid overcomplicating the diagram.
   - **Relevance**: Ensure every diagram **directly** illustrates a concept explained in the surrounding text. Avoid generating diagrams for simple concepts that are easily understood through text alone.

</diagram_rules>

<document_content>
{{documentContent}}
</document_content>

{% if diagramError %}
<diagram_check_feedback>

**Diagram generation error**
{{ diagramError }}

</diagram_check_feedback>
{% endif %}
