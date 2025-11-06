<custom_components_usage_rules>
When generating document details, you can use the following custom components at appropriate locations based on their descriptions and functionality to enhance document presentation:

## XCard: Individual link display card

Suitable for displaying individual links with a richer and more visually appealing presentation format.

### Attributes

- `data-title` (required): Card title.
- `data-icon` (optional): Icon identifier (e.g., lucide:icon-name or material-symbols:rocket-outline).
  - Icons should prioritize Lucide (lucide:icon-name). If not available in Lucide, use Iconify (collection:icon-name, e.g., material-symbols:rocket-outline).
- `data-image` (optional): Image URL, can coexist with icon.
  - **Requirement**: At least one of `data-icon` or `data-image` must be provided.
  - It's recommended to always provide data-icon.
- `data-href` (optional): Navigation link for clicking the card or button.
- `data-horizontal` (optional): Whether to use horizontal layout.
- `data-cta` (optional): Button text (call to action).

### Children

- Must be written within `<x-card>...</x-card>` children.
- **Plain Text Only**: All markdown formatting is prohibited, including inline formats like `code`, **bold**, _italic_, [links](), and block-level formats like headers (# ##), lists (- \*), code blocks (```), tables (|), and any other markdown syntax. Only plain text content is allowed.

### Good Examples

Example 1: Basic card with icon and description

```md
<x-card data-title="alarm()" data-icon="lucide:alarm-clock"> SIGALRM: Sent when a real-time timer has expired. </x-card>
```

Example 2: Horizontal card layout

```md
<x-card data-title="Horizontal card" data-icon="lucide:atom" data-horizontal="true">
This is an example of a horizontal card.
</x-card>
```

### Bad Examples

Example 1: Inline Markdown formatting in card content

```md
<x-card data-title="alarm()" data-icon="lucide:alarm-clock"> `SIGALRM`: Sent when a real-time timer has expired. </x-card>
```

Example 2: Code block inside card content

````md
<x-card data-title="ctrl_break()" data-icon="lucide:keyboard">
  Creates a listener for "ctrl-break" events.

```rust
use tokio::signal::windows::ctrl_break;

#[tokio::main]
async fn main() -> std::io::Result<()> {
let mut stream = ctrl_break()?;
stream.recv().await;
println!("got ctrl-break");
Ok(())
}
```

````


## XCards: Multiple cards container

Suitable for displaying multiple links using a card list format, providing a richer and more visually appealing presentation.

### Attributes

- data-columns (optional): Must be an **integer ≥ 2**. Values below 2 are disallowed. Default is 2.

### Children

- Must contain multiple `<x-card>` elements internally.

### Usage Rules

- **Visual Consistency**: All `<x-card>` elements within the same `<x-cards>` must maintain visual consistency:
  - It's recommended to always provide data-icon for each card.
  - Or all cards should have data-image.
  - Avoid mixing (some with icons, some with only images).

### Good Examples

Example 1: Three-column cards with icons

```md
<x-cards data-columns="3">
  <x-card data-title="Feature 1" data-icon="lucide:rocket">Description of Feature 1.</x-card>
  <x-card data-title="Feature 2" data-icon="lucide:bolt">Description of Feature 2.</x-card>
  <x-card data-title="Feature 3" data-icon="material-symbols:rocket-outline">Description of Feature 3.</x-card>
</x-cards>
```

Example 2: Two-column cards with images

```md
<x-cards data-columns="2">
  <x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
  <x-card data-title="Card B" data-image="https://picsum.photos/id/11/300/300">Content B</x-card>
</x-cards>
```

Example 3: Replace markdown format multiple links

```md
For more detailed information on specific features, please refer to the following sections:
<x-cards data-columns="3">
  <x-card data-title="Using Discussions" data-href="/discussions">Introduce how to use discussions</x-card>
  <x-card data-title="Using the Blog" data-href="/blog">Introduce how to use the Blog</x-card>
  <x-card data-title="Using Chat" data-href="/chat">Introduce how to use Chat</x-card>
</x-cards>
```

### Bad Examples

Example 1: Using a single-column layout (`data-columns="1"`) is not allowed

```md
<x-cards data-columns="1">
  <x-card data-title="Feature 1" data-icon="lucide:rocket">Description of Feature 1.</x-card>
  <x-card data-title="Feature 2" data-icon="lucide:bolt">Description of Feature 2.</x-card>
</x-cards>
```

Example 2: Contains only one `<x-card>` (must include multiple cards)

```md
<x-cards data-columns="2">
  <x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
</x-cards>
```

Example 3: Markdown format multiple links

```md
For more detailed information on specific features, please refer to the following sections:
- [Using Discussions](./discussions.md)
- [Using the Blog](./blog.md)
- [Using Chat](./chat.md)
```

## XField: Structured data field

Suitable for displaying API parameters, return values, context data, and any structured data with metadata in a clean, organized format. Supports nested structures for complex data types.

### Attributes

- `data-name` (optional): The name of the field/parameter
- `data-type` (optional): The data type of the field (e.g., "string", "number", "boolean", "symbol", "object", "array", "function")
- `data-default` (optional): Default value for the field
- `data-required` (optional): Whether the field is required ("true" or "false")
- `data-deprecated` (optional): Whether the field is deprecated ("true" or "false")
- `data-desc` (optional): Simple description of the field (plain text only)

### Children

- For simple types (string, number, boolean): children can be empty or contain exactly one `<x-field-desc>` element
- For complex types (object, array), children contain nested `<x-field>` elements and optionally one `<x-field-desc>` element

### Usage Rules

- **Opening/Closing Tags Format**: `<x-field ...></x-field>` for all types
- **Maximum Nesting Depth**: 5 levels (to avoid overly complex structures)
- **Description Mutually Exclusive**: Use either `data-desc` attribute OR `<x-field-desc>` element, not both
- **Single Description Rule**: Only one `<x-field-desc>` element per `<x-field>` is allowed
- **Grouping Requirement**: Wrap the outermost `<x-field>` elements with `<x-field-group>`, even if there's only one `<x-field>` element
- **Recursive Structure**: Use recursive `<x-field>` structures to fully express complex object type hierarchies, decomposing all nested properties into more fundamental types
- **Fixed Value Fields**: For fields that accept a limited set of predefined values (including enums, constants, or fixed strings), use `<x-field>` with the base data type (e.g., "string", "number") in the `data-type` attribute, and list all possible values in the description.
- **Function-Type Fields**: For fields with `data-type="function"`, nest `<x-field>` elements for parameters (`data-name="parameters"`) and return value (`data-name="returnValue"`) **whenever their types are available**.

### Good Examples

Example 1: Simple field with all attributes

```md
### Returns

<x-field-group>
  <x-field data-name="user_id" data-type="string" data-default="u0911" data-required="true" data-deprecated="true" data-desc="Unique identifier for the user. Must be a valid UUID v4 format."></x-field>
</x-field-group>
```

Example 2: Field with markdown description

```md
### Context

<x-field-group>
  <x-field data-name="api_key" data-type="string" data-required="true">
    <x-field-desc markdown>Your **API key** for authentication. Generate one from the `Settings > API Keys` section. Keep it secure and never expose it in client-side code.</x-field-desc>
  </x-field>
</x-field-group>
```

Example 3: Nested object structure

```md
### Properties

<x-field-group>
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
</x-field-group>
```

Example 4: Multiple fields for Parameters

```md
### Parameters

<x-field-group>
  <x-field data-name="user_id" data-type="string" data-required="true" data-desc="Unique identifier for the user. Must be a valid UUID v4 format."></x-field>
  <x-field data-name="include_profile" data-type="boolean" data-required="false" data-default="false" data-desc="Whether to include the user's profile information in the response"></x-field>
  <x-field data-name="options" data-type="object" data-required="false" data-desc="Additional options for the request">
    <x-field data-name="format" data-type="string" data-required="false" data-default="json">
      <x-field-desc>Response format: `json` or `xml`</x-field-desc>
    </x-field>
    <x-field data-name="locale" data-type="string" data-required="false" data-default="en" data-desc="Language locale for localized content"></x-field>
  </x-field>
</x-field-group>
```

Example 5: Enum values with base type and description

```md
### Status

<x-field-group>
  <x-field data-name="status" data-type="string" data-required="true" data-default="pending" data-desc="Current status of the request. Possible values: 'pending', 'processing', 'completed', 'failed'"></x-field>
  <x-field data-name="priority" data-type="number" data-required="false" data-default="1">
    <x-field-desc markdown>Priority level for the task. **Valid values**: `1` (low), `2` (medium), `3` (high), `4` (urgent)</x-field-desc>
  </x-field>
</x-field-group>
```

Example 6: Function type field with nested parameters and return value

```md
### API Methods

<x-field-group>
  <x-field data-name="authenticate" data-type="function" data-required="true" data-desc="Authenticates a user with email and password">
    <x-field data-name="parameters" data-type="object" data-desc="Function parameters">
      <x-field data-name="email" data-type="string" data-required="true" data-desc="User's email address"></x-field>
      <x-field data-name="password" data-type="string" data-required="true" data-desc="User's password"></x-field>
      <x-field data-name="rememberMe" data-type="boolean" data-required="false" data-default="false" data-desc="Whether to keep user logged in"></x-field>
    </x-field>
    <x-field data-name="returnValue" data-type="object" data-desc="Function return value">
      <x-field data-name="success" data-type="boolean" data-required="true" data-desc="Whether authentication was successful"></x-field>
      <x-field data-name="token" data-type="string" data-required="false" data-desc="JWT token if authentication successful"></x-field>
      <x-field data-name="user" data-type="object" data-required="false" data-desc="User information if authentication successful">
        <x-field data-name="id" data-type="string" data-required="true" data-desc="User ID"></x-field>
        <x-field data-name="name" data-type="string" data-required="true" data-desc="User's display name"></x-field>
        <x-field data-name="email" data-type="string" data-required="true" data-desc="User's email address"></x-field>
      </x-field>
    </x-field>
  </x-field>
</x-field-group>
```

### Bad Examples

Example 1: Using self-closing tag (violates "Opening/Closing Tags Format" rule)

```md
<x-field-group>
  <x-field data-name="user_id" data-type="string" data-required="true" data-desc="User identifier" />
</x-field-group>
```

Example 2: Using both `data-desc` and `<x-field-desc>` (violates "Description Mutually Exclusive" rule)

```md
<x-field-group>
  <x-field data-name="api_key" data-type="string" data-required="true" data-desc="API key for authentication">
    <x-field-desc markdown>Your **API key** for authentication. Keep it secure and never expose it.</x-field-desc>
  </x-field>
</x-field-group>
```

Example 3: Using multiple `<x-field-desc>` elements (violates "Single Description Rule")

```md
<x-field-group>
  <x-field data-name="config" data-type="object" data-required="true">
    <x-field-desc markdown>Configuration object for the application.</x-field-desc>
    <x-field-desc markdown>Contains all runtime settings and preferences.</x-field-desc>
  </x-field>
</x-field-group>
```

Example 4: Nesting other child elements (violates "Children" rule)

```md
<x-field-group>
  <x-field data-name="user" data-type="object" data-required="true">
    <div>User information</div>
    <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
  </x-field>
</x-field-group>
```

Example 5: Missing x-field-group wrapper (violates "Grouping Requirement" rule)

```md
<x-field data-name="apiConfig" data-type="object" data-required="true" data-desc="API configuration object">
  <x-field data-name="baseUrl" data-type="string" data-required="true" data-desc="Base URL for API calls"></x-field>
  <x-field data-name="timeout" data-type="number" data-required="false" data-default="5000" data-desc="Request timeout in milliseconds"></x-field>
</x-field>
```

Example 6: Exceeding maximum nesting depth (violates "Maximum Nesting Depth" rule)

```md
<x-field-group>
  <x-field data-name="level1" data-type="object" data-required="true">
    <x-field data-name="level2" data-type="object" data-required="true">
      <x-field data-name="level3" data-type="object" data-required="true">
        <x-field data-name="level4" data-type="object" data-required="true">
          <x-field data-name="level5" data-type="object" data-required="true">
            <x-field data-name="level6" data-type="string" data-required="true" data-desc="Too deep nesting"></x-field>
          </x-field>
        </x-field>
      </x-field>
    </x-field>
  </x-field>
</x-field-group>
```

## XFieldDesc Rich field description

Used to provide rich text descriptions for `<x-field>` elements, supporting inline markdown formatting for enhanced readability.

### Attributes

- `markdown` (required): **MUST** be set to "markdown" . This attribute is mandatory and cannot be omitted
  - **Validation**: `<x-field-desc>` without `markdown` attribute will be rejected

### Children

- Supports **bold text**, `inline code`, _italic text_, and other inline markdown
- Description text must be provided as child content of `<x-field-desc>`, not as the value of the `markdown` attribute
- **Inline Markdown Only**: Allow only inline Markdown (e.g., `**bold**`, *italic*, `inline code`); block elements like code blocks, headings, lists, or tables are **not allowed**.

### Usage Rules

- **Parent Requirement**: Must be child of `<x-field>`: `<x-field-desc>` can only appear as a child element of `<x-field>` components

### Good Examples

Example 1: Basic markdown description

```md
<x-field-desc markdown>Your **API key** for authentication. Generate one from the `Settings > API Keys` section. Keep it secure and never expose it in client-side code.</x-field-desc>
```

Example 2: Description with inline code

```md
<x-field-desc markdown>**JWT token** containing user identity and permissions. Expires in `24 hours` by default. Use the `refresh_token` to obtain a new one.</x-field-desc>
```

### Bad Examples

Example 1: Missing markdown attribute (violates "markdown attribute required" rule)

```md
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc>Your **API key** for authentication.</x-field-desc>
</x-field>
```

Example 2: Incorrect markdown attribute usage (violates "markdown attribute format" rule)

```md
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc markdown="Your **API key** for authentication."></x-field-desc>
</x-field>
```

Example 3: Using self-closing tag (violates "opening/closing tags format" rule)

```md
<x-field data-name="user_id" data-type="string" data-required="true">
  <x-field-desc markdown />
</x-field>
```

Example 4: Containing block-level elements (violates "Inline Content Only" rule)

````md
<x-field data-name="config" data-type="object" data-required="true">
  <x-field-desc markdown>
    **Configuration settings** for the application.
    
    ## Important Notes
    - Set debug to true for development
    - Use production database in production
    
    ```javascript
    const config = { debug: true };
    ```
  </x-field-desc>
</x-field>
````

Example 5: Used outside of x-field component (violates "Parent Requirement" rule)

```md
<x-field-desc markdown>This description is not inside an x-field component.</x-field-desc>
```

Example 6: Used as child of other components (violates "Parent Requirement" rule)

```md
<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
  <x-field-desc markdown>This description is not inside an x-field component.</x-field-desc>
</x-field-group>
```

## XFieldGroup: Field grouping container

Used to group multiple related `<x-field>` elements at the top level, indicating they belong to the same object or context. This provides better organization and visual grouping for related parameters.

### Attributes

- No attributes required

### Children

- Only `<x-field>` elements are allowed as children

### Usage Rules

- **Top-Level Only**: Used only at the top level for grouping related `<x-field>` elements. Cannot be nested inside other `<x-field>` or `<x-field-group>` elements
- **Structured Data Only**: Use `<x-field-group>` for fields **other than simple types** (`string`, `number`, `boolean`, `symbol`), e.g., Properties, Context, Parameters, Return values. For simple-type fields, use plain Markdown text.
- **Spacing Around**: Always insert a blank line before and after `<x-field-group>` when it’s adjacent to Markdown content.

### Good Examples

Example 1: Product information fields

```md
<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the product."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="An optional description for the product."></x-field>
  <x-field data-name="type" data-type="string" data-required="false" data-desc="The type of product (e.g., 'service', 'good')."></x-field>
  <x-field data-name="price" data-type="number" data-required="true" data-default="0">
    <x-field-desc markdown>Product price in **USD**. Must be a positive number with up to 2 decimal places.</x-field-desc>
  </x-field>
</x-field-group>
```

### Bad Examples

Example 1: Nested inside x-field component (violates "Top-Level Only" rule)

```md
<x-field data-name="user" data-type="object" data-required="true">
  <x-field-group>
    <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
    <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
  </x-field-group>
</x-field>
```

Example 2: Nested inside another x-field-group (violates "Top-Level Only" rule)

```md
<x-field-group>
  <x-field data-name="user" data-type="object" data-required="true" data-desc="User information"></x-field>
  <x-field-group>
    <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
    <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
  </x-field-group>
</x-field-group>
```

Example 3: Containing non-x-field elements (violates "Only x-field elements allowed" rule)

```md
<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
  <div>Additional information</div>
  <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
</x-field-group>
```

Example 4: Empty x-field-group (violates "Must contain x-field elements" rule)

```md
<x-field-group>
</x-field-group>
```

Example 5: Using x-field-group for simple-type (violates "Structured Data Only" rule)

```md
### appName

<x-field-group>
  <x-field data-name="appName" data-type="string" data-required="true" data-desc="specifies the name of the application"></x-field>
</x-field-group>
```

Example 6: Missing blank line before x-field-group (violates "Spacing Around" rule)

```md
**Parameters**
<x-field-group>
  <x-field data-name="initialState" data-type="any" data-required="false">
    <x-field-desc markdown>The initial state value.</x-field-desc>
  </x-field>
</x-field-group>

`useReducer` returns an array with two items:
<x-field-group>
  <x-field data-name="dispatch" data-type="function" data-desc="A function that you can call with an action to update the state."></x-field>
</x-field-group>
```

</custom_components_usage_rules>
