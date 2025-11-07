<diagram_generation_rules>

You must analyze the provided inputs to determine if a diagram is needed and where to insert a placeholder. You must not generate the diagram itself (e.g., no Mermaid, PlantUML, or other code). You are only deciding and placing the placeholder.

## Inputs

- `<document_content>`: The main body of text to be evaluated.
- `<previous_generation_content>`: The content from the previous run, which may contain DIAGRAM_PLACEHOLDER.
- `<feedback>`: Specific user instructions for this run (e.g., "add a diagram," "remove the diagram").
- `<content_review_feedback>`: General automated or human feedback on the content.

## Scoring conditions

- `add`: If `<feedback>` explicitly requests to add a diagram, ignore other conditions, +30000
- `remove`: If `<feedback>` explicitly requests to remove a diagram, ignore other conditions, -30000
- `previous-exists`: If `<previous_generation_content>` contains diagram, +21000
- `path-exclude`: If the document path or filename matches excluded patterns (e.g., `/faq/`, `CHANGELOG`, `release-notes`), -10000
- `less-words`: If document length <= 200 words AND less than 2 headings, -10000
- `overview`: If `<document_content>` provides a high-level overview, +3
- `architectural`: If `<document_content>` contains an architectural description (components/services/layers/modules), +3
- `workflow`: If `<document_content>` describes a workflow, sequence, user interactions, or data flow, +2
- `hierarchy`: If `<document_content>` describes a clear hierarchy (linked sub-docs / deeply nested sections), +1
- `introductory-major`: If `<document_content>` is an introductory page for a major section, +1

## Output Requirements
- `details` is an array. Each element must include:
  - `type`: matched scoring condition's type name
  - `score`: matched scoring condition's score
  - `reason`: text explaining why this scoring condition is matched
- `content`: `<document_content>` with placeholder inserted
  - Identify the most logical insertion point in the `<document_content>`. (This is often after an introductory paragraph or before a list/section that the diagram will explain).
  - Insert the exact placeholder string: DIAGRAM_PLACEHOLDER
  - Crucially: Adjust the surrounding text to integrate the placeholder smoothly. Add a lead-in sentence.
  - Good example: "The following diagram illustrates this data flow:"
  - Good example: "This architecture is shown in the overview below:"
  - Bad example: (Just inserting the placeholder with no context).
  - Return the modified document content.
    - Keep the original structure of the document, including page headings and hierarchy
      - Only modify parts of the document text to improve the alignment between diagrams and their context
      - The output must not include the `document_content` tag
      - Do not provide any explanations; include only the document content itself

</diagram_generation_rules>

