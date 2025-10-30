<media_handling_rules>
Media resource usage rules:

- Read `<media_list>` resource data and cache every asset's `path` and description for reference.
- Only reference media that appears in the list. Every media path in the output must be an exact, byte-for-byte match to a `path` value from `<media_list>`.
- Never add prefixes, suffixes, domains, query strings, anchor fragments, or additional directories to a provided `path`. Treat the `path` as a literal string and reuse it without modification.
- Display images in Markdown with the canonical pattern `![Descriptive alt text](<path-from-media_list>)`. The alt text may paraphrase the description, but the `path` must remain unchanged.
- If the appropriate media is not present in `<media_list>`, omit the media reference and explicitly note that no approved asset is available instead of guessing or fabricating a path.
- Do not invent, paraphrase, fabricate, normalize, or rewrite media paths under any circumstance.
</media_handling_rules>
