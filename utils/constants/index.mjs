// Default file patterns for inclusion and exclusion
export const DEFAULT_INCLUDE_PATTERNS = Object.freeze([
  // Python
  "*.py",
  "*.pyi",
  "*.pyx",
  // JavaScript/TypeScript
  "*.js",
  "*.jsx",
  "*.ts",
  "*.tsx",
  "*.mjs",
  "*.mts",
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
  // Media files
  "*.jpg",
  "*.jpeg",
  "*.png",
  "*.gif",
  "*.bmp",
  "*.webp",
  "*.svg",
  "*.mp4",
  "*.mov",
  "*.avi",
  "*.mkv",
  "*.webm",
  "*.m4v",
]);

export const DEFAULT_EXCLUDE_PATTERNS = Object.freeze([
  "**/doc-smith/**",
  "**/.aigne/**",
  "**/vendor/**",
  "**/temp/**",
  "**/*venv/**",
  "*.venv/**",
  "**/dist/**",
  "**/*build/**",
  "**/*experimental/**",
  "**/*deprecated/**",
  "**/misc/**",
  "**/legacy/**",
  ".git/**",
  ".github/**",
  ".next/**",
  ".vscode/**",
  "**/obj/**",
  "**/bin/**",
  "**/*node_modules/**",
  "*.log",
  "**/pnpm-lock.yaml",
  "**/yarn.lock",
  "**/package-lock.json",
  "**/pnpm-lock.json",
  "**/bun.lockb",
  "**/bun.lock",
  "**/bun.lockb",
]);

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

// Predefined document generation styles based on primary purpose
export const DOCUMENT_STYLES = {
  getStarted: {
    name: "Get started quickly",
    description: "Help new users go from zero to working in <30 minutes",
    content:
      "Optimizes for: Speed, essential steps, working examples.\nSkips: Complex edge cases, theoretical background.",
  },
  completeTasks: {
    name: "Complete specific tasks",
    description: "Guide users through common workflows and use cases",
    content:
      "Optimizes for: Step-by-step instructions, practical scenarios.\nSkips: Deep technical internals, getting started basics.",
  },
  findAnswers: {
    name: "Find answers fast",
    description: "Provide searchable reference for all features and APIs",
    content:
      "Optimizes for: Comprehensive coverage, searchability, examples.\n Skips: Narrative flow, beginner explanations.",
  },
  understandSystem: {
    name: "Understand the system",
    description: "Explain how it works, why design decisions were made",
    content:
      "Optimizes for: Architecture, concepts, decision rationale.\nSkips: Quick wins, copy-paste solutions.",
  },
  solveProblems: {
    name: "Troubleshoot common issues",
    description: "Help users troubleshoot and fix issues",
    content:
      "Optimizes for: Error scenarios, diagnostics, solutions.\nSkips: Happy path tutorials, feature overviews.",
  },
  mixedPurpose: {
    name: "Serve multiple purposes",
    description: "Comprehensive documentation covering multiple needs",
    content:
      "Optimizes for: Balanced coverage, multiple entry points.\nTrade-off: Longer, requires good navigation.",
  },
};

// Predefined target audiences based on who will read the documentation most often
export const TARGET_AUDIENCES = {
  endUsers: {
    name: "End users (non-technical)",
    description: "People who use the product but don't code",
    content:
      "Writing: Plain language, UI-focused, avoid technical terms.\nExamples: Screenshots, step-by-step clicks, business outcomes.",
  },
  developers: {
    name: "Developers integrating your product/API",
    description: "Engineers adding this to their projects",
    content:
      "Writing: Code-first, copy-paste ready, technical accuracy.\nExamples: SDK usage, API calls, configuration snippets.",
  },
  devops: {
    name: "DevOps / SRE / Infrastructure teams",
    description: "Teams deploying, monitoring, maintaining systems",
    content:
      "Writing: Operations-focused, troubleshooting emphasis.\nExamples: Deployment configs, monitoring setup, scaling guides.",
  },
  decisionMakers: {
    name: "Technical decision makers",
    description: "Architects, leads evaluating or planning implementation",
    content:
      "Writing: High-level first, drill-down details available.\nExamples: Architecture diagrams, comparison tables, trade-offs.",
  },
  supportTeams: {
    name: "Support teams",
    description: "People helping others use the product",
    content:
      "Writing: Diagnostic-focused, common issues prominent.\nExamples: Troubleshooting flows, FAQ format, escalation paths.",
  },
  mixedTechnical: {
    name: "Mixed technical audience",
    description: "Developers, DevOps, and technical users",
    content:
      "Writing: Layered complexity, multiple entry points.\nExamples: Progressive disclosure, role-based navigation.",
  },
};

