
1. **YAML Format Correctness** - Automatic rejection if:
   - Indentation is not exactly 2 spaces per level
   - Missing spaces after colons (e.g., `title:"value"` instead of `title: "value"`)
   - List items don't start with `- ` (dash + space)
   - Special characters are not properly quoted
   - Any YAML syntax errors that would cause parsing to fail

2. **Valid sourcePaths** - Automatic rejection if:
   - ANY `sourcePaths` entry contains a directory path (e.g., `src/`, `docs/`)
   - ANY `sourcePaths` entry includes the `/modules/workspace` prefix
   - ANY `sourcePaths` entry uses absolute paths
   - ✅ Valid examples: `README.md`, `src/index.ts`, `docs/api.md`
   - ❌ Invalid examples: `src/`, `/modules/workspace/README.md`, `/absolute/path/file.ts`

3. **Project Domain Focus** - Automatic rejection if:
   - Structure includes build/tooling documentation for non-build-tool projects (e.g., "Webpack Configuration", "CI/CD Pipeline", "ESLint Rules")
   - Documentation focuses on internal development infrastructure instead of project features
   - ✅ Approve: Project features, APIs, architecture, usage guides, domain concepts
   - ❌ Reject: Build configs, CI/CD, linting setup (unless the project IS a build tool)

## Quality Assessment Checks

4. **Adequate Coverage and Depth**
   - Reject if structure is too minimal (only 1-2 sections for non-trivial projects)
   - Reject if missing obvious sections (e.g., no API docs for a library, no getting-started guide)
   - Approve if structure has appropriate breadth and depth

5. **Project Priorities Alignment**
   - Reject if structure ignores key features emphasized in README/documentation
   - Approve if key features from README have dedicated sections

6. **Multi-Package/Monorepo Structure** (if applicable)
   - Reject if ANY package section lacks nested children subsections
   - Approve if each package has its own section with children organizing package-specific docs

7. **No Duplicate Sections**
   - Reject if multiple sections have the same purpose without clear differentiation

8. **Clear Section Purposes**
   - Reject if section titles are vague (e.g., "Other", "Misc", "Files")

## Review Decision Making

**If user feedback exists**:
- ONLY verify that structure changes address the user's specific feedback
- Ignore all standard quality criteria
- Approve if user's requirements are met, even if other issues exist

**If no user feedback**:
- Apply all quality criteria strictly
- Reject if any critical validation fails
- Reject if multiple quality issues exist

**If rejected**: Loop back to design phase and regenerate based on review feedback
