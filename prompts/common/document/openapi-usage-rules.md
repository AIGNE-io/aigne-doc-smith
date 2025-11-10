{% if openAPISpec %}
<openapi_spec_content>

## OpenAPI File Content
{{ openAPISpec }}

</openapi_spec_content>

<openapi_usage_rules>
## OpenAPI Usage Rules

Use the provided OpenAPI (Swagger) specification in `<openapi_usage_rules>`, align it with the current page objective, and leverage it to refine this document.

### Documentation Requirements and Constraints

- Extract the core content
  - Organize the document by functional modules.
  - For each path item, include the following elements:
    - HTTP method and path.
    - Concise summary.
    - Detailed description.
    - Request parameters: name, location (`in`), type, required flag, description.
    - Request body: describe its structure when present.
    - Response body: describe its structure, ignore status code layer.
    - Response Example: provide example responses for common scenarios

- Mandatory API description constraints (deduplication rule):
  - **Ensure** that throughout the document (including preface, overview, etc.), any introduction to the project APIs appears only within this OpenAPI-generated "API reference" section.
  - **Never** repeat or expand the interface list elsewhere in the document (for example, "Quick Start" or "Architecture Overview" sections).

### Expected Output Format
- A concise, clear, and easy-to-scan Markdown document.

### Examples
#### OpenAPI Spec Content
```yml
openapi: 3.0.1
info:
  title: DISCUSS KIT
  description: ''
  version: 1.0.0
paths:
  /api/v1/sdk/posts:
    get:
      summary: List posts
      deprecated: false
      description: 'List posts'
      parameters:
        - name: type
          in: query
          description: 'The type of the posts'
          required: false
          example: blog
          schema:
            type: string
            enum:
              - discussion
              - blog
              - doc
        - name: locale
          in: query
          description: 'The locale of the posts'
          required: false
          example: en
          schema:
            type: string
            default: en
            examples:
              - en
              - zh
        - name: page
          in: query
          description: 'The page number'
          required: false
          example: 1
          schema:
            type: integer
        - name: size
          in: query
          description: 'The number of posts per page'
          required: false
          example: 20
          schema:
            type: integer
        - name: sort
          in: query
          description: 'The sort order of the posts'
          required: false
          example: '-createdAt'
          schema:
            type: string
            enum:
              - createdAt
              - '-createdAt'
        - name: labels
          in: query
          description: 'The labels of the posts'
          required: false
          example:
            - did
          schema:
            type: array
            items:
              type: string
            nullable: true
      responses:
        '200':
          description: succeed
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties: {}
                  meta:
                    type: object
                    properties:
                      total:
                        type: integer
                    required:
                      - total
                required:
                  - data
                  - meta
```

#### Generate Output
````md
### List posts

Retrieves a list of posts, which can be filtered by type, locale, and other criteria. This endpoint supports pagination.

`GET` `/api/v1/sdk/posts`

#### Parameters

<x-field-group>
  <x-field data-name="type" data-type="string" data-required="false" data-default="blog">
    <x-field-desc markdown>The type of posts to retrieve. Can be `discussion`, `blog`, or `doc`.</x-field-desc>
  </x-field>
  <x-field data-name="locale" data-type="string" data-required="false" data-default="en">
    <x-field-desc markdown>The locale of the posts, e.g., `en` or `zh`.</x-field-desc>
  </x-field>
  <x-field data-name="page" data-type="integer" data-required="false">
    <x-field-desc markdown>The page number for pagination.</x-field-desc>
  </x-field>
  <x-field data-name="size" data-type="integer" data-required="false" data-default="20">
    <x-field-desc markdown>The number of posts to return per page.</x-field-desc>
  </x-field>
  <x-field data-name="sort" data-type="string" data-required="false" data-default="-createdAt">
    <x-field-desc markdown>The sort order for the posts. Use `createdAt` for ascending or `-createdAt` for descending.</x-field-desc>
  </x-field>
  <x-field data-name="labels" data-type="array" data-required="false">
    <x-field-desc markdown>An array of label strings to filter posts by.</x-field-desc>
  </x-field>
</x-field-group>

#### Responses

<x-field-group>
  <x-field data-name="data" data-type="array" data-required="true">
    <x-field-desc markdown>An array of post objects.</x-field-desc>
  </x-field>
  <x-field data-name="meta" data-type="object" data-required="true">
    <x-field-desc markdown>Metadata for pagination.</x-field-desc>
    <x-field data-name="total" data-type="integer" data-required="true" data-desc="The total number of posts available."></x-field>
  </x-field>
</x-field-group>

#### Response Example

```json posts result
{
  "data": [
    {
      "id": "15bcb4e7-8bd9-4759-b60b-ae826534057a",
      "title": "Example Blog Post",
      "content": "This is the content of the blog post.",
      "createdAt": "2023-10-27T10:00:00Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```
````

</openapi_usage_rules>
{% endif %}
