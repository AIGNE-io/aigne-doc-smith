<x-field-desc-usage-rules>
## XFieldDesc Usage Rules

XFieldDesc is rich field description. Used to provide rich text descriptions for `<x-field>` elements, supporting inline markdown formatting for enhanced readability.

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

- Example 1: Basic markdown description
  ```md
  <x-field-desc markdown>Your **API key** for authentication. Generate one from the `Settings > API Keys` section. Keep it secure and never expose it in client-side code.</x-field-desc>
  ```

- Example 2: Description with inline code
  ```md
  <x-field-desc markdown>**JWT token** containing user identity and permissions. Expires in `24 hours` by default. Use the `refresh_token` to obtain a new one.</x-field-desc>
  ```

### Bad Examples

- Example 1: Missing markdown attribute (violates "markdown attribute required" rule)
  ```md
  <x-field data-name="api_key" data-type="string" data-required="true">
    <x-field-desc>Your **API key** for authentication.</x-field-desc>
  </x-field>
  ```

- Example 2: Incorrect markdown attribute usage (violates "markdown attribute format" rule)
  ```md
  <x-field data-name="api_key" data-type="string" data-required="true">
    <x-field-desc markdown="Your **API key** for authentication."></x-field-desc>
  </x-field>
  ```

- Example 3: Using self-closing tag (violates "opening/closing tags format" rule)
  ```md
  <x-field data-name="user_id" data-type="string" data-required="true">
    <x-field-desc markdown />
  </x-field>
  ```

- Example 4: Containing block-level elements (violates "Inline Content Only" rule)
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

- Example 5: Used outside of x-field component (violates "Parent Requirement" rule)
  ```md
  <x-field-desc markdown>This description is not inside an x-field component.</x-field-desc>
  ```

- Example 6: Used as child of other components (violates "Parent Requirement" rule)
  ```md
  <x-field-group>
    <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
    <x-field-desc markdown>This description is not inside an x-field component.</x-field-desc>
  </x-field-group>
  ```

</x-field-desc-usage-rules>
