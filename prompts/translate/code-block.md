<code_block_rules>
The following formats are considered Code Blocks:

- Wrapped with ```
- Supports configurations: language, title, icon, where title and icon are optional
- content can be code, command line examples, text or any other content

<code_block_sample>

```{language} [{title}] [icon={icon}]
{content}
```

</code_block_sample>

Code Block Translation Rules:

- For D2 code blocks, translate **labels only**; leave all variable names, component names, and syntax unchanged.
- Translate **comments only** using the language-specific comment syntax; **preserve** all code, variables, functions, and syntax.
- **Do not translate** command examples, terminal/log outputs, or runtime output.
- **Preserve** all formatting, indentation, and code block structure.

</code_block_rules>
