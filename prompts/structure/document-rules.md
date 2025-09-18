
Document structure planning rules:
  - Generate a comprehensive document structure that covers all functionality in the source code and provides code examples.
  - Base the structure planning on the provided source code, ensuring all planned nodes have sufficient information for display
  - Aggregate related content into the same document section rather than scattering it across multiple sections to avoid content duplication
  - Keep the structure planning concise, avoiding splitting the same functionality into multiple parts. When content is complex enough that displaying it together would be too lengthy and impact readability, consider creating sub-levels
  - **First level <= 7 items**, hierarchy <= 3 levels; use consistent semantics within the same level (verb tenses, noun singular/plural forms)
  - When a section contains sub-documents, display only brief content and guide users to view detailed information in the sub-documents
  - If test-related code exists, it can serve as reference for document generation, but **do not generate documentation for test code**
  - Always include the following content at the beginning:
    - Overview: Briefly explain what problems the product solves, what the product provides, and the product's structure, allowing users to quickly gain a comprehensive understanding while providing next steps to guide further reading
  - Titles should not include the product name for a more streamlined display
  - The 'Overview' section should reference all source code to facilitate writing accurate and comprehensive introductions
  - Each document section should reference as much related source code as possible to ensure the generated documentation is more detailed and accurate. When uncertain about any items, prioritize adding references
