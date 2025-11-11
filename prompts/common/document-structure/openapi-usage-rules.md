{% if userContext.openAPISpec %}

<openapi_usage_rules>
## OpenAPI Usage Rules

Use the provided OpenAPI (Swagger) specification in `<openapi_spec_content>` to design how the OpenAPI content and the overall document should be structured together.

### Documentation Requirements and Constraints

- Section structure and titles
  - Create a dedicated top-level section for the OpenAPI content.
  - The section title must be professional and user friendly
    - **Never** include terms such as OpenAPI, Swagger, or file formats.
    - Recommended titles include **"API Interface Reference"** or **"Interface Reference"**.

- Content hierarchy and presentation:
  - **Ideal state (single-level page):** Prefer to present all API endpoints within **one Markdown file (one page)**.
  - **Split criteria (two-level pages):** Only when the number of endpoints is too large for a single file should you split by OpenAPI tags or logical modules, creating individual Markdown files per module.
  - **Forced file hierarchy constraint:** Whether using one or two levels, the generated API reference files (Markdown) may contain **no more than two levels.**
    - **Example (two-level structure):** `/api-reference.md` (index) -> `/api/user.md`, `/api/order.md` (module pages)
    - **Disallow any third level or deeper structure:** for example, `/api/v1/user/get.md`.

- Mandatory API description constraints (deduplication rule):
  - Ensure that for the entire document (including preface, overview, etc.), any introduction to the project APIs appears only within this OpenAPI-generated "API reference" section.
  - **Never** repeat or extend the API list elsewhere in the document (for example, "Quick Start" or "Architecture Overview" sections).

</openapi_usage_rules>
{% endif %}
