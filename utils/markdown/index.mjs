import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";

export function traverseMarkdownAst({ ast, test, visitor }) {
  if (!ast || !test || !visitor) {
    throw new Error('Required parameters missing: ast, test, and visitor must be provided');
  }
  visit(ast, test, visitor);
}

export function getMarkdownAst({ markdown }) {
  if (!markdown || typeof markdown !== 'string') {
    throw new Error('Invalid markdown input: must be a non-empty string');
  }
  const file = new VFile({ value: markdown });
  const processor = unified().use(remarkParse).use(remarkGfm);
  try {
    const ast = processor.parse(file);
    return ast;
  } catch (error) {
    throw new Error(`Failed to parse markdown: ${error.message}`);
  }
}
