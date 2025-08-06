// Default file patterns for inclusion and exclusion
export const DEFAULT_INCLUDE_PATTERNS = [
  "*.py",
  "*.js",
  "*.jsx",
  "*.ts",
  "*.tsx",
  "*.go",
  "*.java",
  "*.pyi",
  "*.pyx",
  "*.c",
  "*.cc",
  "*.cpp",
  "*.h",
  "*.md",
  "*.rst",
  "*.json",
  "*Dockerfile",
  "*Makefile",
  "*.yaml",
  "*.yml",
];

export const DEFAULT_EXCLUDE_PATTERNS = [
  "aigne-docs/**",
  "doc-smith/**",
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
  { code: "zh-CN", label: "简体中文 (zh-CN)", sample: "你好" },
  { code: "zh-TW", label: "繁體中文 (zh-TW)", sample: "你好" },
  { code: "ja", label: "日本語 (ja)", sample: "こんにちは" },
  { code: "ko", label: "한국어 (ko)", sample: "안녕하세요" },
  { code: "es", label: "Español (es)", sample: "Hola" },
  { code: "fr", label: "Français (fr)", sample: "Bonjour" },
  { code: "de", label: "Deutsch (de)", sample: "Hallo" },
  { code: "pt-BR", label: "Português (pt-BR)", sample: "Olá" },
  { code: "ru", label: "Русский (ru)", sample: "Привет" },
  { code: "it", label: "Italiano (it)", sample: "Ciao" },
  { code: "ar", label: "العربية (ar)", sample: "مرحبا" },
];

// Predefined document generation styles
export const DOCUMENT_STYLES = {
  developerDocs: {
    name: "Developer Docs",
    rules: "Steps-first; copy-paste examples; minimal context; active 'you'.",
  },
  userGuide: {
    name: "User Guide",
    rules: "Scenario-based; step-by-step; plain language; outcomes & cautions.",
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
  actionFirst: "Developers, Implementation Engineers, DevOps",
  conceptFirst:
    "Architects, Technical Leads, Developers interested in principles",
  generalUsers: "General Users",
  custom: "Enter your own target audience",
};
