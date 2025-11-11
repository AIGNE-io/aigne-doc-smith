<code_block_usage_rules>

## Enhanced Attributes for Markdown Code Blocks

When generating Markdown, you can add enhanced attributes to code blocks to provide richer functionality and better display effects. These attributes allow you to specify **titles**, **icons**, and more for code blocks.

### Attribute Definition

The following are the available enhanced attributes and their descriptions:

- `language`: The language of the code block (e.g., `javascript`, `python`, `html`). This attribute is placed directly after the three backticks (\`\`\`).
- `title`: The title of the code block (optional)
- `icon`: The icon displayed next to the code block, which is optional. This value must be a valid **Iconify icon name** (e.g., `logos:javascript`, `mdi:folder-open`).

### Attribute Usage

- `language` and `title` are written directly after \`\`\`, separated by spaces.
  - Do not add quotes around the `title` value.
- Other attributes (`icon`) must be provided in **key=value** format, separated by spaces.

### Usage Requirements
- Use these enhanced attributes as much as possible to improve display effects.
- If the language is a shell (includes `sh`, `bash`, `zsh`, etc.):
  - Executable shell code blocks must be a single-line command to make copying and running easier.
  - Do not include comments inside executable shell code blocks; place explanatory comments outside the code block.
- Prefer use filename as title:
  - If the code block content demonstrates usage of a component or library (for example a React component file, a Vue component, or a util module), the `title` should be the filename used in real usage (for example `MyComponent.jsx`, `index.ts`, `utils.js`). Using the filename as the title makes the example clearer and helps standardize code-block titles across the docs.
  - If the content is not a usage example, prefer a short descriptive title that summarizes the snippet's purpose.
- Ensure readability of the document:
  - After inserting a code block, update the surrounding document text to introduce, reference, or explain the code block.

### Examples

#### Good Examples
The following are some examples of Markdown code blocks using enhanced attributes:

**Example 1: Code block with title and icon**

```javascript shopping-cart.js icon=logos:javascript
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discounts = [];
    this.taxRate = 0.08;
  }
}
```

**Example 2: Code block with icon only**

```javascript icon=logos:javascript
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discounts = [];
    this.taxRate = 0.08;
  }
}
```

**Example 3: Code block with title only**

```javascript shopping-cart.js
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discounts = [];
    this.taxRate = 0.08;
  }
}
```

**Example 4: Basic code block**

```javascript
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discounts = [];
    this.taxRate = 0.08;
  }
}
```

**Example 7: Component usage example with filename title**

```javascript MyComponent.jsx icon=logos:react
import React from 'react';

export default function MyComponent(props) {
  return (
    <div className="my-component">
      <h1>{props.title}</h1>
    </div>
  );
}
```

**Example 8: Utility module example with filename title**

```javascript utils.js
// simple utility function exported from utils.js
export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
```

**Example 5: Shell code block should in one line**

```sh Install aigne deps icon=lucide:terminal
npm i -g @aigne/cli @aigne/doc-smith @aigne/websmith-smith
```

**Example 6: Shell code block use `\` to split multiple lines**
```bash Deploying with Access Keys icon=lucide:terminal
blocklet deploy . \
  --endpoint https://my-server.arcblock.io \
  --access-key 'your_access_key_id' \
  --access-secret 'your_access_key_secret' \
  --app-id z2qa9sD2tFAP8gM7C1i8iETg3a1T3A3aT3bQ
```


#### Bad Examples

**Example 1**

There are two errors in this example:
- Language name should not include suffixes like ',no_run' in the example
- Title does not need a key specified; just configure the value directly

```rust,no_run title="main.rs" icon=logos:rust
use tokio::runtime::Runtime;
use tokio::net::TcpListener;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create the runtime
    let rt  = Runtime::new()?;

    // Spawn the root task
    rt.block_on(async {
        let listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();
        println!("Listening on: {}", listener.local_addr().unwrap());
        // ... application logic ...
    });
    Ok(())
}
```

**Example 2: shell code block have multiple lines**
```sh
npm i -g @aigne/cli
npm i -g @aigne/doc-smith
npm i -g @aigne/websmith-smith
```

**Example 3: shell code block comments**
```sh
# add aigne deps
npm i -g @aigne/cli
```

</code_block_usage_rules>
