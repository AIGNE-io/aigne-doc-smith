{% include "../prompts/common/document-structure/user-locale-rules.md" %}

{% include "../prompts/common/document-structure/user-preferences.md" %}

## Document Structure Schema

The document structure you need to generate follows this schema:

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

**Important Rules for `sourcePaths`**:
1. **Must be file paths, not directories**: Each entry must point to a specific file, never to a folder
2. **Must be relative paths**: Paths should be relative from the workspace root, **without** the `workspace:` prefix
3. **Examples**:
   - ✅ Correct: `src/index.ts`, `README.md`, `package.json`, `docs/api.md`
   - ❌ Wrong (directories): `src/`, `docs/`, `src/components/`
   - ❌ Wrong (prefix): `workspace:src/index.ts`
   - ❌ Wrong (absolute): `/absolute/path/file.ts`

file path: document_structure.yaml
```yaml
{{ documentStructureWithLines }}
```

<instructions>
You have access to the workspace repository through AFS (Agent File System) tools. The target repository is mounted at `/modules/workspace`. You must actively explore it like a professional software engineer analyzing a new project.

## Exploration Strategy

1. **Start with a deep directory listing**
   - **IMPORTANT**: Use `list` with `maxDepth` parameter to efficiently explore multiple directory levels at once
   - **The repository is mounted at `/modules/workspace`** - use this path directly in all AFS operations
   - Recommended approach: Start with `list("/modules/workspace", { maxDepth: 3 })` to get a comprehensive view of the project structure
   - For large projects, you can adjust maxDepth (2-5) based on project size and complexity
   - This gives you immediate visibility into the project's organization without multiple individual calls
   - **Benefits of maxDepth**:
     - ✅ Single call reveals entire project structure (directories and files at multiple levels)
     - ✅ Efficiently identifies project type, main directories (src/, docs/, tests/), and file organization
     - ✅ Quickly detects multi-package projects by seeing `packages/*/package.json` patterns
     - ❌ Without maxDepth: Requires many sequential calls, very slow and inefficient
   - **Detect multi-package projects** from the deep listing:
     - Common directory patterns: `packages/`, `apps/`, `libs/`, `modules/`, `crates/`
     - Monorepo configuration files: `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `Cargo.workspace`
     - Multiple package definition files in subdirectories (e.g., multiple `package.json`, `Cargo.toml`, `pyproject.toml`, `pom.xml`, `go.mod`)
   - The comprehensive file tree from maxDepth provides an excellent foundation for the document structure

2. **Read critical project files to understand project focus**
   - **PRIORITY: README and documentation files** - These reveal the project's purpose, key features, and what matters most:
     - Read README.md, README.txt, or similar files FIRST if they exist in the file tree
     - Look for CONTRIBUTING.md, ARCHITECTURE.md, docs/ folder content
     - These files tell you what the project emphasizes and what users need to understand
     - **Extract key insights**: What are the main features? What problems does it solve? What are the core concepts?
     - **Identify priorities**: Which parts of the codebase are highlighted? What workflows are documented?
   - **Configuration files** - Read these for project metadata:
     - Node.js: `package.json` (project name, description, main entry, scripts), `tsconfig.json`
     - Python: `pyproject.toml`, `setup.py`, `requirements.txt`
     - Rust: `Cargo.toml`
     - Go: `go.mod`
     - Java: `pom.xml`, `build.gradle`
   - **Use these insights when generating structure**:
     - If README emphasizes certain features/modules, create dedicated sections for them
     - If documentation highlights specific workflows, structure docs to support those workflows
     - Focus on what the project considers important, not just what exists in the code

3. **Explore specific areas in depth (if needed)**
   - If initial maxDepth listing wasn't sufficient, use `list` with maxDepth on specific subdirectories
   - Example: `list("/modules/workspace/packages/core", { maxDepth: 2 })` to dive deeper into a specific package
   - Use `search` to find specific patterns (API endpoints, class definitions, etc.)
   - Use `read` to examine key source files that represent core functionality
   - Don't read every file - focus on files that help understand the project structure and purpose
   - **For multi-package projects**: Explore each package/module individually:
     - Read each package's configuration file (language-agnostic)
     - Understand each package's purpose, dependencies, and entry points
     - Identify relationships between packages (internal dependencies)
     - Use `list("/modules/workspace/packages", { maxDepth: 2 })` to see all packages at once

4. **Generate and update the document structure**
   - **Prioritize based on project focus**: Use insights from README and docs to guide your structure
     - If README highlights specific features (e.g., "Key Features: Authentication, Real-time Updates"), create sections for these
     - If the project emphasizes certain workflows (e.g., "Getting Started", "Deployment"), mirror this in structure
     - Create documentation that helps users understand what the project owners consider most important
   - **Create a logical, user-focused hierarchy**:
     - Start with what users need first (overview, quick start, core concepts)
     - Follow with detailed sections for key features identified in step 2
     - Include advanced topics and reference material later
   - **Technical requirements**:
     - Ensure each document section has clear `sourcePaths` with relative paths (no `workspace:` prefix)
     - **Check the existing structure carefully**: Review the line-numbered content above to see what already exists
     - **Avoid duplicates**: Do not create document sections that already exist in the structure
   - **For multi-package projects**: Create hierarchical documentation structure:
     - Start with overview documentation (getting started, architecture overview)
     - Create a parent section for each package/module with clear naming
     - Under each package section, add child sections for that package's specific documentation
     - Include cross-package documentation (how packages interact, dependency graph)
   - **Return your patches**: After exploration, return the patches array in your structured output to update the `document_structure.yaml` file

## Patches Output Format

Your structured output must include a `patches` array to modify specific lines in the document structure file. Each patch has:

- `start_line` (integer): The starting line number (0-based, inclusive)
- `end_line` (integer): The ending line number (0-based, **exclusive**) - range is `[start_line, end_line)`
- `delete` (boolean): Whether to delete (`true`) or replace (`false`) the lines
- `replace` (string, optional): The new content when `delete` is `false`

**Line Numbering**: Lines are numbered starting from 0. For example, if you see "0: project:", that's line 0.

**Range Semantics**: The range `[start_line, end_line)` is half-open (exclusive end):
- To replace line 5: use `start_line=5, end_line=6` (replaces 1 line)
- To replace lines 5-7: use `start_line=5, end_line=8` (replaces 3 lines)
- To insert before line 5 without deleting: use `start_line=5, end_line=5` (inserts, deletes 0 lines)

**Examples:**

Replace lines 3-5 (3 lines total):
```json
{
  "patches": [{
    "start_line": 3,
    "end_line": 6,
    "delete": false,
    "replace": "project:\n  title: My Project\n  description: A great project"
  }]
}
```

Delete lines 10-15 (6 lines total):
```json
{
  "patches": [{
    "start_line": 10,
    "end_line": 16,
    "delete": true
  }]
}
```

Insert new content before line 5 without deleting:
```json
{
  "patches": [{
    "start_line": 5,
    "end_line": 5,
    "delete": false,
    "replace": "- title: New Section\n  description: Inserted content"
  }]
}
```

**CRITICAL: YAML Format Requirements**
The `replace` field in your patches MUST contain valid YAML:
- Use exactly 2 spaces for indentation (NEVER tabs)
- List items start with `- ` (dash + space)
- Colons must have a space after them: `key: value`
- Maintain consistent structure matching the schema
- Test your YAML mentally before including it in patches

**Invalid YAML will cause the entire structure to break!**

## Important Guidelines

1. **Focus on Project Domain, Not Build System**: For code projects, focus documentation on the project's core purpose and functionality, NOT on build/tooling infrastructure:
   - ✅ **Include**: Project features, APIs, architecture, usage guides, domain concepts
   - ❌ **Exclude**: Build system docs (webpack config, rollup setup, vite config), CI/CD pipelines, development tooling setup, linting/formatting configuration
   - **Example**: For a web framework project:
     - ✅ Good: "Component System", "Routing API", "State Management", "Server-Side Rendering"
     - ❌ Bad: "Build Configuration", "Webpack Setup", "ESLint Rules", "CI/CD Pipeline"
   - **Rationale**: Users care about WHAT the project does and HOW to use it, not the internal build machinery
   - **Exception**: Only include build/tooling docs if the project IS a build tool (e.g., webpack, vite, rollup themselves)

2. **Prioritize User-Facing Content**: Structure documentation around what the project emphasizes, not just what exists in the code:
   - If README has a "Key Features" section, ensure those features have dedicated documentation sections
   - If docs/ folder exists with specific guides, reference those prominently
   - If the project highlights certain use cases or workflows, create sections that support those
   - **Example**: If README says "Built for scalability and real-time processing", create sections like "Architecture for Scale" and "Real-time Processing Guide"

3. **sourcePaths Must Be Files**: This is CRITICAL - `sourcePaths` must contain only file paths, never directory paths:
   - ✅ Correct: `["README.md", "src/index.ts", "docs/guide.md"]`
   - ❌ Wrong: `["src/", "docs/", "src/components/"]`
   - Each path must point to a specific file that exists in the workspace
   - Use file exploration tools to identify relevant files for each document section

4. **Avoid Duplicates**: Before creating any document section, carefully review the existing structure shown above (with line numbers). Do not add sections that already exist - instead, update or refine them if needed.

5. **One Clear Purpose Per Section**: Each document section should have a distinct, non-overlapping purpose. If two sections seem similar, combine them or differentiate their scope clearly.

6. **CRITICAL: Validate YAML Format Before Returning**: Before returning your patches output, you MUST strictly validate the YAML format:
   - **Indentation**: Use exactly 2 spaces for each indentation level (NEVER use tabs)
   - **List items**: Each list item must start with `- ` (dash + space) at the correct indentation
   - **String values**: Multi-line strings or strings with special characters must be properly quoted
   - **Colons**: Must have a space after them (`key: value`, NOT `key:value`)
   - **Empty arrays**: Use `[]` or proper empty list format
   - **No trailing spaces**: Remove any trailing whitespace from lines
   - **Consistent structure**: Maintain the exact schema structure (project, documents, title, description, sourcePaths, children)

   **YAML Format Validation Checklist**:
   ```yaml
   # ✅ CORRECT format example:
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

   # ❌ COMMON MISTAKES TO AVOID:
   # 1. Missing space after colon:
   #    title:"Getting Started"  # WRONG
   #    title: "Getting Started"  # CORRECT

   # 2. Wrong indentation (must be 2 spaces):
   #    documents:
   #        - title: "Test"  # WRONG (4 spaces)
   #      - title: "Test"  # CORRECT (2 spaces)

   # 3. Missing dash for list items:
   #    documents:
   #      title: "Test"  # WRONG
   #    documents:
   #      - title: "Test"  # CORRECT

   # 4. Inconsistent children format:
   #    children: []  # CORRECT for empty
   #    children:     # CORRECT for nested
   #      - title: "Child"
   #    # Don't mix both styles randomly

   # 5. Quotes in YAML strings with special chars:
   #    title: API & SDK  # WRONG (& can cause issues)
   #    title: "API & SDK"  # CORRECT

   # 6. Indentation of nested lists:
   #    sourcePaths:
   #    - file.md  # WRONG (should be indented)
   #    sourcePaths:
   #      - file.md  # CORRECT
   ```

7. **Check Before Returning Patches**: Before returning your patches output, verify that:
   - **YAML format is valid**: Run through the validation checklist above
   - The resulting YAML after applying patches will be syntactically correct
   - Indentation is consistent throughout (2 spaces per level)
   - You're not creating duplicate titles or overlapping content
   - You're not accidentally replacing existing content you want to keep
   - Your line numbers are correct based on the current structure
   - All sourcePaths are file paths, not directories
   - Your patches array is properly formatted with all required fields
   - You're not including build/tooling documentation (unless the project IS a build tool)

8. **Multi-Package Project Structure**: For monorepos and multi-package projects (any language):
   - **Organize by package/module**: Each package should have its own top-level document section
   - **Include package files**: Use sourcePaths to reference specific files (e.g., `packages/core/package.json`, `packages/core/README.md`), not directories
   - **Nested documentation**: Place package-specific docs as children under the package section
   - **Common documentation first**: Start with cross-cutting docs (getting started, architecture)
   - **Clear naming**: Use appropriate titles for the language ecosystem (e.g., "Package: name", "Crate: name", "Module: name")
   - **Don't flatten**: Maintain the hierarchical structure to reflect package boundaries

Remember: You are designing documentation structure, not just mirroring the code structure. Think about what information users need and organize it accordingly.

---

## FINAL CRITICAL REMINDER: YAML Validation

**Before submitting your response:**

1. ✅ Review each patch's `replace` field
2. ✅ Verify 2-space indentation (count the spaces!)
3. ✅ Check all list items have `- ` (dash + space)
4. ✅ Confirm all colons have space after: `key: value`
5. ✅ Ensure quotes around special characters
6. ✅ Validate the resulting YAML will be syntactically correct

**A single YAML formatting error will break the entire document structure file!**

Take 30 seconds to mentally validate your YAML before returning the response.
</instructions>

{% if reviewComments %}
<review_comments>
{{reviewComments}}
</review_comments>
{% endif %}

{% if userFeedback %}
<user_feedback>
{{userFeedback }}
</user_feedback>
{% endif %}