// Reader knowledge level - what do readers typically know when they arrive?
export const READER_KNOWLEDGE_LEVELS = {
  completeBeginners: {
    name: "Is a total beginner, starting from scratch",
    description: "New to this domain/technology entirely",
    content:
      "Content: Define terms, explain concepts, assume nothing.\nStructure: Linear progression, prerequisite checks.\nTone: Patient, educational, confidence-building.",
  },
  domainFamiliar: {
    name: "Has used similar tools before",
    description: "Know the problem space, new to this specific solution",
    content:
      'Content: Focus on differences, migration, unique features.\nStructure: Comparison-heavy, "coming from X" sections.\nTone: Efficient, highlight advantages, skip basics.',
  },
  experiencedUsers: {
    name: "Is an expert trying to do something specific",
    description: "Regular users needing reference/advanced topics",
    content:
      "Content: Dense information, edge cases, performance tips.\nStructure: Reference-style, searchable, task-oriented.\nTone: Concise, technical precision, assume competence.",
  },
  emergencyTroubleshooting: {
    name: "Emergency/troubleshooting",
    description: "Something's broken, need to fix it quickly",
    content:
      "Content: Symptom → diagnosis → solution format.\nStructure: Problem-first, solution-prominent, escalation paths.\nTone: Clear, actionable, confidence-inspiring.",
  },
  exploringEvaluating: {
    name: "Is evaluating this tool against others",
    description: "Trying to understand if this fits their needs",
    content:
      "Content: Use cases, comparisons, getting started quickly.\nStructure: Multiple entry points, progressive commitment.\nTone: Persuasive but honest, show value quickly.",
  },
};

// Documentation depth - how comprehensive should the documentation be?
export const DOCUMENTATION_DEPTH = {
  essentialOnly: {
    name: "Essential only",
    description: "Cover the 80% use cases, keep it concise",
    content:
      "Scope: Core features, happy paths, common patterns.\nLength: Shorter sections, key examples only.\nMaintenance: Easier to keep current.",
  },
  balancedCoverage: {
    name: "Balanced coverage",
    description: "Good depth with practical examples [RECOMMENDED]",
    content:
      "Scope: Most features, some edge cases, multiple examples.\nLength: Moderate sections, varied example types.\nMaintenance: Reasonable update burden.",
  },
  comprehensive: {
    name: "Comprehensive",
    description: "Cover all features, edge cases, and advanced scenarios",
    content:
      "Scope: Everything, all parameters, extensive examples.\nLength: Detailed sections, comprehensive coverage.\nMaintenance: Higher update complexity.",
  },
  aiDecide: {
    name: "Let AI decide",
    description: "Analyze code complexity and suggest appropriate depth",
    content:
      "Scope: Adaptive based on codebase analysis.\nAI considers: API surface area, complexity, existing patterns.",
  },
};

// Purpose to Knowledge Level mapping for default suggestions
export const PURPOSE_TO_KNOWLEDGE_MAPPING = {
  getStarted: "completeBeginners", // Get started → Complete beginners
  findAnswers: "experiencedUsers", // Find answers → Experienced users
  solveProblems: "emergencyTroubleshooting", // Solve problems → Emergency/troubleshooting
  exploringEvaluating: "exploringEvaluating", // Exploring → Exploring/evaluating
};

// Documentation Depth recommendation logic
export const DEPTH_RECOMMENDATION_LOGIC = {
  // Purpose-based recommendations (highest priority)
  purposes: {
    getStarted: "essentialOnly", // Get started → Essential
  },
  // Audience-based recommendations (medium priority)
  audiences: {
    decisionMakers: "balancedCoverage", // Decision makers → Balanced
  },
  // Knowledge level-based recommendations (lowest priority)
  knowledgeLevels: {
    experiencedUsers: "comprehensive", // Experienced users → Comprehensive
  },
};

// Component mount point ID for Discuss Kit
export const DISCUSS_KIT_DID = "z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu";
export const MEDIA_KIT_DID = "z8ia1mAXo8ZE7ytGF36L5uBf9kD2kenhqFGp9";

