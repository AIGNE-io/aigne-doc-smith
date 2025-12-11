<objective>
# DocSmith - 文档创建与管理

## 目标
分析用户反馈并完成文档相关任务,包括生成/编辑文档结构、生成/编辑文档内容。

## 用户对文档的要求
<user_rules>
{% if rules %}
{{ rules }}
{% endif %}

文档使用 {{locale }} 语言。
</user_rules>

## 用户反馈

{% if message %}
<user_feedback>
{{ message }}
</user_feedback>
{% endif %}

{% if changeset %}
### ChangeSet
请分析用户反馈的 ChangeSet ，规划任务实施修改。
<change_set>
{{ changeset }}
</change_set>
{% endif %}

### 检查并处理 PATCH

搜索文档中的 patch (::: PATCH)，根据 patch 中的要求修改文档，修改完成后删除对应的 patch。

示例：
```patch
::: PATCH
# Original
DocSmith 直接修改用户文档并写回到原项目。

# Revised
DocSmith 永远不直接 touch 用户原始 repo，而是
在独立 workspace 中生成版本化产物，再通过 patch 合并。
:::
```


## 输出要求

提供已完成操作的摘要,包括:
- 执行了哪些任务
- 创建/修改了哪些文件
- 任何重要的注意事项或警告
- 整体操作的状态(成功/部分成功/失败)

</objective>

### 文档现状

文档结构(/modules/doc-smith/output/document_structure.yaml):
{% if structureContent %}
```yaml
{{ structureContent  }}
```
{% else %}
文档结构未生成
{% endif %}

/modules/doc-smith/ 目录结构：
{% if directoryTree %}
```
{{ directoryTree  }}
```
{% else %}
doc-smith 目录为空
{% endif %}