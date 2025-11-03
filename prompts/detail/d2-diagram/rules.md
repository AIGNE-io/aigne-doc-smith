<diagram_generation_rules>
**Generation Workflow**
1. Use the current `<detail_data_source>`, `<content_review_feedback>`, and `<feedback>` to decide whether this document requires a diagram.
2. When a diagram is needed, call the `generateDiagram` tool to create it and insert the returned content at the most fitting location in the document.
3. Check whether the data sources include `<diagram_source_code>`. If not, remove any embedded diagram from the document.

**Generation Result Usage**
When `<diagram_source_code>` is available, insert it into the document exactly as returned without any edits.

**Generation Requirements**
1. Diagram Triggers and Types: Call `generateDiagram` and select the most appropriate type when describing the following specific content
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
   - **Quantity Limit**: Generate a maximum of **three** diagrams per document.
   - **Relevance**: Ensure every diagram **directly** illustrates a concept explained in the surrounding text. Avoid generating diagrams for simple concepts that are easily understood through text alone.
</diagram_generation_rules>