export const PAYMENT_KIT_DID = "z2qaCNvKMv5GjouKdcDWexv6WqtHbpNPQDnAk";

// Default application URL for the document deployment website.
export const CLOUD_SERVICE_URL_PROD = "https://docsmith.aigne.io";
export const CLOUD_SERVICE_URL_STAGING = "https://staging.docsmith.aigne.io";

// Discuss Kit related URLs
export const DISCUSS_KIT_STORE_URL =
  "https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu";
export const BLOCKLET_ADD_COMPONENT_DOCS =
  "https://www.arcblock.io/docs/blocklet-developer/en/7zbw0GQXgcD6sCcjVfwqqT2s";

// Supported file extensions for content reading
export const SUPPORTED_FILE_EXTENSIONS = [".txt", ".md", ".json", ".yaml", ".yml"];

// Token count threshold for intelligent source path suggestion
export const INTELLIGENT_SUGGESTION_TOKEN_THRESHOLD = 600000;

// Conflict rules configuration for documentation generation
export const CONFLICT_RULES = {
  // Internal conflicts within the same question (multi-select conflicts)
  internalConflicts: {
    // Note: Most conflicts can be resolved through intelligent documentation structure
    // Only keeping conflicts that represent fundamental incompatibilities
  },

  // Cross-question conflicts (conflicts between different questions)
  crossConflicts: [
    {
      conditions: {
        documentPurpose: ["getStarted"],
        readerKnowledgeLevel: ["experiencedUsers"],
      },
      severity: "severe",
      reason:
        "Quick start tutorials are not suitable for experienced users who need advanced features and best practices",
      action: "filter",
      conflictingOptions: {
        readerKnowledgeLevel: ["experiencedUsers"],
      },
    },
    {
      conditions: {
        documentPurpose: ["findAnswers"],
        readerKnowledgeLevel: ["completeBeginners"],
      },
      severity: "severe",
      reason:
        "API reference documentation skips beginner explanations and is not suitable for complete beginners",
      action: "filter",
      conflictingOptions: {
        readerKnowledgeLevel: ["completeBeginners"],
      },
    },
    {
      conditions: {
        documentPurpose: ["understandSystem"],
        readerKnowledgeLevel: ["emergencyTroubleshooting"],
      },
      severity: "severe",
      reason:
        "System architecture explanations are not suitable for emergency troubleshooting scenarios",
      action: "filter",
      conflictingOptions: {
        readerKnowledgeLevel: ["emergencyTroubleshooting"],
      },
    },
    {
      conditions: {
        targetAudienceTypes: ["endUsers"],
        readerKnowledgeLevel: ["experiencedUsers"],
      },
      severity: "severe",
      reason: "Non-technical users are typically not experienced technical users",
      action: "filter",
      conflictingOptions: {
        readerKnowledgeLevel: ["experiencedUsers"],
      },
    },
    {
      conditions: {
        targetAudienceTypes: ["decisionMakers"],
        readerKnowledgeLevel: ["emergencyTroubleshooting"],
      },
      severity: "severe",
      reason: "Decision makers typically do not directly handle emergency technical failures",
      action: "filter",
      conflictingOptions: {
        readerKnowledgeLevel: ["emergencyTroubleshooting"],
      },
    },
  ],
};

// Conflict resolution rules - defines how to handle conflicts when users select conflicting options
export const CONFLICT_RESOLUTION_RULES = {
  // Document purpose conflicts that can be resolved through documentation structure
  documentPurpose: [
    {
      conflictItems: ["getStarted", "findAnswers"],
      strategy: "layered_structure",
      description: "Quick start and API reference conflict, resolved through layered structure",
    },
    {
      conflictItems: ["getStarted", "understandSystem"],
      strategy: "separate_sections",
      description:
        "Quick start and system understanding conflict, resolved through separate sections",
    },
    {
      conflictItems: ["completeTasks", "understandSystem"],
      strategy: "concepts_then_practice",
      description:
        "Task guidance and system understanding conflict, resolved through concepts-then-practice structure",
    },
    {
      conflictItems: ["findAnswers", "solveProblems"],
      strategy: "reference_with_troubleshooting",
      description:
        "API reference and problem solving conflict, resolved through reference with troubleshooting",
    },
  ],

  // Target audience conflicts that can be resolved through documentation structure
  targetAudienceTypes: [
    {
      conflictItems: ["endUsers", "developers"],
      strategy: "separate_user_paths",
      description: "End users and developers conflict, resolved through separate user paths",
    },
    {
      conflictItems: ["endUsers", "devops"],
      strategy: "role_based_sections",
      description: "End users and DevOps conflict, resolved through role-based sections",
    },
    {
      conflictItems: ["developers", "decisionMakers"],
      strategy: "progressive_disclosure",
      description:
        "Developers and decision makers conflict, resolved through progressive disclosure",
    },
  ],
};

