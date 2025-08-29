When generating document details, you can use the following custom components at appropriate locations based on their descriptions and functionality to enhance document presentation:
- `<x-card>`
- `<x-cards>`


### 1. <x-card> Single Card Component
Suitable for displaying individual links with a richer and more visually appealing presentation format.

Example:

```
<x-card data-title="Required Title" data-image="Image URL" data-icon="Icon identifier (e.g., lucide:rocket or material-symbols:rocket-outline)" data-href="Navigation link URL" data-horizontal="true/false" data-cta="Button text" >
  Card body content
</x-card>
```

Attribute Rules:

-	data-title (required): Card title.
-	data-icon / data-image (choose one, at least one must be provided):
    -	It's recommended to always provide data-icon.
    -	Icons should prioritize Lucide (lucide:icon-name). If not available in Lucide, use Iconify (collection:icon-name, e.g., material-symbols:rocket-outline).
-	data-image (optional): Image URL, can coexist with icon.
-	data-href (optional): Navigation link for clicking the card or button.
-	data-horizontal (optional): Whether to use horizontal layout.
-	data-cta (optional): Button text (call to action).
-	Body content: Must be written within <x-card>...</x-card> children.


### 2. `<x-cards>` Card List Component

Suitable for displaying multiple links using a card list format, providing a richer and more visually appealing presentation.

Syntax:

```
<x-cards data-columns="Number of columns">
  <x-card data-title="Title 1" data-icon="lucide:rocket">Content 1</x-card>
  <x-card data-title="Title 2" data-icon="lucide:bolt">Content 2</x-card>
  <x-card data-title="Title 3" data-icon="material-symbols:rocket-outline">Content 3</x-card>
</x-cards>
```

Attribute Rules:
-	data-columns (optional): Number of columns, integer (e.g., 2, 3). Default is 2.
-	Must contain multiple <x-card> elements internally.
-	Consistency requirement: All <x-card> elements within the same <x-cards> must maintain visual consistency:
    -	Recommended to always provide data-icon for each card.
    -	Or all cards should have data-image.
    -	Avoid mixing (some with icons, some with only images).


### 3. Examples

Single card:

```
<x-card data-title="Horizontal card" data-icon="lucide:atom" data-horizontal="true">
  This is an example of a horizontal card.
</x-card>
```

Card list (all using icons, recommended approach):

```
<x-cards data-columns="3">
  <x-card data-title="Feature 1" data-icon="lucide:rocket">Description of Feature 1.</x-card>
  <x-card data-title="Feature 2" data-icon="lucide:bolt">Description of Feature 2.</x-card>
  <x-card data-title="Feature 3" data-icon="material-symbols:rocket-outline">Description of Feature 3.</x-card>
</x-cards>
```

Card list (all using images):

```
<x-cards data-columns="2">
  <x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
  <x-card data-title="Card B" data-image="https://picsum.photos/id/11/300/300">Content B</x-card>
</x-cards>
```