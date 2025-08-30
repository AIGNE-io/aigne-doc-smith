---
labels: ["Reference"]
---

# Publish Your Docs

Once your documentation is generated, the next step is to make it accessible online. AIGNE DocSmith simplifies this process with the `aigne doc publish` command, which uploads your content to a Discuss Kit platform, making it instantly available to your audience.

This guide covers how to publish your documentation, whether you're using the free official platform or your own self-hosted instance.

## The Publishing Process

The `aigne doc publish` command initiates an interactive process that guides you through the necessary steps. The diagram below shows the typical workflow for publishing your documentation for the first time.

```d2
shape: sequence_diagram

User; CLI; "Discuss Kit Platform"

User -> CLI: runs `aigne doc publish`

alt "First time or not configured"
  CLI -> User: "Prompt: Select platform"
  User -> CLI: "Selects Official or Self-Hosted"
  CLI -> User: "Opens browser for authentication"
  User -> "Discuss Kit Platform": "Logs in and authorizes"
  "Discuss Kit Platform" -> CLI: "Provides access token"
  CLI -> CLI: "Saves token for future use"
end

CLI -> "Discuss Kit Platform": "Uploads documentation & media"
"Discuss Kit Platform" -> CLI: "Confirms success"
CLI -> User: "✅ Documentation Published Successfully!"
```

## Publishing Options

You have two primary options for hosting your documentation, catering to different needs for visibility and control.

<x-cards data-columns="2">
  <x-card data-title="Official Platform" data-icon="lucide:globe">
    Publish to docsmith.aigne.io, the official hosting platform. This option is free, ideal for open-source projects, and makes your documentation publicly accessible.
  </x-card>
  <x-card data-title="Self-Hosted Platform" data-icon="lucide:server">
    Publish to your own private instance of Discuss Kit. This gives you full control over who can access your documentation, making it suitable for internal or private projects.
  </x-card>
</x-cards>

## Step-by-Step Guide

Publishing your documentation for the first time is a simple, interactive process.

### 1. Run the Publish Command

Navigate to your project's root directory in your terminal and run the following command:

```bash
aigne doc publish
```

### 2. Choose Your Platform

If you haven't configured a publishing destination before, you will be prompted to choose between the official platform and a self-hosted one. Select the option that best suits your needs.

![Choose between the official platform or a self-hosted instance](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

If you select the self-hosted option, you will be asked to enter the URL for your Discuss Kit instance.

### 3. Authenticate Your Account

For the first connection to a new platform, DocSmith will automatically open a browser window for you to log in and authorize the CLI. This is a one-time step; your access token will be saved locally for all future publishes to that platform.

### 4. Confirmation

Once the upload is complete, you will see a success message in your terminal, and your documentation will be live.

```
✅ Documentation Published Successfully!
```

## Publishing in CI/CD Environments

For automated workflows, you can bypass the interactive prompts by using command-line arguments or environment variables.

| Method | Name | Description | Example |
|---|---|---|---|
| **Argument** | `--appUrl` | Specifies the URL of your self-hosted Discuss Kit instance directly. | `aigne doc publish --appUrl https://docs.mycompany.com` |
| **Env Var** | `DOC_DISCUSS_KIT_URL` | Sets the target platform URL, overriding any other configuration. | `export DOC_DISCUSS_KIT_URL=...` |
| **Env Var** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | Provides the access token directly, skipping the interactive login. | `export DOC_DISCUSS_KIT_ACCESS_TOKEN=...` |

## Troubleshooting

If you encounter issues during the publishing process, here are some common causes and their solutions:

-   **Invalid URL or Connection Error**: This often happens if the provided URL for a self-hosted instance is incorrect or the server is not reachable. Double-check the URL and your network connection.
-   **Missing Required Components**: The destination website must have the Discuss Kit component installed to host the documentation. If it's missing, the CLI will return an error with guidance on how to install it.

For a complete list of commands and options, please refer to the [CLI Command Reference](./cli-reference.md).