// Resolution strategy descriptions
export const RESOLUTION_STRATEGIES = {
  layered_structure: (items) =>
    `Detected "${items.join('" and "')}" purpose conflict. Resolution strategy: Create layered documentation structure
- Quick start section: Uses "get started" style - optimizes for speed, key steps, working examples, skips complex edge cases
- API reference section: Uses "find answers" style - comprehensive coverage, searchability, rich examples, skips narrative flow
- Ensure sections complement rather than conflict with each other`,

  separate_sections: (items) =>
    `Detected "${items.join('" and "')}" purpose conflict. Resolution strategy: Create separate sections
- Quick start section: Uses "get started" style - focuses on practical operations, completable within 30 minutes
- System understanding section: Uses "understand system" style - dedicated to explaining architecture, concepts, design decision rationale
- Meet different depth needs through clear section separation`,

  concepts_then_practice: (items) =>
    `Detected "${items.join('" and "')}" purpose conflict. Resolution strategy: Use progressive "concepts-then-practice" structure
- Concepts section: Uses "understand system" style - first explains core concepts and architecture principles
- Practice section: Uses "complete tasks" style - then provides specific step guidance and practical scenarios
- Ensure smooth transition between theory and practice`,

  reference_with_troubleshooting: (items) =>
    `Detected "${items.join('" and "')}" purpose conflict. Resolution strategy: Integrate troubleshooting into API reference
- API reference section: Uses "find answers" style - comprehensive feature documentation and parameter descriptions
- Troubleshooting section: Uses "solve problems" style - add common issues and diagnostic methods for each feature
- Create dedicated problem diagnosis index for quick location`,

  separate_user_paths: (items) =>
    `Detected "${items.join('" and "')}" audience conflict. Resolution strategy: Create separate user paths
- User guide path: Uses "end users" style - simple language, UI operations, screenshot instructions, business outcome oriented
- Developer guide path: Uses "developers" style - code-first, technical precision, SDK examples, configuration snippets
- Provide clear path navigation for users to choose appropriate entry point`,

  role_based_sections: (items) =>
    `Detected "${items.join('" and "')}" audience conflict. Resolution strategy: Organize content by role
- Create dedicated sections for different roles, each section uses corresponding audience style
- Ensure content depth and expression precisely match the needs and background of corresponding audience
- Provide cross-references between sections to facilitate collaborative understanding between roles`,

  progressive_disclosure: (items) =>
    `Detected "${items.join('" and "')}" audience conflict. Resolution strategy: Use progressive information disclosure
- Overview level: Uses "decision makers" style - high-level architecture diagrams, decision points, business value
- Detail level: Uses "developers" style - technical implementation details, code examples, best practices
- Ensure smooth transition from strategic to tactical`,
};

export const D2_CONFIG = `vars: {
  d2-config: {
    layout-engine: elk
    theme-id: 105
    theme-overrides: {
      N1: "#161B1A"
      N2: "#02A996"
      N4: "#E6E8EC"
      N5: "#E3FDF6"
      B2: "#161B1A"
      B3: "#BEF4EB"
      B4: "transparent"
      B5: "#D1F6EC"
      B6: "#E4FFF0"
      AA4: "#D1F6EC"
      AB4: "#BEF4EB"
    }
  }
}`;

export const KROKI_CONCURRENCY = 5;
export const D2_CONCURRENCY = 10;
export const FILE_CONCURRENCY = 3;
export const DOC_SMITH_DIR = ".aigne/doc-smith";
export const TMP_DIR = ".tmp";
export const TMP_DOCS_DIR = "docs";
export const TMP_ASSETS_DIR = "assets";

export const DOC_ACTION = {
  translate: "translate",
  update: "update",
  clear: "clear",
};

