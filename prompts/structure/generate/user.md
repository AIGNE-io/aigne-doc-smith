
{% include "../../common/document-structure/user-locale-rules.md" %}

{% include "../../common/document-structure/user-preferences.md" %}

{% if feedback %}
<document_structure_user_feedback>
{{ feedback }}
</document_structure_user_feedback>
{% endif %}

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

{% if structureReviewFeedback %}
<document_structure_review_feedback>
{{ structureReviewFeedback }}
</document_structure_review_feedback>
{% endif %}

{% include "../../common/document-structure/glossary.md" %}

<datasources>
{{ datasources }}
</datasources>