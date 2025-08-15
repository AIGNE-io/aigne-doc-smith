// Default file patterns for inclusion and exclusion
export const DEFAULT_INCLUDE_PATTERNS = [
  // Python
  "*.py",
  "*.pyi",
  "*.pyx",
  // JavaScript/TypeScript
  "*.js",
  "*.jsx",
  "*.ts",
  "*.tsx",
  // C/C++
  "*.c",
  "*.cc",
  "*.cpp",
  "*.cxx",
  "*.c++",
  "*.h",
  "*.hpp",
  "*.hxx",
  "*.h++",
  // JVM Languages
  "*.java",
  "*.kt",
  "*.scala",
  "*.groovy",
  "*.gvy",
  "*.gy",
  "*.gsh",
  "*.clj",
  "*.cljs",
  "*.cljx",
  // .NET Languages
  "*.cs",
  "*.vb",
  "*.fs",
  // Functional Languages
  "*.f",
  "*.ml",
  "*.sml",
  "*.lisp",
  "*.lsp",
  "*.cl",
  // Systems Programming
  "*.rs",
  "*.go",
  "*.nim",
  "*.asm",
  "*.s",
  // Web Technologies
  "*.html",
  "*.htm",
  "*.css",
  "*.php",
  // Scripting Languages
  "*.rb",
  "*.pl",
  "*.ps1",
  "*.lua",
  "*.tcl",
  // Mobile/Modern Languages
  "*.swift",
  "*.dart",
  "*.ex",
  "*.exs",
  "*.erl",
  "*.jl",
  // Data Science
  "*.r",
  "*.R",
  "*.m",
  // Other Languages
  "*.pas",
  "*.cob",
  "*.cbl",
  "*.pro",
  "*.prolog",
  "*.sql",
  // Documentation & Config
  "*.md",
  "*.rst",
  "*.json",
  "*.yaml",
  "*.yml",
  "*Dockerfile",
  "*Makefile",
];

export const DEFAULT_EXCLUDE_PATTERNS = [
  "aigne-docs/**",
  "doc-smith/**",
  ".aigne/**",
  "assets/**",
  "data/**",
  "images/**",
  "public/**",
  "static/**",
  "**/vendor/**",
  "temp/**",
  "**/*docs/**",
  "**/*doc/**",
  "**/*venv/**",
  "*.venv/**",
  "*test*",
  "**/*test/**",
  "**/*tests/**",
  "**/*examples/**",
  "**/playgrounds/**",
  "v1/**",
  "**/dist/**",
  "**/*build/**",
  "**/*experimental/**",
  "**/*deprecated/**",
  "**/*misc/**",
  "**/*legacy/**",
  ".git/**",
  ".github/**",
  ".next/**",
  ".vscode/**",
  "**/*obj/**",
  "**/*bin/**",
  "**/*node_modules/**",
  "*.log",
  "**/*test.*",
];

// Supported languages for documentation
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English (en)", sample: "Hello" },
  { code: "zh", label: "简体中文 (zh)", sample: "你好" },
  { code: "zh-TW", label: "繁體中文 (zh-TW)", sample: "你好" },
  { code: "ja", label: "日本語 (ja)", sample: "こんにちは" },
  { code: "ko", label: "한국어 (ko)", sample: "안녕하세요" },
  { code: "es", label: "Español (es)", sample: "Hola" },
  { code: "fr", label: "Français (fr)", sample: "Bonjour" },
  { code: "de", label: "Deutsch (de)", sample: "Hallo" },
  { code: "pt", label: "Português (pt)", sample: "Olá" },
  { code: "ru", label: "Русский (ru)", sample: "Привет" },
  { code: "it", label: "Italiano (it)", sample: "Ciao" },
  { code: "ar", label: "العربية (ar)", sample: "مرحبا" },
];

// Predefined document generation styles
export const DOCUMENT_STYLES = {
  userGuide: {
    name: "User Guide",
    rules: "Scenario-based; step-by-step; plain language; outcomes & cautions.",
  },
  developerDocs: {
    name: "Developer Docs",
    rules: "Steps-first; copy-paste examples; minimal context; active 'you'.",
  },
  apiReference: {
    name: "API Reference",
    rules: "Exact & skimmable; schema-first; clear params/errors/examples.",
  },
  custom: {
    name: "Custom Rules",
    rules: "Enter your own documentation generation rules",
  },
};

// Predefined target audiences
export const TARGET_AUDIENCES = {
  generalUsers: "General Users",
  actionFirst: "Developers, Implementation Engineers, DevOps",
  conceptFirst: "Architects, Technical Leads, Developers interested in principles",
  custom: "Enter your own target audience",
};

// Component mount point ID for Discuss Kit
export const DISCUSS_KIT_DID = "z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu";

// Discuss Kit related URLs
export const DISCUSS_KIT_STORE_URL =
  "https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu";
export const BLOCKLET_LAUNCHER_DOCS_NEW =
  "https://www.arcblock.io/docs/launcher/en/launch-on-demand-application";
export const BLOCKLET_LAUNCHER_DOCS_EXIST =
  "https://www.arcblock.io/docs/launcher/en/launch-app-on-exist-server";
