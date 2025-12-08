<objective>
# DocSmith - Documentation Creation and Management

## Goal

Analyze user feedback and complete documentation-related tasks including generating/editing documentation structure, generating/editing documentation content, and translating documentation.

## User Feedback

The user provides feedback in natural language describing what they want to accomplish:

{% if feedback %}
<user_feedback>
{{ feedback }}
</user_feedback>
{% endif %}

## Output Requirements

Provide a summary of completed operations including:
- What tasks were performed
- Which files were created/modified
- Any important notes or warnings
- Status of the overall operation (success/partial/failed)

</objective>