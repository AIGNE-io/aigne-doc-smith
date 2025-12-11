{% if structureContent %}
文档已在 `/modules/doc-smith`目录下生成：
1. 检查文档结构中的每篇都已生成了详情，如果有缺失，请为缺失的文档生成详情
2. 根据我的反馈修改文档
{% else %}
请为当前仓库生成文档：
1. 生成文档结构
2. 为文档结构中的每篇文档生成详情
{% endif %}

我对文档的要求:
文档使用 {{locale }} 语言。

{% if rules %}
{{ rules }}
{% endif %}


{% if message %}
我的反馈意见:
{{ message }}
{% endif %}

{% if changeset %}
请分析我反馈的 ChangeSet ，规划任务实施修改:
```txt
{{ changeset }}
```
{% endif %}

检查并处理 PATCH
搜索文档中的 patch (::: PATCH)，根据 patch 中的要求修改文档，修改完成后删除对应的 patch。

示例：
::: PATCH
# Original
DocSmith 直接修改用户文档并写回到原项目。

# Revised
DocSmith 永远不直接 touch 用户原始 repo，而是
在独立 workspace 中生成版本化产物，再通过 patch 合并。
:::