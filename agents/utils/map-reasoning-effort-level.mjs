import {
  DEFAULT_REASONING_EFFORT_LEVEL,
  DEFAULT_REASONING_EFFORT_VALUE,
  REASONING_EFFORT_LEVELS,
} from "../../utils/constants/index.mjs";

export default function mapReasoningEffortLevel({ level }, options) {
  const g =
    REASONING_EFFORT_LEVELS[level] || REASONING_EFFORT_LEVELS[DEFAULT_REASONING_EFFORT_LEVEL];

  return {
    reasoningEffort:
      g[options.context.userContext.thinkingEffort] ?? DEFAULT_REASONING_EFFORT_VALUE,
  };
}
