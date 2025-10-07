<custom_components_usage>
When generating document details, you can use the following custom components at appropriate locations based on their descriptions and functionality to enhance document presentation:

- `<x-card>`
- `<x-cards>`
- `<x-field>`
- `<x-field-desc>`
- `<x-field-group>`

## `<x-card>` Single Card Component

Suitable for displaying individual links with a richer and more visually appealing presentation format.

### Syntax Rules

Attributes:

- `data-title` (required): Card title.
- `data-icon` (optional): Icon identifier (e.g., lucide:icon-name or material-symbols:rocket-outline).
  - Icons should prioritize Lucide (lucide:icon-name). If not available in Lucide, use Iconify (collection:icon-name, e.g., material-symbols:rocket-outline).
- `data-image` (optional): Image URL, can coexist with icon.
  - **Requirement**: At least one of `data-icon` or `data-image` must be provided.
  - It's recommended to always provide data-icon.
- `data-href` (optional): Navigation link for clicking the card or button.
- `data-horizontal` (optional): Whether to use horizontal layout.
- `data-cta` (optional): Button text (call to action).

Body content:

- Must be written within `<x-card>...</x-card>` children.
- must be **plain text only**. Any markdown formatting will cause rendering errors and must be avoided.

### Examples

<card_good_examples>
Example 1: Basic card with icon and description

```
<x-card data-title="alarm()" data-icon="lucide:alarm-clock"> SIGALRM: Sent when a real-time timer has expired. </x-card>
```

Example 2: Horizontal card layout

```
<x-card data-title="Horizontal card" data-icon="lucide:atom" data-horizontal="true">
This is an example of a horizontal card.
</x-card>
```

</card_good_examples>

<card_bad_examples>
Example 1: Markdown formatting in card content

```
<x-card data-title="alarm()" data-icon="lucide:alarm-clock"> `SIGALRM`: Sent when a real-time timer has expired. </x-card>
```

Example 2: Code block inside card content

```
<x-card data-title="ctrl_break()" data-icon="lucide:keyboard">
  Creates a listener for "ctrl-break" events.

  \`\`\`rust
  use tokio::signal::windows::ctrl_break;

  #[tokio::main]
  async fn main() -> std::io::Result<()> {
  let mut stream = ctrl_break()?;
  stream.recv().await;
  println!("got ctrl-break");
  Ok(())
  }
  \`\`\`
</x-card>
```

</card_bad_examples>

## `<x-cards>` Card List Component

Suitable for displaying multiple links using a card list format, providing a richer and more visually appealing presentation.

### Syntax Rules

Attributes:

- data-columns (optional): Number of columns, integer (e.g., 2, 3). Default is 2.
  - Must contain multiple <x-card> elements internally.

Body content:

- Must contain multiple <x-card> elements internally.
- **Consistency requirement**: All <x-card> elements within the same <x-cards> must maintain visual consistency:
  - It's recommended to always provide data-icon for each card.
  - Or all cards should have data-image.
  - Avoid mixing (some with icons, some with only images).

### Examples

<cards_good_examples>
Example 1: Three-column cards with icons

```
<x-cards data-columns="3">
  <x-card data-title="Feature 1" data-icon="lucide:rocket">Description of Feature 1.</x-card>
  <x-card data-title="Feature 2" data-icon="lucide:bolt">Description of Feature 2.</x-card>
  <x-card data-title="Feature 3" data-icon="material-symbols:rocket-outline">Description of Feature 3.</x-card>
</x-cards>
```

Example 2: Two-column cards with images

```
<x-cards data-columns="2">
<x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
<x-card data-title="Card B" data-image="https://picsum.photos/id/11/300/300">Content B</x-card>
</x-cards>
```

</cards_good_examples>

## `<x-field>` Individual Field Component

Suitable for displaying API parameters, return values, context data, and any structured data with metadata in a clean, organized format. Supports nested structures for complex data types.

### Syntax Rules

Attributes:

- `data-name` (optional): The name of the field/parameter
- `data-type` (optional): The data type of the field (e.g., "string", "number", "boolean", "object", "array")
- `data-default` (optional): Default value for the field
- `data-required` (optional): Whether the field is required ("true" or "false")
- `data-deprecated` (optional): Whether the field is deprecated ("true" or "false")
- `data-desc` (optional): Simple description of the field (plain text only)
  - Mutually exclusive with `data-desc`: Use either `data-desc` attribute OR `<x-field-desc>` element, not both

Body content:

- For simple types (string, number, boolean): children can be empty or contain exactly one `<x-field-desc>` element
- For complex types (object, array), children contain nested `<x-field>` elements and optionally one `<x-field-desc>` element
  - Maximum nesting depth: 5 levels (to avoid overly complex structures)
- Only one `<x-field-desc>` element per `<x-field>` is allowed
- **Always use opening/closing tags format**: `<x-field ...></x-field>` for all types

### Examples

<field_good_examples>
Example 1: Simple field with all attributes

```
<x-field data-name="user_id" data-type="string" data-default="u0911" data-required="true" data-deprecated="true" data-desc="Unique identifier for the user. Must be a valid UUID v4 format."></x-field>
```

Example 2: Field with markdown description

```
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc markdown>Your **API key** for authentication. Generate one from the `Settings > API Keys` section. Keep it secure and never expose it in client-side code.</x-field-desc>
</x-field>
```

Example 3: Nested object structure

