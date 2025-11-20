<x-card-usage-rules>
## XCard Usage Rules

XCards is multiple `<x-card>` container, suitable for displaying multiple links using a card list format, providing a richer and more visually appealing presentation.

### Attributes

- `data-columns` (required): must be an integer ≥ 2; no upper bound.

### Children

- Must contain multiple `<x-card>` elements internally.

### Usage Rules

- **Visual Consistency**: All `<x-card>` elements within the same `<x-cards>` must maintain visual consistency:
  - It's recommended to always provide data-icon for each card.
  - Or all cards should have data-image.
  - Avoid mixing (some with icons, some with only images).

### Good Examples

- Example 1: Two-column cards with images
  ```md
  <x-cards data-columns="2">
    <x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
    <x-card data-title="Card B" data-image="https://picsum.photos/id/11/300/300">Content B</x-card>
  </x-cards>
  ```

- Example 2: Four-column cards with icons
  ```md
  <x-cards data-columns="4">
    <x-card data-title="Feature 1" data-icon="lucide:rocket">Description of Feature 1.</x-card>
    <x-card data-title="Feature 2" data-icon="lucide:bolt">Description of Feature 2.</x-card>
    <x-card data-title="Feature 3" data-icon="material-symbols:rocket-outline">Description of Feature 3.</x-card>
    <x-card data-title="Feature 4" data-icon="lucide:star">Description of Feature 4.</x-card>
  </x-cards>
  ```

- Example 3: Replace markdown format multiple links
  ```md
  For more detailed information on specific features, please refer to the following sections:

  <x-cards data-columns="3">
    <x-card data-title="Using Discussions" data-href="/discussions">Introduce how to use discussions</x-card>
    <x-card data-title="Using the Blog" data-href="/blog">Introduce how to use the Blog</x-card>
    <x-card data-title="Using Chat" data-href="/chat">Introduce how to use Chat</x-card>
  </x-cards>
  ```

### Bad Examples

- Example 1: Using a single-column layout (`data-columns="1"`) is not allowed
  ```md
  <x-cards data-columns="1">
    <x-card data-title="Feature 1" data-icon="lucide:rocket">Description of Feature 1.</x-card>
    <x-card data-title="Feature 2" data-icon="lucide:bolt">Description of Feature 2.</x-card>
  </x-cards>
  ```

- Example 2: Contains only one `<x-card>` (must include multiple cards)
  ```md
  <x-cards data-columns="2">
    <x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
  </x-cards>
  ```

- Example 3: Markdown format multiple links
  ```md
  For more detailed information on specific features, please refer to the following sections:
  - [Using Discussions](./discussions.md)
  - [Using the Blog](./blog.md)
  - [Using Chat](./chat.md)
  ```

- Example 4: Missing `data-columns` attribute (required)
  <x-cards>
    <x-card data-title="Feature 1" data-icon="lucide:rocket">Description of Feature 1.</x-card>
    <x-card data-title="Feature 2" data-icon="lucide:bolt">Description of Feature 2.</x-card>
  </x-cards>
  
</x-card-usage-rules>
