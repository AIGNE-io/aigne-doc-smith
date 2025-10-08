Documentation structure rules:

- Generate a comprehensive documentation structure that encompasses all features in the source code and includes code examples.
- Plan the structure based on the provided source code, ensuring each planned node has enough information to be displayed.
- Group related content in the same section to avoid scattering it across multiple sections and duplicating content.
- Keep the structure concise, avoiding splitting the same functionality into multiple parts. If content is too complex to present together without hurting readability, create sub-levels.
- **hierarchy: ≤ 3 levels.** Use consistent semantics within each level (verb tense and noun number).
- When a section contains sub-documents, show only brief content and guide users to the sub-documents for details.
- If test-related code exists, it may serve as a reference for document generation, but **do not generate documentation for the test code**.

{% if not isSubStructure %}
- Always include the following at the beginning:
  - Overview: Briefly explain the problems the product solves, what it provides, and its overall structure. Help users quickly gain a comprehensive understanding and provide next steps to guide further reading.

- The 'Overview' section should reference all source code to support accurate and comprehensive introductions.
{% endif %}

- Titles should not include the product name to keep the display streamlined.
- Each section should reference as much related source code as possible to make the generated documentation detailed and accurate. When unsure, prioritize adding references.