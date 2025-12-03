<x-card-usage-rules>
## XCard Usage Rules

XCard is individual link display card, suitable for displaying individual links with a richer and more visually appealing presentation format.

### Attributes

- `data-title` (required): Card title.
- `data-icon` (optional): Icon identifier (e.g., lucide:icon-name or material-symbols:rocket-outline).
  - Icons should prioritize Lucide (lucide:icon-name). If not available in Lucide, use Iconify (collection:icon-name, e.g., material-symbols:rocket-outline).
- `data-image` (optional): Image URL, can coexist with icon.
  - Prefer to use image url from `<media_file_list>`.
  - **Requirement**: At least one of `data-icon` or `data-image` must be provided.
  - It's recommended to always provide data-icon.
- `data-href` (optional): Navigation link for clicking the card or button.
- `data-horizontal` (optional): Whether to use horizontal layout.
- `data-cta` (optional): Button text (call to action).

### Children

- Must be written within `<x-card>...</x-card>` children.
- Plain Text Only: Do not use any Markdown syntax (see `<markdown_syntax_rules>` for the full list).

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
</x-card-usage-rules>
