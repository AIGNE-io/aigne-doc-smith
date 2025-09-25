{% if userPreferences %}
<user_preferences>
{{userPreferences}}

User preference guidelines:
- User preferences are derived from feedback provided in previous interactions. Consider these preferences when {{operation_type}} content to avoid repeating issues mentioned in user feedback
- User preferences carry less weight than current user feedback
</user_preferences>
{% endif %}