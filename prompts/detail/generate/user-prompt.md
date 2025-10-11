<user_locale>
{{ locale }}
</user_locale>


<user_rules>
{{ rules }}

** Output content in {{ locale }} language **
</user_rules>


{% set operation_type = "generating" %}
{% include "../../common/document/user-preferences.md" %}


<datasources>
{{ detailDataSources }}

{{ additionalInformation }}

<media_list>
{{ assetsContent }}
</media_list>

{% include "../../common/document/media-handling-rules.md" %}

</datasources>


{% include "./detail-example.md" %}


{% if content %}
Content from previous generation:
<last_content>
{{content}}
</last_content>
{% endif %}


{% if detailFeedback %}
<content_review_feedback>
{{ detailFeedback }}
</content_review_feedback>
{% endif %}


{% if feedback %}
User feedback on previous generation:
<feedback>
{{feedback}}
</feedback>
{% endif %}

{% include "../../common/afs/afs-tools-usage.md" %}

<instructions>
Generate detailed document for the current {{nodeName}} based on user-provided information: current {{nodeName}} details (including title, description, path), DataSources, documentStructure (overall structural planning), and other relevant information.
{% include "../../common/afs/use-afs-instruction.md" %}
</instructions>
