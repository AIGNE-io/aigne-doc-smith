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

<datasources>

{{ detailDataSources }}

{{ additionalInformation }}

<media_list>
{{ assetsContent }}
</media_list>

{% include "../../common/document/media-handling-rules.md" %}
</datasources>

{% include "../../common/afs/afs-tools-usage.md" %}

<instructions>
Analyze the original document content and user feedback, then use available tools to implement the requested improvements while maintaining the document's integrity and style.
{% include "../../common/afs/use-afs-instruction.md" %}

{{feedback}}
</instructions>
