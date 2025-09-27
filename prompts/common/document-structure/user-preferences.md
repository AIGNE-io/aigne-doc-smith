{% if userPreferences %}
<user_preferences>
{{userPreferences}}

User preference guidelines:
- User preferences are derived from feedback provided in previous user interactions. When generating structural planning, consider user preferences to avoid repeating issues mentioned in user feedback
- User preferences carry less weight than current user feedback
</user_preferences>
{% endif %}