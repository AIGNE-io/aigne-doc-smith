import { CONFLICT_RESOLUTION_RULES, CONFLICT_RULES, RESOLUTION_STRATEGIES } from "./constants.mjs";

/**
 * Detect internal conflicts within the same question (multi-select conflicts)
 * @param {string} questionType - Question type (documentPurpose, targetAudienceTypes)
 * @param {Array} selectedValues - User selected values
 * @returns {Array} List of conflicts
 */
export function detectInternalConflicts(questionType, selectedValues) {
  const rules = CONFLICT_RULES.internalConflicts[questionType] || [];

  // Extract values from the selected items (handle both string arrays and object arrays)
  const selectedValueStrings = selectedValues.map((item) =>
    typeof item === "object" && item.value ? item.value : item,
  );

  const conflicts = [];

  rules.forEach((rule) => {
    // Check if all conflict items are selected
    const hasConflict = rule.conflictItems.every((item) => selectedValueStrings.includes(item));

    if (hasConflict) {
      conflicts.push({
        type: "internal",
        questionType,
        severity: rule.severity,
        reason: rule.reason,
        suggestion: rule.suggestion,
        items: rule.conflictItems,
      });
    }
  });

  return conflicts;
}

/**
 * Get filtered options based on cross-question conflict rules
 * @param {string} targetQuestion - Target question type to filter
 * @param {Object} currentSelections - Current user selections across all questions
 * @param {Object} allOptions - All available options for the target question
 * @returns {Object} Filtered options
 */
export function getFilteredOptions(targetQuestion, currentSelections, allOptions) {
  const crossRules = CONFLICT_RULES.crossConflicts;
  const filteredOptions = { ...allOptions };
  const appliedFilters = [];

  crossRules.forEach((rule) => {
    // Check if we should apply this rule for filtering the target question
    const shouldApplyRule = (() => {
      // Check if this rule applies to the target question
      const conflictingForTarget = rule.conflictingOptions[targetQuestion];
      if (!conflictingForTarget) {
        return false;
      }

      // Check if current selections match the conditions that would trigger filtering
      const nonTargetConditions = Object.entries(rule.conditions).filter(
        ([key]) => key !== targetQuestion,
      );

      if (nonTargetConditions.length === 0) {
        return false;
      }

      const matchesNonTargetConditions = nonTargetConditions.every(([key, values]) => {
        const selection = currentSelections[key];
        if (!selection) return false;

        // Extract values if selection contains objects
        const selectionArray = Array.isArray(selection) ? selection : [selection];
        const selectionValues = selectionArray.map((item) =>
          typeof item === "object" && item.value ? item.value : item,
        );

        return values.some((value) => selectionValues.includes(value));
      });

      return matchesNonTargetConditions;
    })();

    if (shouldApplyRule && rule.action === "filter") {
      // Filter out conflicting options for the target question
      const conflictingForTarget = rule.conflictingOptions[targetQuestion];

      if (conflictingForTarget) {
        conflictingForTarget.forEach((conflictOption) => {
          if (filteredOptions[conflictOption]) {
            delete filteredOptions[conflictOption];
            appliedFilters.push({
              removedOption: conflictOption,
              reason: rule.reason,
              severity: rule.severity,
            });
          }
        });
      }
    }
  });

  return {
    filteredOptions,
    appliedFilters,
  };
}

/**
 * Validate user selection for internal conflicts and return validation message
 * @param {string} questionType - Question type (documentPurpose, targetAudienceTypes)
 * @param {Array} selectedValues - User selected values
 * @returns {string|boolean} Error message if conflicts exist, true if valid
 */
export function validateSelection(questionType, selectedValues) {
  const conflicts = detectInternalConflicts(questionType, selectedValues);

  if (conflicts.length === 0) {
    return true;
  }

  // Return error message for severe conflicts
  const severeConflicts = conflicts.filter((c) => c.severity === "severe");
  if (severeConflicts.length > 0) {
    const conflict = severeConflicts[0];
    return `Conflict detected: ${conflict.reason}. ${conflict.suggestion}`;
  }

  // For moderate conflicts, allow but warn
  return true;
}

/**
 * Detect conflicts in user configuration selections that can be resolved through structure planning
 * @param {Object} config - User configuration
 * @returns {Array} Array of detected conflicts with resolution strategies
 */
export function detectResolvableConflicts(config) {
  const conflicts = [];

  // Check each question type for conflicts
  Object.entries(CONFLICT_RESOLUTION_RULES).forEach(([questionType, rules]) => {
    const selectedValues = config[questionType];

    if (!selectedValues || !Array.isArray(selectedValues) || selectedValues.length < 2) {
      return; // Skip if not multi-select or less than 2 items
    }

    // Extract values from the selected items (handle both string arrays and object arrays)
    const selectedValueStrings = selectedValues.map((item) =>
      typeof item === "object" && item.value ? item.value : item,
    );

    // Check each conflict rule
    rules.forEach((rule) => {
      // Check if all conflict items are selected
      const hasConflict = rule.conflictItems.every((item) => selectedValueStrings.includes(item));

      if (hasConflict) {
        conflicts.push({
          type: questionType,
          items: rule.conflictItems,
          strategy: rule.strategy,
          description: rule.description,
        });
      }
    });
  });

  return conflicts;
}

/**
 * Generate conflict resolution rules based on detected conflicts
 * @param {Array} conflicts - Array of detected conflicts
 * @returns {string} Conflict resolution instructions
 */
export function generateConflictResolutionRules(conflicts) {
  if (conflicts.length === 0) return "";

  const rules = ["=== Conflict Resolution Guidelines ==="];

  conflicts.forEach((conflict) => {
    const strategy = RESOLUTION_STRATEGIES[conflict.strategy];
    if (strategy) {
      rules.push(strategy(conflict.items));
    }
  });

  rules.push("");
  rules.push("Conflict Resolution Principles:");
  rules.push(
    "1. Meet diverse needs through intelligent structural design, not simple concatenation",
  );
  rules.push("2. Create clear navigation paths for different purposes and audiences");
  rules.push(
    "3. Ensure content hierarchy is reasonable, avoid information duplication or contradiction",
  );
  rules.push("4. Prioritize user experience, enable users to quickly find needed information");

  return rules.join("\n");
}
