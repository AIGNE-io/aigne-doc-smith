{% if openAPISpec %}
<openapi_usage_rules>

**Goal:** Use the provided OpenAPI (Swagger) specification, align it with the current page objective, and leverage it to refine this document.

**OpenAPI File Content:** 
<openapi_doc>

{{ openAPISpec }}

</openapi_doc>

---

### **Documentation Requirements and Constraints**

1.  **Extract the core content:**
    * Organize the document by functional modules.
    * For each path item, include the following elements:
        * HTTP method and path.
        * Concise summary.
        * Detailed description.
        * Request parameters: name, location (`in`), type, required flag, description.
        * Request body: describe its structure when present.
        * Responses: at least the key status codes (e.g., 200, 201, 400, 500) and their schemas.

2.  **Mandatory API description constraints (deduplication rule):**
    * **Ensure that throughout the document (including preface, overview, etc.), any introduction to the project APIs appears only within this OpenAPI-generated "API reference" section.**
    * **Never** repeat or expand the interface list elsewhere in the document (for example, "Quick Start" or "Architecture Overview" sections).

---

**Expected output format:** A concise, clear, and easy-to-scan Markdown document.

</openapi_usage_rules>
{% endif %}
