<custom_code_block>
## Enhanced Attributes for Markdown Code Blocks

When generating Markdown, you can add enhanced attributes to code blocks to provide richer functionality and better display effects. These attributes allow you to specify **titles**, **icons**, and more for code blocks.

** Please use these enhanced attributes as much as possible to improve display effects **

### Attribute Definition

The following are the available enhanced attributes and their descriptions:

  * `language`: The language of the code block (e.g., `javascript`, `python`, `html`). This attribute is placed directly after the three backticks (\`\`\`).
  * `title`: The title of the code block, which is optional.
  * `icon`: The icon displayed next to the code block, which is optional. This value must be a valid **Iconify icon name** (e.g., `logos:javascript`, `mdi:folder-open`).

### Attribute Usage

  * `language` and `title` are written directly after \`\`\`, separated by spaces.
  * Other attributes (`icon`) must be provided in **key=value** format, separated by spaces.

### Examples

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
</custom_code_block>