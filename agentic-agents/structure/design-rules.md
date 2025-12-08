# Documentation Structure Design Rules

## Important Design Rules

1. **sourcePaths Must Be Files**: This is CRITICAL - `sourcePaths` must contain only file paths, never directory paths
   - ✅ Correct: `["README.md", "src/index.ts", "docs/guide.md"]`
   - ❌ Wrong: `["src/", "docs/", "src/components/"]`
   - Must be relative paths from workspace root, **without** the `/modules/workspace` prefix
   - Examples: `src/index.ts`, `README.md`, `package.json`, `docs/api.md`

2. **Prioritize Based on Project Focus**: Use insights from README and docs to guide structure
   - If README highlights specific features, create dedicated sections for them
   - If the project emphasizes certain workflows, mirror this in structure
   - Create documentation that helps users understand what the project owners consider most important

3. **Create a Logical, User-Focused Hierarchy**:
   - Start with what users need first (overview, quick start, core concepts)
   - Follow with detailed sections for key features
   - Include advanced topics and reference material later
   - Each document section should have a distinct, non-overlapping purpose

4. **Focus on Project Domain, Not Build System**: For code projects, focus documentation on the project's core purpose and functionality, NOT on build/tooling infrastructure
   - ✅ **Include**: Project features, APIs, architecture, usage guides, domain concepts
   - ❌ **Exclude**: Build system docs (webpack config, rollup setup, vite config), CI/CD pipelines, development tooling setup, linting/formatting configuration
   - **Exception**: Only include build/tooling docs if the project IS a build tool

5. **For Multi-Package Projects**: Create hierarchical documentation structure
   - Start with overview documentation (getting started, architecture overview)
   - Create a parent section for each package/module with clear naming
   - Under each package section, add child sections for that package's specific documentation
   - Include cross-package documentation (how packages interact, dependency graph)

6. **sourcePaths Should Be Comprehensive**:
   - Include as many related files as possible to ensure quality of subsequent detail generation
   - If analyzing source code, include related and adjacent source code files
   - Analyze referenced files within the source code and include them too
   - **Ensure sourcePaths are never empty** - Do not create document sections without related data sources

7. **Character Length Constraints**:
   - `project.title`: Must not exceed **40 characters** (all languages count equally)
   - `project.description`: Must not exceed **160 characters** (all languages count equally)
   - Ensure generated content is complete and grammatically correct within these constraints
