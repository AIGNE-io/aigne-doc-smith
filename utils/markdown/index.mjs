import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { VFile } from "vfile";

export function traverseMarkdownAst({ ast, test, visitor }) {
  visit(ast, test, visitor);
}

export function getMarkdownAst({ markdown }) {
  const file = new VFile({ value: markdown });
  const processor = unified().use(remarkParse).use(remarkGfm);
  const ast = processor.parse(file);
  return ast;
}
