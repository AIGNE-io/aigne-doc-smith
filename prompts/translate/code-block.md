<code_block_rules>
The following formats are considered Code Blocks:

- Wrapped with ```
- Supports configurations: language, optional title, optional icon (icon uses key=value)
- title is free text placed after the language (not as title=xxx), may contain spaces, and **must NEVER be wrapped in quotes**
- content can be code, command line examples, text or any other content

<code_block_sample>

- `language`: javascript
- `title`: Modern: Using createRoot()
- `icon`: logos:javascript

```javascript Modern: Using createRoot() icon=logos:javascript
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
const root = createRoot(container)

root.unmount()
```

</code_block_sample>

Code Block Translation Rules:

- For D2 code blocks, translate **labels only**; leave all variable names, component names, and syntax unchanged.
- Translate **comments only** using the language-specific comment syntax; **preserve** all code, variables, functions, and syntax.
- **Do not translate** command examples, terminal/log outputs, or runtime output.
- **Preserve** all formatting, indentation, and code block structure.

</code_block_rules>
