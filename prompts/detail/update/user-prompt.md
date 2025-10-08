<user_locale>
{{ locale }}
</user_locale>

<user_rules>
{{ rules }}

** Output content in {{ locale }} language **
</user_rules>

{% set operation_type = "optimizing" %}
{% include "../common/document/user-preferences.md" %}

<original_page_content>
{{originalContent}}
</original_page_content>

<datasources>

{{ detailDataSources }}

{{ additionalInformation }}

<media_list>
{{ assetsContent }}
</media_list>

{% include "../common/document/media-handling-rules.md" %}
</datasources>

<user_feedback>
{{feedback}}
</user_feedback>
