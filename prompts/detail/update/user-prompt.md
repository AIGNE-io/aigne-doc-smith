<user_locale>
{{ locale }}
</user_locale>

<user_rules>
{{ rules }}

** Output content in {{ locale }} language **
</user_rules>

{% set operation_type = "optimizing" %}
{% include "../../common/document/user-preferences.md" %}

<original_page_content>
{{originalContent}}
</original_page_content>

<detail_dataSource>

{{ detailDataSource }}

{{ additionalInformation }}

<media_file_list>
{{ assetsContent }}
</media_file_list>

</detail_dataSource>

<user_feedback>
{{feedback}}
</user_feedback>


<instructions>
Analyze the original document content and user feedback, then use available tools to implement the requested improvements while maintaining the document's integrity and style.
</instructions>
