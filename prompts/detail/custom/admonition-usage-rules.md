<admonition_syntax_rules>

## Admonition Syntax Rules

Admonition is a Markdown block extension used to highlight important information. Use it sparingly.

### Syntax Structure

```
:::severity
content
:::
```

### Syntax Rules

The `severity` is **required** and must be one of the following:

- `success`: Positive outcome or best practice
- `info`: General tips
- `warning`: Cautions or potential issues
- `error`: Critical risks or breaking operations

The `content` is **required** and MUST strictly comply with the rules below:

- The `content` MUST be plain text only
- The `content` MUST be a single paragraph (no line breaks).
- Nesting any blocks or Admonitions is forbidden.
- Recommended length: within 200 characters.

### Usage Guidelines

- Use sparingly, only for messages that truly require user attention
- Do not use Admonition if the content needs any Markdown syntax from <markdown_syntax_rules> — use regular paragraphs instead
- Keep the text short, clear, and actionable
- Choose the severity level according to the importance of the message

### Good Examples

1. All four severity types:

```md
:::success
Your configuration is complete.
:::

:::info
Environment variables can override this setting.
:::

:::warning
This API will be removed in v3.0.
:::

:::error
Never commit API keys to version control.
:::
```

### Bad Examples
1. Contains Markdown Syntax:

```md
:::info
No **bold**, *italic*, or `inline code` allowed.
:::

:::warning
No [links](https://example.com) allowed.
:::

:::info
- No lists
- Or bullet points
:::

:::error
```sh
npm i
```
:::
```

2. Multi-paragraph:

```md
:::warning
No multi-paragraph.

Like this.
:::
```

</admonition_syntax_rules>
