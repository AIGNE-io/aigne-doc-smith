<x-card-useage-rules>
## XCard Usage Rules

XCard is an individual link display card, suitable for displaying individual links with a richer and more visually appealing presentation format.

### Attributes

- `data-title` (required): Card title.
- `data-icon` (optional): Icon identifier (e.g., lucide:icon-name or material-symbols:rocket-outline).
  - Icons should prioritize Lucide (lucide:icon-name). If not available in Lucide, use Iconify (collection:icon-name, e.g., material-symbols:rocket-outline).
- `data-image` (optional): Image URL, can coexist with icon.
  - **Requirement**: At least one of `data-icon` or `data-image` must be provided.
  - It's recommended to always provide data-icon.
- `data-href` (optional): Navigation link for clicking the card or button.
- `data-horizontal` (optional): Whether to use horizontal layout.
- `data-cta` (optional): Button text (call to action).

### Children

- Must be written within `<x-card>...</x-card>` children.
- **Plain Text Only**: All markdown formatting is prohibited, including inline formats like `code`, **bold**, _italic_, [links](), and block-level formats like headers (# ##), lists (- \*), code blocks (```), tables (|), and any other markdown syntax. Only plain text content is allowed.

### Good Examples

- Example 1: Basic card with icon and description
  ```md
    <x-card data-title="alarm()" data-icon="lucide:alarm-clock"> SIGALRM: Sent when a real-time timer has expired. </x-card>
  ```

- Example 2: Horizontal card layout
  ```md
  <x-card data-title="Horizontal card" data-icon="lucide:atom" data-horizontal="true">
  This is an example of a horizontal card.
  </x-card>
  ```

### Bad Examples

- Example 1: Inline Markdown formatting in card content
  ```md
  <x-card data-title="alarm()" data-icon="lucide:alarm-clock"> `SIGALRM`: Sent when a real-time timer has expired. </x-card>
  ```

- Example 2: Code block inside card content
  ````md
  <x-card data-title="ctrl_break()" data-icon="lucide:keyboard">
  Creates a listener for "ctrl-break" events.

  ```rust
  use tokio::signal::windows::ctrl_break;

  #[tokio::main]
  async fn main() -> std::io::Result<()> {
  let mut stream = ctrl_break()?;
  stream.recv().await;
  println!("got ctrl-break");
  Ok(())
  }
  ```

  ````
</x-card-useage-rules>
