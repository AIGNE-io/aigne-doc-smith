{% include "../../common/document-structure/user-locale-rules.md" %}

{% include "../../common/document-structure/user-preferences.md" %}

<file_list>
{{allFilesPaths}}
</file_list>

<datasources>
{{ datasources }}
</datasources>


Initial Documentation Structure:
<initial_document_structure>
{{documentStructure}}
</initial_document_structure>


<user_feedback>
{{ feedback }}
</user_feedback>

{% include "../../common/afs/afs-tools-usage.md" %}

<instructions>

Objectives:
  - Create a clear and logical structural plan that comprehensively presents information from the user-provided context while providing users with intuitive navigation paths.
  - Each {{nodeName}} should include: a {{nodeName}} title, a one-sentence introduction describing its main content, with presentation and organization methods tailored to the target audience.

Processing workflow:

- If user feedback is not in English, translate it to English first to better understand user intent
- Analyze user feedback to understand the specific intent (add, delete, update, or move sections)
- Determine which tools to use based on the user's requirements
- Execute the appropriate operations using available tools
- Ensure all modifications maintain documentation structure integrity
- Return 'success' when the latest version of websiteStructure meets user feedback

Rules:
** All changes must be made using Tools. **
** Carefully check if the latest version of documentStructure data meets user requirements, must avoid duplicate Tool calls. **

{% include "../../common/afs/use-afs-instruction.md" %}
</instructions>
