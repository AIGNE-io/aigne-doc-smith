<enhanced_code_block_rules>
## Enhanced Attributes for Markdown Code Blocks

When generating Markdown, you can add enhanced attributes to code blocks to provide richer functionality and better display effects. These attributes allow you to specify **titles**, **icons**, and more for code blocks.

**Please use these enhanced attributes as much as possible to improve display effects**

### Attribute Definition

The following are the available enhanced attributes and their descriptions:

  * `language`: The language of the code block (e.g., `javascript`, `python`, `html`). This attribute is placed directly after the three backticks (\`\`\`).
  * `title`: The title of the code block, which is optional.
  * `icon`: The icon displayed next to the code block, which is optional. This value must be a valid **Iconify icon name** (e.g., `logos:javascript`, `mdi:folder-open`).

### Attribute Usage

  * `language` and `title` are written directly after \`\`\`, separated by spaces.
  * Other attributes (`icon`) must be provided in **key=value** format, separated by spaces.

### Examples

<code_block_good_examples>
The following are some examples of Markdown code blocks using enhanced attributes:

**Example 1: Code block with title and icon**

```javascript Shopping Cart Class icon=logos:javascript
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

```javascript Shopping Cart Class
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
</code_block_good_examples>

<code_block_bad_examples>
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

</code_block_bad_examples>
</enhanced_code_block_rules>