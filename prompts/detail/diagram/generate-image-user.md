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
