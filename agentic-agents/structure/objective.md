# Generate Document Structure

## Goal

Analyze a given workspace repository and design a comprehensive, user-focused documentation structure that helps readers understand the project effectively.

## Output Schema

The final output must be a YAML structure following this schema:

```yaml
project:
  title: string          # Project name (max 40 characters)
  description: string    # Project description (max 160 characters)

documents:
  - title: string        # Document section title
    description: string  # What this section covers
    sourcePaths:         # Array of file paths (NOT directories) - relative paths without 'workspace:' prefix
      - string           # e.g., "README.md", "src/index.ts" (files only, not "src/" or "docs/")
    children:            # Nested document sections (recursive structure)
      - title: string
        description: string
        sourcePaths: [string]  # Must be files, not folders
        children: [...]
```

## Output Location

The generated documentation structure will be saved to:
- **AFS Path**: `/modules/docs-structure/document_structure.yaml`
- **Physical Path**: `.aigne/doc-smith/output/document_structure.yaml` (relative to workspace root)

## Success Criteria

### Design Requirements

{% include "design-rules.md" %}

### Quality Review Standards

{% include "review-criteria.md" %}

## User Rules and Feedback

{% if rules %}
<user_rules>
{{ rules }}

** Output content in {{ locale }} language **
</user_rules>
{% endif %}

{% if feedback %}
<user_feedback>
{{ feedback }}
</user_feedback>
{% endif %}

**Important Guidelines:**
- **User Rules**: User-specified requirements like "number of sections", "must include XXX", "cannot include XXX" - these have the highest priority
- **User Feedback**: If provided, make only necessary modifications based on feedback without major changes
- **User Locale**: Return all content in `{{ locale }}` language
- **If previous structure exists but no feedback is given**: Directly return the previous documentation structure

## YAML Format Validation

**CRITICAL: Before saving the YAML file, strictly validate the format:**

✅ **Correct format example:**
```yaml
project:
  title: "My Project"
  description: "A brief description of the project"

documents:
  - title: "Getting Started"
    description: "Introduction to the project"
    sourcePaths:
      - README.md
      - docs/intro.md
    children: []
  - title: "API Reference"
    description: "Complete API documentation"
    sourcePaths:
      - docs/api.md
    children:
      - title: "Core API"
        description: "Core functionality"
        sourcePaths:
          - docs/api/core.md
        children: []
```

❌ **Common mistakes to avoid:**
1. Missing space after colon: `title:"Test"` (wrong) → `title: "Test"` (correct)
2. Wrong indentation: Must be exactly 2 spaces per level
3. Missing dash for list items: `documents: title: "Test"` (wrong) → `documents: - title: "Test"` (correct)
4. Directory paths in sourcePaths: `sourcePaths: - src/` (wrong) → `sourcePaths: - src/index.ts` (correct)
5. Including module prefix: `/modules/workspace/README.md` (wrong) → `README.md` (correct)

## Example Output Structure
```yaml
project:
  title: "Awesome Library"
  description: "A powerful library for building modern web applications"

documents:
  - title: "Overview"
    description: "Introduction to Awesome Library and its core concepts"
    sourcePaths:
      - README.md
      - docs/introduction.md
    children: []
  - title: "Getting Started"
    description: "Step-by-step guide to installing and using the library"
    sourcePaths:
      - README.md
      - docs/installation.md
      - package.json
    children: []
  - title: "API Reference"
    description: "Complete API documentation"
    sourcePaths:
      - src/index.ts
      - docs/api.md
    children:
      - title: "Core API"
        description: "Core library functions and classes"
        sourcePaths:
          - src/core/index.ts
          - src/core/types.ts
        children: []
      - title: "Utilities"
        description: "Utility functions and helpers"
        sourcePaths:
          - src/utils/index.ts
        children: []
```