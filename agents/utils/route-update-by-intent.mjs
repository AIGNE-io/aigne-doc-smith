/**
 * Pass through intentType to downstream agents
 * The actual handling of diagram operations and document content modification
 * will be done in generate-document-content and check-generate-diagram
 */
export default async function routeUpdateByIntent(input, options) {
  // Simply pass through the input with intentType
  // The document generation agent will check intentType and decide whether to modify content
  return input;
}

routeUpdateByIntent.task_render_mode = "hide";

