---
labels: ["Reference"]
---

# Publish Your Docs

Once your documentation is generated and refined, the final step is to share it with your audience. AIGNE DocSmith simplifies this process with a single command, allowing you to publish your content to either the official public platform or your own self-hosted website.

## The Publishing Command

Publishing is handled through an interactive wizard initiated by the `aigne doc publish` command. This guided process makes it easy to get your documentation online without complex configuration.

```bash CLI Command icon=lucide:terminal
# Start the interactive publishing wizard
aigne doc publish
```

When you run this command for the first time, you'll be prompted to choose where you want to publish your documentation.

![Choosing between the official platform or a self-hosted one](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

### Publishing Destinations

You have two primary options for hosting your documentation:

<x-cards>
  <x-card data-title="Official DocSmith Platform" data-icon="lucide:cloud">
    Publish to docsmith.aigne.io. This option is free, requires no server setup, and is ideal for open-source projects. Note that your documentation will be publicly accessible.
  </x-card>
  <x-card data-title="Self-Hosted Platform" data-icon="lucide:server">
    Publish to your own website powered by Discuss Kit. This gives you full control over privacy and branding. You will need to deploy and manage your own Discuss Kit instance.
  </x-card>
</x-cards>

### Authentication

The first time you publish to a specific platform, DocSmith will automatically open a browser window to authenticate and authorize the CLI. This is a one-time process. A secure access token is then saved locally in your home directory (`~/.aigne/doc-smith-connected.yaml`), so you won't need to log in again for subsequent publishes to the same platform.

### Publishing Workflow

The diagram below illustrates the entire process, from running the command to seeing your documentation live.

```d2 Publishing Workflow
direction: down

shape: sequence_diagram

User: { 
  shape: c4-person 
}

CLI: { 
  label: "AIGNE CLI"
}

Platform: { 
  label: "Discuss Kit Platform\n(Official or Self-Hosted)" 
}

User -> CLI: "aigne doc publish"
CLI -> User: "1. Prompt to select platform"
User -> CLI: "2. Choose platform"

opt "If not authenticated" {
  CLI -> Platform: "3a. Request auth URL"
  Platform -> CLI: "3b. Return auth URL"
  CLI -> User: "4. Open auth URL in browser"
  User -> Platform: "5. Authenticate & Authorize"
  Platform -> CLI: "6. Send access token"
  CLI -> CLI: "7. Save token locally"
}

CLI -> Platform: "8. Upload documentation files"
Platform -> CLI: "9. Confirm success"
CLI -> User: "10. Display success message"
```

## Command Line Options

While the interactive mode is recommended for most users, you can also specify the publishing destination directly via command-line arguments for automation or scripting purposes.

| Option | Description |
|---|---|
| `--appUrl <url>` | Specifies the URL of your self-hosted Discuss Kit instance. This bypasses the interactive platform selection. |
| `--boardId <id>` | The unique ID of the documentation board on the Discuss Kit platform. If not provided, a new one will be created automatically. |

**Example for Self-Hosted Publishing:**

```bash Publish to a custom URL icon=lucide:terminal
# Publish directly to a specific self-hosted Discuss Kit instance
aigne doc publish --appUrl https://docs.my-company.com
```

---

With your documentation published, you have successfully completed the entire lifecycle from code to live, multi-language docs. For a complete list of all commands and their options, you can explore the [CLI Command Reference](./cli-reference.md).