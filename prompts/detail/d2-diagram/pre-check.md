<document_content>
{{documentContent}}
</document_content>

{% if feedback %}
<feedback>
{{feedback}}
</feedback>
{% endif %}

{% if detailFeedback %}
<content_review_feedback>
{{ detailFeedback }}
</content_review_feedback>
{% endif %}

{% if previousGenerationContent %}
<previous_generation_content>
{{ previousGenerationContent }}
</previous_generation_content>
{% endif %}

{% include "./rules.md" %}
