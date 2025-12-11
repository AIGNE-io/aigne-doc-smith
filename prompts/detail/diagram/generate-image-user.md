{% if useImageToImage and existingImage %}
# Image-to-Image Generation Mode

Your task is to **update an existing diagram** based on the current document content and user feedback.

**CRITICAL INSTRUCTIONS:**
1. **Use the existing image as the primary reference** - maintain its overall structure, layout, and visual style
2. **Analyze the document content** to understand what changes are needed
3. **Apply user feedback** to modify the diagram appropriately
4. **Maintain visual consistency** - keep the same style, color scheme, and general layout unless explicitly requested to change
5. **Make maximum changes** where needed - update content, add/remove elements, adjust relationships based on the document
6. **Preserve what works** - keep elements that are still accurate and relevant

**Task Parameters:**
- **Diagram Type:** {{ diagramType }}
- **Visual Style:** {{ diagramStyle }} (maintain consistency with existing image unless feedback requests change)
- **Aspect Ratio:** {{ aspectRatio }}
- **Language:** English

**Existing Diagram:**
[The existing diagram image is provided as input to the model]

**Document Content:**
{% if documentSummary %}
{{ documentSummary }}
{% else %}
{{ documentContent }}
{% endif %}

**User Feedback:**
{{ feedback if feedback else "Update the diagram to match the current document content." }}

**Your responsibilities:**
1. Analyze the existing diagram structure, style, and layout
2. Review the document content to identify what needs to be updated
3. Apply user feedback to modify the diagram
4. Maintain visual consistency with the original design where appropriate
5. Update the diagram to accurately reflect the current document content
6. Make necessary changes while preserving the overall visual style and structure

**Style Consistency:**
- Keep the same visual style as the existing image unless user feedback explicitly requests a style change
- Maintain color scheme, node shapes, and layout patterns
- Preserve the overall aesthetic and design language

{% else %}
# Standard Text-to-Image Generation Mode

Your task is to create a professional diagram image based on the document content below.

Please follow **all global rules, styles, aspect ratio logic, and diagram-type rules** defined in the system prompt.

# Task Parameters:
- **Diagram Type:** {{ diagramType }}
- **Visual Style:** {{ diagramStyle }}
- **Aspect Ratio:** {{ aspectRatio }}
- **Language:** English

# Your responsibilities:
1. Read and analyze the document content.
2. Extract key concepts, steps, relationships, or flow sequences.
3. Generate a diagram that accurately represents these elements.
4. Apply all rules from the system prompt.
5. Labels must be concise (2–5 words).
6. No titles or explanations outside nodes.
7. Maintain clarity, structure, and proper layout based on the aspect ratio.

# Document Content:

Now analyze the following document content to understand what should be drawn:

{% if documentSummary %}
**Document Content (comprehensive summary for diagram generation):**
{{ documentSummary }}
{% else %}
**Document Content (full original content):**
{{ documentContent }}
{% endif %}

(Use this content to determine node structure, relationships, and flow.)
{% endif %}
