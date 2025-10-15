{% if detailFeedback %}
<content_review_feedback>
{{ detailFeedback }}
</content_review_feedback>
{% endif %}

<user_feedback>
{{feedback}}
</user_feedback>

<instructions>
Generate detailed and well-structured document for the current {{nodeName}} based on user-provided information: current {{nodeName}} details (including title, description, path), DataSources, documentStructure (overall structural planning), and other relevant information  and the following rules and constraints:

- Use AFS tools (afs_list/afs_search/afs_read) to gather relevant and accurate information to enhance the content.
- Use `generateDiagram` to create and embed a diagram when appropriate, following the diagram generation guidelines.
</instructions>
