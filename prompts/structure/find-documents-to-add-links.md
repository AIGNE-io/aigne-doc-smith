# Task: Find Documents to Add Links

Determine which existing documents should link to newly added documents.

## Input

<documentStructure>
{{originalDocumentStructure}}
</documentStructure>

<newDocuments>
{{newDocuments}}
</newDocuments>

<userFeedback>
{{allFeedback}}
</userFeedback>

## Steps

1. **Check <userFeedback> first.**  
   - If users explicitly specify linking (e.g., “link FAQ from About”), follow exactly.
2. **Analyze <documentStructure>.**  
   Identify existing documents that should link to those in <newDocuments> using the rules below.
3. For each qualifying document, add a non-empty `newLinks` array containing new document paths.
4. Output only these updated documents (subset of <documentStructure>) as `documentsWithNewLinks`.

Each item in `documentsWithNewLinks` must:
- Be an existing document from <documentStructure>
- Retain all original properties (`path`, `title`, `description`, `parentId`, `icon`, `sourceIds`)
- Include `newLinks: string[]`

## Linking Rules (in priority order)

1. **User Instructions** — Follow explicit <userFeedback>.  
2. **Parent–Child** — If a new document’s `parentId` equals a document’s `path`, the parent links to it.  
3. **Semantic Similarity** — Link thematically related documents (e.g., “About” ↔ “Team”).  
4. **Navigation Context** — Documents in the same navigation group may link.  
5. **Hierarchy** — Sibling or section documents may cross-link.  
6. **Relevance** — Add links only when it improves navigation logically.

## Output Format

```json
{
  "documentsWithNewLinks": [
    {
      "path": "/existing-document",
      "newLinks": ["/new-document-1", "/new-document-2"]
    }
  ]
}
