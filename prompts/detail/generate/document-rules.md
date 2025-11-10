
<document_rules>

Documentation Generation Rules:
- **Opening Hook Requirement:** The document must begin with a compelling, relaxed, and concise introductory paragraph (The "Hook").
- **Hook Content:** This paragraph must clearly state the specific outcome, knowledge, or skill the reader will gain upon completing the document (Preferably 50 words or less).
- **Hook Variation:** To maintain a natural reading flow and avoid a repetitive pattern, the Hook must be generated using one of the following varied structural approaches:
    1.  **Direct Promise:** Start with a clear "You will achieve..." or "By the end, you'll master..." statement.
    2.  **Question-Led:** Begin by posing a relevant question to engage the reader's interest.
    3.  **Problem/Scenario:** Start by briefly acknowledging a common difficulty (the pain point) and positioning the document's content as the solution.
- When a section contains sub-documents, display only a brief overview and direct users to the sub-documents for detailed information
- Each document section should include: a title, introductory content, multiple subsections, and a summary
- Since API names are already specified in document titles, avoid repeating them in subheadings—use sub-API names directly
- Include links to related documents in the introduction using Markdown format to help users navigate to relevant content
- Add links to further reading materials in the summary section using Markdown format
- **Markdown Syntax Constraint**: Use only GitHub Flavored Markdown (GFM) syntax by default. Prohibited extensions include: custom blocks `:::`, footnotes `[^1]: notes`, math formulas `$$ LaTeX`, highlighted text `==code==`, and other non-GFM syntax unless explicitly defined in custom component rules
- Use proper Markdown link syntax, for example: [Next Chapter Title](next_chapter_path)
- **Ensure next_chapter_path references either external URLs or valid paths from the documentation structure**—use absolute paths from the documentation structure
- When detailDataSource includes third-party links, incorporate them appropriately throughout the document
- Structure each section with: title, introduction, code examples, response data samples, and explanatory notes. Place explanations directly after code examples without separate "Example Description" subheadings
- Maintain content completeness and logical flow so users can follow the documentation seamlessly
- Provide comprehensive explanations for configuration options and parameters. When parameters accept multiple values, explain each option's purpose and include code examples where applicable
- All interface and method documentation must include **response data examples**
- **Use `<x-field-group>` for all structured data**: Represent objects with nested `<x-field>` elements, and expand each structure to the **deepest relevant level**.
- **Enhance field descriptions with example values**: For structured data defined using `<x-field-group>`, extract example values from type definitions, comments, or test cases to make documentation more practical and user-friendly.
- **Use Markdown tables** for predefined values (e.g., status types, options) or term definitions to improve clarity and allow side-by-side comparison.
- Validate output Markdown for completeness, ensuring tables are properly formatted
- **Content Integrity**: Generate complete, syntactically correct code blocks (JSON, etc.). Perform self-validation to ensure all code blocks, lists, and tables are properly closed without truncation
- **Markdown Syntax Validation**: Ensure correct Markdown formatting, particularly table separators (e.g., `|---|---|---|`) that match column counts
- Use README files for reference only—extract the most current and comprehensive information directly from source code
- Omit tag information from document headers as it's processed programmatically
- Parse `jsx` syntax correctly when present in code samples
  {% include "../jsx/rules.md" %}

</document_rules>

<tone_style>
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
</tone_style>
