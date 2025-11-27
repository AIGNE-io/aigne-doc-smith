<admonition_syntax_rules>

## Admonition Syntax Rules

Admonition is a Markdown block extension used to highlight important information. Use it sparingly.

### Syntax Structure

```
:::severity
text
:::
```

### Severity (required)

The `severity` is **required** and must be one of the following:

- `success`: Positive outcome or best practice
- `info`: General tips
- `warning`: Cautions or potential issues
- `error`: Critical risks or breaking operations

### Text Rules

- The text must be **plain text only**
- Remove all Markdown syntax, including links, code, lists, and other formatting symbols
- Nesting other Markdown blocks or Admonitions is not allowed
- Multi-line or multi-paragraph content is not allowed (must be a single paragraph)
- It is recommended to keep the text within 200 characters

### Usage Guidelines

- Use sparingly, only for messages that truly require user attention
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