// Default thinking effort level, available options: 'lite', 'standard', 'pro'
// This level can be defined by the user in the config file to influence reasoning effort mapping
export const DEFAULT_THINKING_EFFORT_LEVEL = "standard";

// Default reasoning effort level, available options: 'minimal', 'low', 'medium', 'high'
export const DEFAULT_REASONING_EFFORT_LEVEL = "low";

export const DEFAULT_REASONING_EFFORT_VALUE = 500;

export const REASONING_EFFORT_LEVELS = {
  minimal: {
    lite: 100,
    standard: 300,
    pro: 500,
  },
  low: {
    lite: 200,
    standard: 500,
    pro: 1000,
  },
  medium: {
    lite: 300,
    standard: 800,
    pro: 1500,
  },
  high: {
    lite: 500,
    standard: 1000,
    pro: 2000,
  },
};

// Diagram styles - visual styles for diagram generation
export const DIAGRAM_STYLES = {
  modern: {
    name: "Modern",
    description: "Modern, clean, professional style with contemporary design elements",
    prompt:
      "Modern, clean, professional diagram style with contemporary design elements, smooth lines, and a professional color scheme",
  },
  standard: {
    name: "Standard Flowchart",
    description: "Standard flowchart style with traditional symbols and formats",
    prompt:
      "Standard flowchart style with traditional symbols (rectangles for processes, diamonds for decisions, arrows for flows), clear and conventional formatting",
  },
  "hand-drawn": {
    name: "Hand-drawn",
    description: "Hand-drawn style with natural, organic lines and sketch-like appearance",
    prompt:
      "Hand-drawn, sketch-like style with natural, organic lines, slightly imperfect shapes, and a casual, approachable appearance",
  },
  anthropomorphic: {
    name: "Anthropomorphic",
    description: "Anthropomorphic style with personified elements and vivid imagery",
    prompt:
      "Anthropomorphic style with personified elements, vivid and lively imagery, characters or objects with human-like features, engaging and memorable",
  },
  flat: {
    name: "Flat Design",
    description: "Flat design style without shadows or 3D effects",
    prompt:
      "Flat design style with no shadows, gradients, or 3D effects, clean geometric shapes, bold colors, and minimalist aesthetics",
  },
  minimalist: {
    name: "Minimalist",
    description: "Minimalist style with minimal elements and maximum clarity",
    prompt:
      "Minimalist style with the fewest possible elements, maximum clarity, simple shapes, ample white space, and essential information only",
  },
  "3d": {
    name: "3D",
    description: "3D style with three-dimensional effects and perspective",
    prompt:
      "3D style with three-dimensional effects, perspective, depth, shadows, and realistic spatial relationships",
  },
};

// Diagram types - types of diagrams that can be generated
export const DIAGRAM_TYPES = {
  architecture: {
    name: "Architecture Diagram",
    description: "System architecture showing components, services, and their relationships",
    keywords: [
      "架构",
      "architecture",
      "组件",
      "component",
      "服务",
      "service",
      "系统",
      "system",
      "模块",
      "module",
    ],
  },
  flowchart: {
    name: "Flowchart",
    description: "Process flow showing steps, decisions, and workflow",
    keywords: [
      "流程",
      "flow",
      "步骤",
      "step",
      "工作流",
      "workflow",
      "过程",
      "process",
      "顺序",
      "sequence",
    ],
  },
  guide: {
    name: "Guide Diagram",
    description: "Guided diagram showing user journey or tutorial flow",
    keywords: ["引导", "guide", "教程", "tutorial", "指南", "guide", "入门", "getting started"],
  },
  intro: {
    name: "Introduction Diagram",
    description: "Introduction diagram providing overview or conceptual explanation",
    keywords: [
      "介绍",
      "introduction",
      "概述",
      "overview",
      "概念",
      "concept",
      "说明",
      "explanation",
    ],
  },
  sequence: {
    name: "Sequence Diagram",
    description: "Sequence diagram showing interactions over time",
    keywords: [
      "时序",
      "sequence",
      "交互",
      "interaction",
      "时间",
      "time",
      "消息",
      "message",
      "调用",
      "call",
    ],
  },
  network: {
    name: "Network Topology",
    description: "Network topology showing network structure and connections",
    keywords: [
      "网络",
      "network",
      "拓扑",
      "topology",
      "连接",
      "connection",
      "节点",
      "node",
      "路由",
      "route",
    ],
  },
};
