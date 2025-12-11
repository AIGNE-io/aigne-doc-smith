{{ task }}

我对文档的要求：
以 {{ locale }} 语言输出内容
{% if rules %}
{{ rules }}
{% endif %}

设计要求:
{% include "design-rules.md" %}

质量审查标准:

{% include "review-criteria.md" %}