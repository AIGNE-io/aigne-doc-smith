import pMap from "p-map";
import pRetry from "p-retry";
import {
  CODE_LANGUAGE_MAP_LINTER,
  CODE_LANGUAGE_MAP_SUFFIX,
} from "../../utils/constants/linter.mjs";
import { debug } from "../../utils/debug.mjs";
import { lintCode } from "../../utils/linter/index.mjs";
import { getMarkdownAst, traverseMarkdownAst } from "../../utils/markdown/index.mjs";

const severityMapLevel = {
  error: "critical",
  warning: "minor",
};

export default async function evaluationDocumentCode({ content }) {
  const ast = getMarkdownAst({ markdown: content });
  const checkPromiseList = [];
  const checkListResult = [];
  let totalCount = 0;
  let ignoreCount = 0;
  let errorCount = 0;

  traverseMarkdownAst({
    ast,
    test: "code",
    visitor(node) {
      const linter = CODE_LANGUAGE_MAP_LINTER[node.lang];
      if (linter) {
        const suffix = CODE_LANGUAGE_MAP_SUFFIX[node.lang];
        checkPromiseList.push({ linter, code: node.value, suffix });
        totalCount += 1;
      } else {
        ignoreCount += 1;
      }
    },
  });
  const checkList = await pMap(
    checkPromiseList,
    async (item) => {
      const result = await pRetry(() => lintCode(item), {
        onFailedAttempt: ({ error, attemptNumber, retriesLeft }) => {
          debug(
            `Attempt ${attemptNumber} failed: ${error.message}. There are ${retriesLeft} retries left.`,
          );
        },
        retries: 3,
      });
      // lint occurs error, ignore
      if (!result.success) {
        debug("Lint failed", item, result);
        return [];
      }

      if (!result.issues || result.issues.length === 0) {
        debug("Lint result empty issues", item, result);
        return [];
      }

      errorCount += 1;
      return result.issues.map((x) => {
        return {
          ...x,
          level: severityMapLevel[x.severity],
        };
      });
    },
    { concurrency: 5 },
  );
  checkListResult.push(...checkList.flat());

  return {
    codeEvaluation: {
      baseline: 100,
      details: checkListResult,
      totalCount,
      ignoreCount,
      errorCount,
    },
  };
}

evaluationDocumentCode.description = "Traverse markdown code blocks and evaluate them.";

evaluationDocumentCode.input_schema = {
  type: "object",
  properties: {
    content: {
      type: "string",
      description: "Source markdown content to be evaluated.",
    },
  },
};