```
<x-field data-name="session" data-type="object" data-required="true">
  <x-field-desc markdown>Contains all **authentication** and **authorization** data for the current user session. This object is automatically populated after successful login.</x-field-desc>
  <x-field data-name="user" data-type="object" data-required="true" data-desc="User basic information">
    <x-field data-name="name" data-type="string" data-required="true" data-default="John Doe" data-desc="User name"></x-field>
    <x-field data-name="email" data-type="string" data-required="true" data-default="john.doe@example.com">
        <x-field-desc markdown>Primary email address used for **login** and **notifications**. Must be a valid email format.</x-field-desc>
    </x-field>
    <x-field data-name="avatar" data-type="string" data-required="false" data-default="https://example.com/avatars/john-doe.jpg" data-desc="User avatar URL"></x-field>
  </x-field>
  <x-field data-name="permissions" data-type="array" data-required="true" data-default='["read", "write", "admin"]'>
    <x-field-desc markdown>Array of **permission strings** that determine what actions the user can perform. Common values: `"read"`, `"write"`, `"admin"`, `"delete"`.</x-field-desc>
  </x-field>
</x-field>
```

</field_good_examples>

<field_bad_examples>
Example 1: Using multiple `<x-field-desc>` elements

```
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc markdown>Your **API key** for authentication.</x-field-desc>
  <x-field-desc markdown>Keep it secure and never expose it.</x-field-desc>
</x-field>
```

Example 2: Using self-closing tag

```
<x-field data-name="user_id" data-type="string" data-required="true" data-desc="User identifier" />
```

Example 3: Using both `data-desc` and `<x-field-desc>`

```
<x-field data-name="api_key" data-type="string" data-required="true" data-desc="API key for authentication">
  <x-field-desc markdown>Your **API key** for authentication. Keep it secure and never expose it.</x-field-desc>
</x-field>
```

Example 4: Nesting other child elements

```
<x-field data-name="user" data-type="object" data-required="true">
  <div>User information</div>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
</x-field>
```

</field_bad_examples>

## `<x-field-desc>` Field Description Component

Used to provide rich text descriptions for `<x-field>` elements, supporting inline markdown formatting for enhanced readability.

### Syntax Rules

Attributes:

- `markdown` (required): **MUST** be set to "markdown" . This attribute is mandatory and cannot be omitted
  - **Validation**: `<x-field-desc>` without `markdown` attribute will be rejected

Body content:

- Supports **bold text**, `inline code`, _italic text_, and other inline markdown
- Cannot contain block-level elements (no code blocks, headers, lists)
- **Description text as child content**: Description text must be provided as child content of `<x-field-desc>`, not as the value of the `markdown` attribute

Structure constraints:

- Must be child of `<x-field>`: `<x-field-desc>` can only appear as a child element of `<x-field>` components

### Examples

<field_desc_good_examples>
Example 1: Basic markdown description

```
<x-field-desc markdown>Your **API key** for authentication. Generate one from the `Settings > API Keys` section. Keep it secure and never expose it in client-side code.</x-field-desc>
```

Example 2: Description with inline code

```
<x-field-desc markdown>**JWT token** containing user identity and permissions. Expires in `24 hours` by default. Use the `refresh_token` to obtain a new one.</x-field-desc>
```

</field_desc_good_examples>

<field_desc_bad_examples>
Example 1: Missing markdown attribute

```
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc>Your **API key** for authentication.</x-field-desc>
</x-field>
```

Example 2: Incorrect markdown attribute usage

```
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc markdown="Your **API key** for authentication."></x-field-desc>
</x-field>
```

Example 3: Using self-closing tag

```
<x-field data-name="user_id" data-type="string" data-required="true">
  <x-field-desc markdown />
</x-field>
```

Example 4: Containing block-level elements

```
<x-field data-name="config" data-type="object" data-required="true">
  <x-field-desc markdown>
    Configuration object for the application.

    # Important Notes
    - Set debug to true for development
    - Use production database in production

    \`\`\`javascript
    const config = { debug: true };
    \`\`\`
  </x-field-desc>
</x-field>
```

Example 5: Used outside of x-field component

```
<x-field-desc markdown>This description is not inside an x-field component.</x-field-desc>
```

Example 6: Used as child of other components

```
<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
  <x-field-desc markdown>This description is not inside an x-field component.</x-field-desc>
</x-field-group>
```

</field_desc_bad_examples>

## `<x-field-group>` Field Group Component

Used to group multiple related `<x-field>` elements at the top level, indicating they belong to the same object or context. This provides better organization and visual grouping for related parameters.

### Syntax Rules

Attributes:

- No attributes required

Body content:

- Only `<x-field>` elements are allowed as children

Structure:

- Top-level organization: Used only at the top level for grouping related `<x-field>`
- Cannot be nested inside other `<x-field>` or `<x-field-group>` elements

### Examples

<field_group_good_examples>
Example 1: Product information fields

```
<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the product."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="An optional description for the product."></x-field>
  <x-field data-name="type" data-type="string" data-required="false" data-desc="The type of product (e.g., 'service', 'good')."></x-field>
  <x-field data-name="price" data-type="number" data-required="true" data-default="0">
    <x-field-desc markdown>Product price in **USD**. Must be a positive number with up to 2 decimal places.</x-field-desc>
  </x-field>
</x-field-group>
```

</field_group_good_examples>

<field_group_bad_examples>
Example 1: Nested inside x-field component

```
<x-field data-name="user" data-type="object" data-required="true">
  <x-field-group>
    <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
    <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
  </x-field-group>
</x-field>
```

Example 2: Nested inside another x-field-group

```
<x-field-group>
  <x-field data-name="user" data-type="object" data-required="true" data-desc="User information"></x-field>
  <x-field-group>
    <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
    <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
  </x-field-group>
</x-field-group>
```

Example 3: Containing non-x-field elements

```
<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
  <div>Additional information</div>
  <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
</x-field-group>
```

</field_group_bad_examples>

</custom_components_usage>