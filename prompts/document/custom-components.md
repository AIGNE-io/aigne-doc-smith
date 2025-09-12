<custom_component>
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

Syntax:

```
<x-field data-name="field_name" data-type="string" data-default="default_value" data-required="true" data-deprecated="false" data-desc="Field description">
  <!-- For complex types, children can only be other x-field elements -->
  <x-field data-name="nested_field" data-type="string" data-desc="Nested field description"></x-field>
</x-field>
```

Attribute Rules:

- `data-name` (required): The name of the field/parameter
- `data-type` (required): The data type of the field (e.g., "string", "number", "boolean", "object", "array")
- `data-default` (optional): Default value for the field
- `data-required` (optional): Whether the field is required ("true" or "false")
- `data-deprecated` (optional): Whether the field is deprecated ("true" or "false")
- `data-desc` (optional): Description of the field (replaces previous body content)
- Children: For complex types (object, array), children can only be other `<x-field>` elements. For simple types, children can be empty.

Nesting Rules:

- Maximum nesting depth: 5 levels (to avoid overly complex structures)
- Children elements must only be `<x-field>` components
- Use `data-desc` attribute for field descriptions instead of body content
- **Always use opening/closing tags format**: `<x-field ...></x-field>` for all types
- For simple types (string, number, boolean), children can be empty: `<x-field ...></x-field>`
- For complex types (object, array), children contain nested `<x-field>` elements

**Usage Rules:**

- **Context types must use `<x-field>` instead of tables** for consistent formatting

Example:

```
<!-- Single field -->
<x-field data-name="user_id" data-type="string" data-default="u0911" data-required="true" data-deprecated="true" data-desc="Unique identifier for the user. Must be a valid UUID v4 format."></x-field>

<!-- Multiple related fields (Props, Parameters, Returns, Context) -->
<x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the product."></x-field>
<x-field data-name="description" data-type="string" data-required="false" data-desc="An optional description for the product."></x-field>
<x-field data-name="type" data-type="string" data-required="false" data-desc="The type of product (e.g., 'service', 'good')."></x-field>

<!-- Complex nested object -->
<x-field data-name="session" data-type="object" data-required="true" data-desc="User session information containing authentication and permission data">
    <x-field data-name="auth" data-type="object" data-required="true" data-desc="User authentication information">
        <x-field data-name="token" data-type="object" data-required="true" data-desc="Access token information">
            <x-field data-name="access_token" data-type="string" data-required="true" data-default="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." data-desc="JWT access token for API authentication"></x-field>
            <x-field data-name="refresh_token" data-type="string" data-required="false" data-default="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." data-desc="Refresh token for obtaining new access tokens"></x-field>
            <x-field data-name="expires_at" data-type="number" data-required="true" data-default="1704067200" data-desc="Token expiration timestamp (Unix timestamp)"></x-field>
        </x-field>
        <x-field data-name="user" data-type="object" data-required="true" data-desc="User basic information">
            <x-field data-name="profile" data-type="object" data-required="true" data-desc="User profile information">
                <x-field data-name="name" data-type="string" data-required="true" data-default="John Doe" data-desc="User name"></x-field>
                <x-field data-name="email" data-type="string" data-required="true" data-default="john.doe@example.com" data-desc="User email address"></x-field>
                <x-field data-name="avatar" data-type="string" data-required="false" data-default="https://example.com/avatars/john-doe.jpg" data-desc="User avatar URL"></x-field>
            </x-field>
            <x-field data-name="permissions" data-type="array" data-required="true" data-default='["read", "write", "admin"]' data-desc="User permissions list"></x-field>
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

<good_example>
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
</good_example>

<bad_example>

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

</bad_example>

</custom_component>