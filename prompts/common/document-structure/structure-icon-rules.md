<structure_icon_rules>
## Icon Generation Rules for Document Structure

When generating document structure, you **must** add an `icon` attribute to **root-level nodes** (where `parentPath` is null or empty). The icon should be selected based on the meaning and purpose of the document structure to provide better visual identification.

### Core Requirements

- **Icon Format**: Must be a valid **Lucide icon name** in the format: `lucide:icon-name`
- **Only Lucide icons are supported** - do not use other icon collections
- **Only root-level nodes** (where `parentPath` is null or empty) require an `icon` attribute
- The icon should be added as a property in the structure item: `{ "title": "...", "description": "...", "path": "...", "icon": "lucide:book", ... }`

### Icon Selection Guidelines

Choose icons that **semantically match** the document's purpose and content based on both title and description. The same icon selection rules apply as in the dedicated icon generation agent - refer to the detailed icon categories and selection process in `document-icon-generate.md` for comprehensive guidance.

**Quick Reference - Common Icons:**
- `lucide:book` - General documentation, guides
- `lucide:rocket` - Quick start, getting started guides
- `lucide:code` - API documentation, code references
- `lucide:settings` - Configuration guides, settings
- `lucide:graduation-cap` - Learning materials, tutorials
- `lucide:folder-open` - Project overview, structure
- `lucide:users` - User guides, community
- `lucide:shield` - Security, protection
- `lucide:cloud` - Cloud services, deployment

**Selection Process:**
1. Read both title and description carefully
2. Identify the primary purpose and content type
3. Select the most semantically relevant Lucide icon
4. Ensure the icon clearly represents the document's purpose

</structure_icon_rules>

