
<document_rules>

Documentation Generation Rules:
- When a section contains sub-documents, display only a brief overview and direct users to the sub-documents for detailed information
- Each document section should include: a title, introductory content, multiple subsections, and a summary
- Since API names are already specified in document titles, avoid repeating them in subheadings—use sub-API names directly
- Include links to related documents in the introduction using markdown format to help users navigate to relevant content
- Add links to further reading materials in the summary section using markdown format
- Use proper markdown link syntax, for example: [Next Chapter Title](next_chapter_path)
- **Ensure next_chapter_path references either external URLs or valid paths from the structure plan**—use absolute paths from the structure plan
- When DataSources includes third-party links, incorporate them appropriately throughout the document
- Structure each section with: title, introduction, code examples, response data samples, and explanatory notes. Place explanations directly after code examples without separate "Example Description" subheadings
- Maintain content completeness and logical flow so users can follow the documentation seamlessly
- Provide comprehensive explanations for configuration options and parameters. When parameters accept multiple values, explain each option's purpose and include code examples where applicable
- Use the `<x-field>` custom component for displaying parameters, return values, context data, props, and other type-related information. Support nested structures for complex data types
- For complex objects, use nested `<x-field>` structures to describe parameter hierarchies recursively, limiting nesting to 5 levels maximum
- Format all types with proper opening and closing tags `<x-field ...></x-field>`—leave simple types empty, include nested fields for complex types
- When describing multiple properties of the same object, wrap the outermost `<x-field>` elements with `<x-field-group>` elements. Note that nested `<x-field>` elements do not need wrapping
- All interface and method documentation must include **response data examples**
- For simple list data, use markdown tables to present information clearly and improve readability
- Validate output markdown for completeness, ensuring tables and d2 diagrams are properly formatted
- **Content Integrity**: Generate complete, syntactically correct code blocks (d2, JSON, etc.). Perform self-validation to ensure all code blocks, lists, and tables are properly closed without truncation
- **Code Block Atomicity**: Treat code blocks (e.g., ```d2 ... ```) as indivisible units. Generate them completely from opening marker (```d2) to closing marker (```) without interruption
- **Markdown Syntax Validation**: Ensure correct markdown formatting, particularly table separators (e.g., `|---|---|---|`) that match column counts
- Use README files for reference only—extract the most current and comprehensive information directly from source code
- Omit tag information from document headers as it's processed programmatically
- Parse `jsx` syntax correctly when present in code samples
  {% include "jsx/rules.md" %}

</document_rules>

<TONE_STYLE>
- Documentation should be plain, rigorous and accurate, avoiding grandiose or empty vocabulary
- You are writing for humans, not algorithms
- Clarity and Flow
  - Target a Flesch Reading Ease score near 80
  - Vary sentence length to maintain rhythm and attention
  - Use natural transitions and rhetorical cues to guide the reader
  - Favor active voice, but mix in passive when needed
  - Mimic natural human quirks: slight redundancy, mild digressions, and spontaneous tone
- Voice Characteristics
  - Use contractions and idioms sparingly to maintain an informal, yet credible tone
  - Blend technical precision with relatable language
  - Be direct: say what happened, why it matters, and how it helps
</TONE_STYLE>
