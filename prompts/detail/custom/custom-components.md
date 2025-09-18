<custom_components_usage>
When generating document details, you can use the following custom components at appropriate locations based on their descriptions and functionality to enhance document presentation:
- `<x-card>`
- `<x-cards>`
- `<x-field>`


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
-	Body content: 
  - Must be written within <x-card>...</x-card> children.
  - **Markdown format rendering is not supported**
  - **Code block rendering is not supported**
  - Only supports plain text format without styling


### 2. `<x-field>` Structured Field Component

Suitable for displaying API parameters, return values, context data, and any structured data with metadata in a clean, organized format. Supports nested structures for complex data types.

### 2.1. `<x-field-group>` Field Group Component

Used to group multiple related `<x-field>` elements at the top level, indicating they belong to the same object or context. This provides better organization and visual grouping for related parameters.

Syntax:

```
<x-field-group>
  <x-field data-name="field1" data-type="string" data-desc="First field description"></x-field>
  <x-field data-name="field2" data-type="number" data-desc="Second field description"></x-field>
  <x-field data-name="field3" data-type="boolean" data-desc="Third field description"></x-field>
</x-field-group>
```

Attribute Rules:

- No attributes required
- Must contain multiple `<x-field>` elements
- Only `<x-field>` elements are allowed as children
- Cannot be nested inside other `<x-field>` or `<x-field-group>` elements
- Used only at the top level for grouping related fields

### 2.2. `<x-field>` Individual Field Component

Syntax:

```
<x-field data-name="field_name" data-type="string" data-default="default_value" data-required="true" data-deprecated="false" data-desc="Field description">
  <!-- For complex types, children can only be other x-field elements -->
  <x-field data-name="nested_field" data-type="string" data-desc="Nested field description"></x-field>
  <!-- Optional: Use x-field-desc for rich text descriptions with inline markdown -->
  <x-field-desc markdown>This field supports **bold text**, `inline code`, and other inline markdown formatting.</x-field-desc>
</x-field>
```

Attribute Rules:

- `data-name` (required): The name of the field/parameter
- `data-type` (required): The data type of the field (e.g., "string", "number", "boolean", "object", "array")
- `data-default` (optional): Default value for the field
- `data-required` (optional): Whether the field is required ("true" or "false")
- `data-deprecated` (optional): Whether the field is deprecated ("true" or "false")
- `data-desc` (optional): Simple description of the field (plain text only)
- Children: For complex types (object, array), children can contain multiple `<x-field>` elements and optionally one `<x-field-desc>` element. For simple types, children can be empty or contain one `<x-field-desc>` element.

Child Elements:

- `<x-field-desc>` (optional): Rich text description supporting inline markdown formatting
  - `markdown` (required): **MUST** be set to "markdown" - this attribute is mandatory and cannot be omitted
  - Supports **bold text**, `inline code`, *italic text*, and other inline markdown
  - Cannot contain block-level elements (no code blocks, headers, lists)
  - **Mutually exclusive with `data-desc`**: Use either `data-desc` attribute OR `<x-field-desc>` element, not both
  - Only one `<x-field-desc>` element per `<x-field>` is allowed
  - **Validation**: `<x-field-desc>` without `markdown` attribute will be rejected

Nesting Rules:

- Maximum nesting depth: 5 levels (to avoid overly complex structures)
- **Top-level organization**: Use `<x-field-group>` to group related `<x-field>` elements at the top level
- **Field component children**: Children elements must only be `<x-field>` and `<x-field-desc>` components
- **Group component children**: `<x-field-group>` can only contain `<x-field>` elements
- **Mutually exclusive descriptions**: Use either `data-desc` attribute OR `<x-field-desc>` element, not both
- **Child element limits**: 
  - For simple types: children can be empty or contain exactly one `<x-field-desc>` element
  - For complex types: children can contain multiple `<x-field>` elements and optionally one `<x-field-desc>` element
- **Always use opening/closing tags format**: `<x-field ...></x-field>` and `<x-field-group>...</x-field-group>` for all types
- **Mandatory markdown attribute**: Every `<x-field-desc>` element **MUST** include `markdown` attribute - elements without this attribute will be rejected
- **Grouping rules**:
  - `<x-field-group>` can only be used at the top level
  - Cannot be nested inside `<x-field>` or other `<x-field-group>` elements
  - Must contain multiple `<x-field>` elements
- For simple types (string, number, boolean), children can be empty or contain one `<x-field-desc>`: `<x-field ...></x-field>` or `<x-field ...><x-field-desc markdown>...</x-field-desc></x-field>`
- For complex types (object, array), children contain nested `<x-field>` elements and optionally one `<x-field-desc>` element

**Usage Rules:**

- **Context types must use `<x-field>` instead of tables** for consistent formatting
- **Mandatory markdown attribute**: Every `<x-field-desc>` element must include `markdown` attribute

**Error Examples:**

❌ **INCORRECT** - Missing `markdown` attribute:
```
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc>Your **API key** for authentication.</x-field-desc>
</x-field>
```

