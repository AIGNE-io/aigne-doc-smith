**[Task & Requirements - Read First]**

**Your Task:**
Create a professional diagram image based on document content. You will receive the full document content below. Your job is to:
1. Analyze the document content to extract key concepts, processes, relationships, or flow steps
2. Create a visual diagram that accurately represents this content
3. Follow all the requirements and constraints specified below

**Generate the diagram image in the following language:** {{ locale }}

**Diagram Type:** {{ diagramType }}
**Visual Style:** {{ diagramStyle }}
**Aspect Ratio:** {{ aspectRatio }}

**[Image Dimensions & Space Utilization - CRITICAL MATCHING RULES]**

**⚠️ CRITICAL WARNING:** The aspect ratio MUST match your layout direction:
- **Portrait (3:4, 4:3)** = Vertical flow (top-to-bottom) ONLY
- **Landscape (16:9)** = Horizontal flow (left-to-right) ONLY
- **Square (1:1)** = Radial flow (center-outward) ONLY

**NEVER mismatch:** Do NOT draw horizontal flows in portrait ratios or vertical flows in landscape ratios.

{% if aspectRatio == "1:1" %}
- **Image Size:** ~1024×1024 pixels (1:1 SQUARE)
- **Flow:** RADIAL ONLY - Use radial/circular layouts from center outward
- **Fill:** Use BOTH width and height equally - fill the entire square canvas
{% elif aspectRatio == "3:4" %}
- **Image Size:** ~768×1024 pixels (3:4 PORTRAIT - TALL)
- **Flow:** VERTICAL ONLY - Use top-to-bottom layouts
- **Fill:** Use full HEIGHT - distribute nodes vertically, avoid empty top/bottom space
{% elif aspectRatio == "4:3" %}
- **Image Size:** ~1365×1024 pixels (4:3 PORTRAIT)
- **Flow:** VERTICAL ONLY - Use top-to-bottom layouts
- **Fill:** Use full HEIGHT - distribute nodes vertically, avoid empty top/bottom space
{% elif aspectRatio == "16:9" %}
- **Image Size:** ~1820×1024 pixels (16:9 WIDESCREEN)
- **Flow:** HORIZONTAL ONLY - Use left-to-right layouts
- **Fill:** Use full WIDTH - distribute nodes horizontally, avoid empty left/right space
{% endif %}

- **CRITICAL:** Match your layout direction to the aspect ratio. Fill the primary dimension (height for portrait, width for landscape, both for square).

**Instructions for diagram generation:**
- Analyze the document content to extract ALL key concepts, processes, relationships, or flow steps
- **Node Count Control (MANDATORY):**
  - **CRITICAL - Overview Document Detection:** First, analyze the document content to determine if this is an overview or introduction document. Look for:
    - Title starting with "# Overview", "#overview", or similar (case-insensitive)
    - Content that provides a high-level introduction to the entire system/project
    - Content that describes overall architecture, structure, or general concepts rather than specific implementation steps
    - Content that serves as a "getting started" or "introduction" to the whole documentation
  - **If this is an overview/introduction document OR diagramType is "architecture":**
    - **Target:** Use 3-6 nodes to show the overall architecture at a glance
    - **Purpose:** Provide a high-level overview of the system structure, NOT detailed execution steps
    - **Focus:** Show main components, services, or architectural layers - keep it simple and intuitive
    - **Maximum:** Never exceed 6 nodes - this is a summary view for users to quickly understand the system
    - **Visual Style:** Architecture diagrams should be vivid, concrete, and engaging. Use flexible visual styles (anthropomorphic, standard icons, skeuomorphic) - don't be rigid or overly restrictive. Keep text concise - just enough to express the architecture and what the document needs to convey.
  - **Otherwise:**
    - **Target:** Aim for 5-10 nodes for optimal clarity (see System Prompt for detailed rules)
    - **Maximum:** Never exceed 15 nodes - merge related steps into logical groups when necessary
- **Maintain Complete Flow (CRITICAL):** 
  - **Preserve all important steps:** Include all significant steps and decision points in the process flow (within node count limits)
  - **Merge rather than omit:** Instead of deleting steps, merge related sequential actions into single nodes to respect the 15-node maximum
  - **If 10 nodes or fewer:** Present each node clearly and distinctly, ensuring all steps are visible and well-described
  - **If 11-15 nodes:** Use visual organization techniques (see System Prompt for detailed strategies: visual grouping, merging sequential steps, clear hierarchy, optimal layout, strategic spacing, clear flow paths)
- Create a visual representation that accurately reflects the COMPLETE process flow with all important steps (within the 5-15 node range)
- **CRITICAL - No Title/Label:** Do NOT add any title, label, caption, or explanatory text to the diagram. The diagram should be self-explanatory through its visual structure only.
- Use the diagram type ({{ diagramType }}) and style ({{ diagramStyle }}) specified
- {% if diagramType == "flowchart" %}**CRITICAL - Flowchart Block Grouping & Layout:**
  - **Block Grouping (MANDATORY):** Always organize nodes into logical blocks/groups using visual containers. If no clear blocks exist, actively merge related sequential steps into single nodes to create meaningful blocks. Reduce nodes through merging: combine 2-3 related sequential actions into single nodes (see System Prompt for detailed block grouping strategy).
  - **Layout Constraint (MANDATORY - NEVER EXCEED):**
    - **Vertical Flowcharts:** Maximum **5 rows** - NEVER exceed 5 rows. Each row can contain 3-4 nodes distributed horizontally. Maximum grid size: **5 rows × 6 columns (5×6)**.
    - **Horizontal Flowcharts:** Maximum **5 columns** - NEVER exceed 5 columns. Each column can contain 3-4 nodes distributed vertically. Maximum grid size: **5 columns × 6 rows (5×6)**.
    - **If you have more nodes than can fit in 5×6 grid:** You MUST merge nodes or reduce node count to fit within the 5×6 constraint. Never create more than 5 rows (vertical) or 5 columns (horizontal).
{% endif %}
- Keep node labels concise (2-5 words maximum, preferably 2-3 words) but allow text wrapping if needed for clarity
- Focus on clarity and readability while ensuring the complete process is represented
{% if aspectRatio in ["3:4", "4:3"] %}
- **CRITICAL - Vertical Flow Only:** Portrait ratios ({{ aspectRatio }}) are for VERTICAL flows ONLY. Arrange nodes top-to-bottom. Use the full HEIGHT - avoid leaving empty space at top or bottom. If you have a horizontal flowchart, you MUST arrange it vertically or merge steps to fit the vertical format.
{% endif %}
{% if aspectRatio == "16:9" %}
- **CRITICAL - Horizontal Flow Only:** Landscape ratio ({{ aspectRatio }}) is for HORIZONTAL flows ONLY. Arrange nodes left-to-right. Use the full WIDTH - avoid leaving empty space on left or right sides. If you have a vertical flowchart, you MUST arrange it horizontally or merge steps to fit the horizontal format.
{% endif %}
{% if aspectRatio == "1:1" %}
- **CRITICAL - Radial Flow Only:** Square format ({{ aspectRatio }}) is for RADIAL flows ONLY. Use radial/circular layouts from center outward. Fill BOTH dimensions equally - avoid linear horizontal or vertical flows.
{% endif %}

---

**[Document Content - Analyze This]**

Now analyze the following document content to understand what should be drawn:

{{ documentContent }}

**Remember:** Apply all the requirements and rules specified above when creating the diagram based on this content.

