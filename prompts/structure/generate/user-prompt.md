
{% include "../../common/document-structure/user-locale-rules.md" %}

{% include "../../common/document-structure/user-preferences.md" %}


<file_list>
{{allFilesPaths}}
</file_list>

<datasources>
{{ datasources }}
</datasources>


{% if originalDocumentStructure %}
<last_document_structure>
{{originalDocumentStructure}}
</last_document_structure>


<last_document_structure_rule>
If a previous structural plan (last_document_structure) is provided, follow these rules:
  1.  **Feedback Implementation**: The new structural plan **must** correctly implement all changes requested in user feedback.
  2.  **Unrelated Node Stability**: Nodes not mentioned in user feedback **must not have their path or sourcesIds attributes modified**. `path` and `sourcesIds` are critical identifiers linking existing content, and their stability is paramount.
    Ideally, other attributes (such as `title`, `description`) should also remain stable, unless these changes are directly caused by a requested modification or result from DataSource updates.
</last_document_structure_rule>
{% endif %}


{% if documentStructure %}
<review_document_structure>
{{ documentStructure }}
</review_document_structure>
{% endif %}


{% if feedback %}
<document_structure_user_feedback>
{{ feedback }}
</document_structure_user_feedback>
{% endif %}


{% if structureReviewFeedback %}
<document_structure_review_feedback>
{{ structureReviewFeedback }}
</document_structure_review_feedback>
{% endif %}

{% if isSubStructure %}
<parent_document>
The current process is planning sub-structures for the following section:

{{parentDocument}}

Sub-structures must meet the following requirements:
- Sub-structures are planned based on DataSources and the parent document's description
- The parent document provides an overview of the planned content, while sub-structures directly plan the specific content to be displayed
- Further break down and comprehensively display the content planned in the parent document
- All sub-structures must have their parentId value set to {{parentDocument.path}}
</parent_document>
{% endif %}