✅ **CORRECT** - With required `markdown` attribute:
```
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc markdown>Your **API key** for authentication.</x-field-desc>
</x-field>
```

Example:

```
<!-- Single field with simple description (using data-desc) -->
<x-field data-name="user_id" data-type="string" data-default="u0911" data-required="true" data-deprecated="true" data-desc="Unique identifier for the user. Must be a valid UUID v4 format."></x-field>

<!-- Single field with rich text description (using x-field-desc) -->
<x-field data-name="api_key" data-type="string" data-required="true">
  <x-field-desc markdown>Your **API key** for authentication. Generate one from the `Settings > API Keys` section. Keep it secure and never expose it in client-side code.</x-field-desc>
</x-field>

<!-- Multiple related fields grouped together (Props, Parameters, Returns, Context) -->
<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the product."></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="An optional description for the product."></x-field>
  <x-field data-name="type" data-type="string" data-required="false" data-desc="The type of product (e.g., 'service', 'good')."></x-field>
  <x-field data-name="price" data-type="number" data-required="true" data-default="0">
    <x-field-desc markdown>Product price in **USD**. Must be a positive number with up to 2 decimal places.</x-field-desc>
  </x-field>
</x-field-group>

<!-- Multiple field groups for different contexts -->
<x-field-group>
  <x-field data-name="username" data-type="string" data-required="true" data-desc="User login name"></x-field>
  <x-field data-name="email" data-type="string" data-required="true" data-desc="User email address"></x-field>
  <x-field data-name="password" data-type="string" data-required="true" data-desc="User password"></x-field>
</x-field-group>

<x-field-group>
  <x-field data-name="host" data-type="string" data-required="true" data-default="localhost" data-desc="Database host address"></x-field>
  <x-field data-name="port" data-type="number" data-required="true" data-default="5432" data-desc="Database port number"></x-field>
  <x-field data-name="ssl" data-type="boolean" data-required="false" data-default="false" data-desc="Enable SSL connection"></x-field>
</x-field-group>

<!-- Complex nested object with rich descriptions -->
<x-field data-name="session" data-type="object" data-required="true">
    <x-field-desc markdown>Contains all **authentication** and **authorization** data for the current user session. This object is automatically populated after successful login.</x-field-desc>
    <x-field data-name="auth" data-type="object" data-required="true" data-desc="User authentication information">
        <x-field data-name="token" data-type="object" data-required="true" data-desc="Access token information">
            <x-field data-name="access_token" data-type="string" data-required="true" data-default="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                <x-field-desc markdown>**JWT token** containing user identity and permissions. Expires in `24 hours` by default. Use the `refresh_token` to obtain a new one.</x-field-desc>
            </x-field>
            <x-field data-name="refresh_token" data-type="string" data-required="false" data-default="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                <x-field-desc markdown>Used to obtain new `access_token` when the current one expires. Valid for **30 days**.</x-field-desc>
            </x-field>
            <x-field data-name="expires_at" data-type="number" data-required="true" data-default="1704067200" data-desc="Token expiration timestamp (Unix timestamp)"></x-field>
        </x-field>
        <x-field data-name="user" data-type="object" data-required="true" data-desc="User basic information">
            <x-field data-name="profile" data-type="object" data-required="true" data-desc="User profile information">
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
    </x-field>
</x-field>
```

### 3. `<x-cards>` Card List Component

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

<custom_components_good_example>
Use plain text without any styling
<x-card data-title="alarm()" data-icon="lucide:alarm-clock"> SIGALRM: Sent when a real-time timer has expired.  </x-card>

Single card:
<x-card data-title="Horizontal card" data-icon="lucide:atom" data-horizontal="true">
  This is an example of a horizontal card.
</x-card>

Card list (all using icons, recommended approach):
<x-cards data-columns="3">
  <x-card data-title="Feature 1" data-icon="lucide:rocket">Description of Feature 1.</x-card>
  <x-card data-title="Feature 2" data-icon="lucide:bolt">Description of Feature 2.</x-card>
  <x-card data-title="Feature 3" data-icon="material-symbols:rocket-outline">Description of Feature 3.</x-card>
</x-cards>

Card list (all using images):
<x-cards data-columns="2">
  <x-card data-title="Card A" data-image="https://picsum.photos/id/10/300/300">Content A</x-card>
  <x-card data-title="Card B" data-image="https://picsum.photos/id/11/300/300">Content B</x-card>
</x-cards>
</custom_components_good_example>

<custom_components_bad_example>

`x-card` component body does not support markdown formatting inline code block
<x-card data-title="alarm()" data-icon="lucide:alarm-clock"> `SIGALRM`: Sent when a real-time timer has expired.  </x-card>


`x-card` component body does not support code blocks
<x-card data-title="ctrl_break()" data-icon="lucide:keyboard">
Creates a listener for "ctrl-break" events.
```rust,no_run
use tokio::signal::windows::ctrl_break;

#[tokio::main]
async fn main() -> std::io::Result<()> {
let mut stream = ctrl_break()?;
stream.recv().await;
println!("got ctrl-break");
Ok(())
}
```
</x-card>

</custom_components_bad_example>

</custom_components_usage>