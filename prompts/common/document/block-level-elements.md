<block_level_elements>

## Block-Level Elements

Block-level elements are standalone content blocks that must be visually separated from surrounding content. 

### Block-Level Element List

The following are block-level elements:

- Admonition: `:::severity ... :::`
- Code Block: ` ```language ... ``` `
- Custom Components: `<x-cards>`, `<x-card>`, `<x-field-group>`.

### Spacing Rule

Always insert a blank line before and after any block-level element when it is **adjacent to** other Markdown content (headings, paragraphs, lists, etc.).

### Good Examples

1. Admonition with spacing:

```md
Some paragraph text.

:::warning
This is a warning message.
:::

Next paragraph continues here.
```

2. Code block with spacing:

```md
Here is how to install:

​```bash
npm install @aigne/cli
​```

Then run the command above.
```

3. Custom component with spacing:

```md
**Parameters**

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
</x-field-group>

**Returns**
```

```md
Some paragraph text:

<x-cards columns="2">
  <x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
  <x-card data-title="Card B" data-image="https://picsum.photos/id/11/300/300">Content B</x-card>
</x-cards>
```

### Bad Examples

1. Missing blank lines:

```md
Some paragraph text.
:::warning
This is a warning message.
:::
Next paragraph continues here.
```

```md
**Parameters**
<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
</x-field-group>
**Returns**
```

```md
Some paragraph text:
<x-cards columns="2">
  <x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
  <x-card data-title="Card B" data-image="https://picsum.photos/id/11/300/300">Content B</x-card>
</x-cards>
```

</block_level_elements>

