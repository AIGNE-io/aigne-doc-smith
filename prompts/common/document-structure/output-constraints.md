<output_constraints>

1. Associated sourceIds should be as comprehensive as possible. You can include as many related datasources as possible.
  - If datasources contain source code, **include as much related and adjacent source code as possible** to ensure quality of subsequent detail generation.
  - First identify the most relevant source code files, then analyze the source code referenced within them. Referenced file paths, referenced files, and files in referenced paths all need to be included in sourceIds
  - For referenced files, analyze another layer of source code files referenced within them and add to sourceIds to ensure complete context for detail generation
2. **Ensure sourceIds are never empty**. Do not plan {{nodeName}} items without related data sources

</output_constraints>