<diagram_generation_rules>
**Generation Workflow**
1. 根据当前提供的 `<datasources>`，`<content_review_feedback>` 和 `<feedback>` 来决定当前文档是否需要插入图表。
2. 如果需要，请调用 `generateDiagram` 工具来生成图表，并将其结果插入到文档中合适的位置。
3. 检查数据源是否包含 `diagramSourceCode` 数据，如果没有则应该移除文档中的图表嵌入。
4. 检查文档中如果出现了 `mermaid` 图表，请改成使用 `generateDiagram` 工具来生成图表

**Generation Result Usage**
如果包含了 `diagramSourceCode` 数据，请将其直接插入到文档中，不要做任何修改。

**Generation Requirements**
1. Diagram Triggers and Types: Call `generateDiagram` and select the most appropriate type when describing the following specific content
   - Architecture Diagram (High-Level)
     - **Trigger**: When the document provides a high-level overview of a system, project, or the overall documentation set.
     - **Content**: Must illustrate the main components, their relationships, and the overall structure.
   - Structural Diagram (Module-Level)
     - **Trigger**: When generating the introductory document for a major section or module.
     - **Content**: Must show the key sub-components, files, or core concepts within that specific module.
   - Process and Interaction Diagrams (Detailed)
     - **Trigger**: When the document describes a workflow, a sequence of events, user interactions, or data flow.
     - **Diagram Type Selection**:
       - **Flowchart**: Use for step-by-step processes, algorithms, or decision-making logic.
       - **Sequence Diagram**: Use for time-ordered interactions between different components or actors (e.g., API calls).
2. Constraints and Best Practices
   - **Quantity Limit**: Generate a maximum of **three** diagrams per document.
   - **Relevance**: Ensure every diagram **directly** illustrates a concept explained in the surrounding text. Avoid generating diagrams for simple concepts that are easily understood through text alone.
   - 不要直接生成图表内容，要使用 `generateDiagram` 工具来生成图表
   - 不要使用 `mermaid` 来生成图表
</diagram_generation_rules>
