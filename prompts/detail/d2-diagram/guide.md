<diagram_generation_guide>
1. Diagram Triggers and Types: Use the following guidelines to determine when to generate a diagram and which type to use.
  - Rule for Skipping Diagrams:
    - Trigger: Do not generate diagrams for purely textual, reference, or short note documents that describe abstract concepts, simple definitions, or FAQs.
    - Action: Skip diagram generation entirely.
  - Architecture Diagram (High-Level)
    - Trigger: When generating a document that serves as a high-level overview of a system, project, or the entire documentation set.
    - Action: Create a system architecture diagram.
    - Content: The diagram should illustrate the main components, their relationships, and the overall structure.
  - Structural Diagram (Module-Level)
    - Trigger: When generating the introductory document for a major section or module.
    - Action: Create a structural diagram (e.g., a block diagram or mind map).
    - Content: The diagram should show the key sub-components, files, or concepts within that specific module.
  - Process and Interaction Diagrams (Detailed)
    - Trigger: When the document describes a workflow, a sequence of events, user interactions, or data flow.
    - Action: Create the most appropriate diagram type:
      - Flowchart: Use for step-by-step processes, algorithms, or decision-making logic.
      - Sequence Diagram: Use for time-ordered interactions between different components or actors (e.g., API calls).
2. Constraints and Best Practices
  - Quantity: Generate a maximum of three (3) diagrams per document to ensure the content remains focused and readable.
  - Relevance: Ensure every diagram directly illustrates a concept explained in the surrounding text. Avoid generating diagrams for concepts that are easily understood via text alone.
  - Priority: For complex modules, workflows, or interactions, generate diagrams for each critical part.
</diagram_generation_guide>
