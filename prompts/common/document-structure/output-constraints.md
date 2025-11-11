<output_constraints>

1. Associated sourceIds should be as comprehensive as possible. You can include as many related `<data_sources>` as possible.
  - If `<data_sources>` contain source code, **include as much related and adjacent source code as possible** to ensure quality of subsequent detail generation.
  - First identify the most relevant source code files, then analyze the source code referenced within them. Referenced file paths, referenced files, and files in referenced paths all need to be included in sourceIds
  - For referenced files, analyze another layer of source code files referenced within them and add to sourceIds to ensure complete context for detail generation
2. **Ensure sourceIds are never empty**. Do not plan {{nodeName}} items without related data sources

3. **Project Information Length Constraints:**
   - `projectName`: Must not exceed **40 characters** (counted as character length, regardless of language - Chinese, English, Russian, etc.). Keep it concise and clear. Generate a complete, meaningful name within this limit.
   - `projectDesc`: Must not exceed **160 characters** (counted as character length, regardless of language - Chinese, English, Russian, etc.). Provide a brief, informative description. Generate a complete, coherent description within this limit.
   - **Character counting rules:**
     - Count all characters equally (Chinese, English, Russian, etc. - each character counts as 1)
     - Spaces in the middle of the text count toward the character limit
     - Leading and trailing spaces will be automatically removed, so do not include them
   - **Important**: These are hard limits. Ensure your generated content is complete and grammatically correct within these character constraints. Do not generate content that would need truncation.

</output_constraints>
