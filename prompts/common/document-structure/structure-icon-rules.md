<structure_icon_rules>
## Icon Generation Rules for Document Structure

When generating document structure, you **must** add an `icon` attribute to **root-level nodes** (where `parentPath` is null or empty). The icon should be selected based on the meaning and purpose of the document structure to provide better visual identification.

### Icon Attribute Definition

- `icon`: The icon displayed for the document structure's root node, which is **required** for root-level elements only.
- This value must be a valid **Lucide icon name** in the format: `lucide:icon-name`
- **Only Lucide icons are supported** - do not use other icon collections

### Icon Selection Guidelines

Choose icons that **semantically match** the document's purpose and content based on both title and description:

**General Documentation:**
- `lucide:book` - General documentation, guides
- `lucide:file-text` - Text documents, articles
- `lucide:book-open` - Reading materials, tutorials
- `lucide:library` - Reference materials

**Getting Started & Quick Start:**
- `lucide:rocket` - Quick start, getting started guides
- `lucide:play-circle` - Getting started, tutorials
- `lucide:zap` - Quick start, fast setup
- `lucide:sparkles` - Quick start, new features

**API & Code References:**
- `lucide:code` - API documentation, code references
- `lucide:file-code-2` - Code files, programming guides
- `lucide:terminal` - Command-line interfaces, CLI tools
- `lucide:git-branch` - Version control, development
- `lucide:brackets` - Code syntax, programming

**Configuration & Settings:**
- `lucide:settings` - Configuration guides, settings
- `lucide:cog` - Configuration, setup
- `lucide:wrench` - Tools, configuration
- `lucide:sliders` - Settings, preferences

**Tutorials & Learning:**
- `lucide:graduation-cap` - Learning materials, tutorials
- `lucide:lightbulb` - Tips, tutorials, guides
- `lucide:school` - Educational content

**Project & Overview:**
- `lucide:folder-open` - Project overview, structure
- `lucide:layers` - Architecture, structure
- `lucide:package` - Packages, modules
- `lucide:box` - Components, modules

**User & Community:**
- `lucide:users` - User guides, community
- `lucide:user` - User documentation
- `lucide:help-circle` - Help, FAQ
- `lucide:message-circle` - Communication, chat

**Security & Admin:**
- `lucide:shield` - Security, protection
- `lucide:key` - Authentication, access
- `lucide:lock` - Security, privacy
- `lucide:shield-check` - Security verification

**Deployment & Operations:**
- `lucide:cloud` - Cloud services, deployment
- `lucide:server` - Server, infrastructure
- `lucide:database` - Database, data
- `lucide:network` - Networking, connections

### Selection Process

1. Read both title and description carefully
2. Identify the primary purpose and content type
3. Match to the most appropriate icon category above
4. Select the most semantically relevant Lucide icon from that category
5. Ensure the icon clearly represents the document's purpose

### Implementation Requirements

- **Only root-level nodes** (where `parentPath` is null or empty) require an `icon` attribute
- The icon should be added as a property in the structure item: `{ "title": "...", "description": "...", "path": "...", "icon": "lucide:book", ... }`
- Use **only Lucide icons** - format: `lucide:icon-name`
- If multiple root-level nodes exist, each should have an appropriate icon

</structure_icon_rules>

