<x-field-usage-rules>
## XField Usage Rules

XField is structured data field, suitable for displaying API parameters, return values, context data, and any structured data with metadata in a clean, organized format. Supports nested structures for complex data types.

### Attributes

- `data-name` (optional): The name of the field/parameter
- `data-type` (optional): The data type of the field (e.g., "string", "number", "boolean", "symbol", "object", "array", "function")
- `data-default` (optional): Default value for the field
- `data-required` (optional): Whether the field is required ("true" or "false")
- `data-deprecated` (optional): Whether the field is deprecated ("true" or "false")
- `data-desc` (optional): Simple description of the field. Do not use any Markdown syntax (see `<markdown_syntax_rules>` for the full list).

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

- Example 1: Simple field with all attributes
  ```md
  ### Returns

  <x-field-group>
    <x-field data-name="user_id" data-type="string" data-default="u0911" data-required="true" data-deprecated="true" data-desc="Unique identifier for the user. Must be a valid UUID v4 format."></x-field>
  </x-field-group>
  ```

- Example 2: Field with markdown description
  ```md
  ### Context

  <x-field-group>
    <x-field data-name="api_key" data-type="string" data-required="true">
      <x-field-desc markdown>Your **API key** for authentication. Generate one from the `Settings > API Keys` section. Keep it secure and never expose it in client-side code.</x-field-desc>
    </x-field>
  </x-field-group>
  ```

- Example 3: Nested object structure
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

- Example 4: Multiple fields for Parameters
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

- Example 5: Enum values with base type and description
  ```md
  ### Status

  <x-field-group>
    <x-field data-name="status" data-type="string" data-required="true" data-default="pending" data-desc="Current status of the request. Possible values: 'pending', 'processing', 'completed', 'failed'"></x-field>
    <x-field data-name="priority" data-type="number" data-required="false" data-default="1">
      <x-field-desc markdown>Priority level for the task. **Valid values**: `1` (low), `2` (medium), `3` (high), `4` (urgent)</x-field-desc>
    </x-field>
  </x-field-group>
  ```

- Example 6: Function type field with nested parameters and return value
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

- Example 1: Using self-closing tag (violates "Opening/Closing Tags Format" rule)
  ```md
  <x-field-group>
    <x-field data-name="user_id" data-type="string" data-required="true" data-desc="User identifier" />
  </x-field-group>
  ```

- Example 2: Using both `data-desc` and `<x-field-desc>` (violates "Description Mutually Exclusive" rule)
  ```md
  <x-field-group>
    <x-field data-name="api_key" data-type="string" data-required="true" data-desc="API key for authentication">
      <x-field-desc markdown>Your **API key** for authentication. Keep it secure and never expose it.</x-field-desc>
    </x-field>
  </x-field-group>
  ```

- Example 3: Using multiple `<x-field-desc>` elements (violates "Single Description Rule")
  ```md
  <x-field-group>
    <x-field data-name="config" data-type="object" data-required="true">
      <x-field-desc markdown>Configuration object for the application.</x-field-desc>
      <x-field-desc markdown>Contains all runtime settings and preferences.</x-field-desc>
    </x-field>
  </x-field-group>
  ```

- Example 4: Nesting other child elements (violates "Children" rule)
  ```md
  <x-field-group>
    <x-field data-name="user" data-type="object" data-required="true">
      <div>User information</div>
      <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
    </x-field>
  </x-field-group>
  ```

- Example 5: Missing x-field-group wrapper (violates "Grouping Requirement" rule)
  ```md
  <x-field data-name="apiConfig" data-type="object" data-required="true" data-desc="API configuration object">
    <x-field data-name="baseUrl" data-type="string" data-required="true" data-desc="Base URL for API calls"></x-field>
    <x-field data-name="timeout" data-type="number" data-required="false" data-default="5000" data-desc="Request timeout in milliseconds"></x-field>
  </x-field>
  ```

- Example 6: Exceeding maximum nesting depth (violates "Maximum Nesting Depth" rule)
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

</x-field-usage-rules>
