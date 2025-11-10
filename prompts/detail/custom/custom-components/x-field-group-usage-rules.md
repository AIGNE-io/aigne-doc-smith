<x-field-group-usage-rules>
## XFieldGroup Usage Rules

XFieldGroup is field grouping container. Used to group multiple related `<x-field>` elements at the top level, indicating they belong to the same object or context. This provides better organization and visual grouping for related parameters.

### Attributes

- No attributes required

### Children

- Only `<x-field>` elements are allowed as children

### Usage Rules

- **Top-Level Only**: Used only at the top level for grouping related `<x-field>` elements. Cannot be nested inside other `<x-field>` or `<x-field-group>` elements
- **Structured Data Only**: Use `<x-field-group>` for fields **other than simple types** (`string`, `number`, `boolean`, `symbol`), e.g., Properties, Context, Parameters, Return values. For simple-type fields, use plain Markdown text.
- **Spacing Around**: Always insert a blank line before and after `<x-field-group>` when it’s adjacent to Markdown content.

### Good Examples

- Example 1: Product information fields
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

- Example 1: Nested inside x-field component (violates "Top-Level Only" rule)
  ```md
  <x-field data-name="user" data-type="object" data-required="true">
    <x-field-group>
      <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
      <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
    </x-field-group>
  </x-field>
  ```

- Example 2: Nested inside another x-field-group (violates "Top-Level Only" rule)
  ```md
  <x-field-group>
    <x-field data-name="user" data-type="object" data-required="true" data-desc="User information"></x-field>
    <x-field-group>
      <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
      <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
    </x-field-group>
  </x-field-group>
  ```

- Example 3: Containing non-x-field elements (violates "Only x-field elements allowed" rule)
  ```md
  <x-field-group>
    <x-field data-name="name" data-type="string" data-required="true" data-desc="User name"></x-field>
    <div>Additional information</div>
    <x-field data-name="email" data-type="string" data-required="true" data-desc="User email"></x-field>
  </x-field-group>
  ```

- Example 4: Empty x-field-group (violates "Must contain x-field elements" rule)
  ```md
  <x-field-group>
  </x-field-group>
  ```

- Example 5: Using x-field-group for simple-type (violates "Structured Data Only" rule)
  ```md
  ### appName

  <x-field-group>
    <x-field data-name="appName" data-type="string" data-required="true" data-desc="specifies the name of the application"></x-field>
  </x-field-group>
  ```

- Example 6: Missing blank line before x-field-group (violates "Spacing Around" rule)
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
</x-field-group-usage-rules>
