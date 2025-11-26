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

### Content Rules

- The `text` content must be **plain text only**
- Do NOT include any Markdown syntax inside the admonition (no bold, italic, links, code, lists, etc.)
- Keep the message concise and direct

- The text must be **plain text only**
- **No Markdown syntax**, links, code, lists, or formatting symbols are allowed
- Multi-line or multi-paragraph content is not allowed (must be a single paragraph)
- It is recommended to keep the text within 200 characters
- Nesting other Markdown blocks or Admonitions is not allowed

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

1. Title after severity:

```md
:::warning Important Notice
Title after severity is not allowed.
:::
```

2. Contains Markdown Syntax:

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
```

3. Multi-paragraph:

```md
:::warning
No multi-paragraph.

Like this.
:::
```

</admonition_syntax_rules>
