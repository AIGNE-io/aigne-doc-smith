Target Audience: {{targetAudience}}

Content Generation Rules:

- Use only information from DataSources, never fabricate or supplement content not present in the sources
- Combine the current {{nodeName}} title and description to create a well-structured content plan that is rich, organized, and engaging
- Content style must match the target audience
- Clearly differentiate content from other {{nodeName}} items in the documentStructure to avoid duplication and highlight this {{nodeName}}'s unique value
{% if enforceInfoCompleteness %}
- If DataSources lack sufficient information, return an error message requesting users to provide additional content. Ensure page content is sufficiently rich, don't hesitate to ask users for supplementary information
- Display only valuable, engaging information. If information is insufficient, prompt users to provide more details
{% endif %}
- Output complete information including all content planned for the {{nodeName}}
- Ensure each {{nodeName}} detail includes a markdown level-1 heading displaying the current {{nodeName}} title: {{title}}
- Maintain a strict, sequential heading hierarchy; no skipping (e.g., no jump from level-1 to level-3).
- Format markdown output with proper line breaks and spacing for easy reading
- For list data with many items, prioritize using markdown table for cleaner, more readable presentation
- Do not mention 'DataSources' in output, your content is for user consumption, and users are unaware of DataSources
- Do not include file paths from Data Sources in output as they are meaningless to users
- Avoid phrases like 'current {{nodeName}}'