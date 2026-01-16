{% if useImageToImage and existingImage %}
# Image-to-Image Generation Mode

Your task is to **update an existing diagram** based on the current document content{% if feedback %} and user feedback{% endif %}.

**CRITICAL INSTRUCTIONS:**
1. **Use the existing image as the primary reference** - maintain its overall structure, layout, and visual style
2. **Analyze the document content** to understand what changes are needed
{% if feedback %}3. **Apply user feedback** - follow the user's specific modification requests while maintaining visual consistency
4. **Maintain visual consistency** - keep the same style, color scheme, and general layout (unless feedback requests otherwise)
5. **Make necessary updates** - update content, add/remove elements, adjust relationships based on the document and feedback
6. **Preserve what works** - keep elements that are still accurate and relevant
{% else %}3. **Maintain visual consistency** - keep the same style, color scheme, and general layout
4. **Make necessary updates** - update content, add/remove elements, adjust relationships based on the document
5. **Preserve what works** - keep elements that are still accurate and relevant
{% endif %}

**Task Parameters:**
- **Description:** {{ desc }}
- **Visual Style:** modern (maintain consistency with existing image)
- **Aspect Ratio:** {{ aspectRatio }}
- **Language:** {{ locale }}

**Existing Diagram:**
[The existing diagram image is provided as input to the model]

{% if feedback %}
**User Feedback:**
```
{{ feedback }}
```

**Important:** The user feedback above contains specific modification requests. Please carefully apply these changes to the diagram while maintaining visual consistency with the existing image.
{% endif %}

**Document Content:**
{{ documentContent }}

**Your responsibilities:**
1. Analyze the existing diagram structure, style, and layout
2. Review the document content to identify what needs to be updated
{% if feedback %}3. Carefully apply the user feedback to make the requested modifications
4. Maintain visual consistency with the original design (unless feedback requests style changes)
5. Update the diagram to accurately reflect the current document content and user feedback
6. Make necessary changes while preserving the overall visual style and structure
{% else %}3. Maintain visual consistency with the original design
4. Update the diagram to accurately reflect the current document content
5. Make necessary changes while preserving the overall visual style and structure
{% endif %}

{% else %}
# Standard Text-to-Image Generation Mode

Your task is to create a professional diagram image based on the document content and description below.

Please follow **all global rules, styles, aspect ratio logic, and diagram-type guidelines** defined in the system prompt.

# Task Parameters:
- **Description:** {{ desc }}
- **Visual Style:** modern
- **Aspect Ratio:** {{ aspectRatio }}
- **Language:** {{ locale }}

# Your responsibilities:
1. Read and analyze the description and document content
2. Automatically determine the most appropriate diagram type (architecture, flowchart, sequence, concept, etc.)
3. Extract key concepts, steps, relationships, or flow sequences
4. Generate a diagram that accurately represents these elements
5. Apply all rules from the system prompt
6. Labels must be concise (2–5 words) in {{ locale }}
7. No titles or explanations outside nodes
8. Maintain clarity, structure, and proper layout based on the aspect ratio

# Description:
{{ desc }}

# Document Content:

Now analyze the following document content to understand the context and details:

{{ documentContent }}

**Task:** Based on the description "{{ desc }}" and the document content above, determine the appropriate diagram type and create a professional diagram that clearly illustrates the concepts, flow, or architecture described.

{% endif %}
