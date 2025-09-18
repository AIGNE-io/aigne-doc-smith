# Publish Your Docs

After generating your documentation, the `aigne doc publish` command uploads your content to a Discuss Kit platform, making it accessible online. This guide explains how to publish your documentation to either the official platform or your own self-hosted website.

## The Publishing Process

The `aigne doc publish` command initiates an interactive process. The first time you publish to a new destination, it will guide you through authentication. Subsequent publishes will use saved credentials.

```d2 The Publishing Flow icon=lucide:upload-cloud
direction: down
shape: sequence_diagram

User: { shape: c4-person }
CLI: { label: "AIGNE CLI" }
Browser: { label: "Browser" }
Platform: { label: "Discuss Kit Platform" }

User -> CLI: "aigne doc publish"

alt: "First-time publish or missing config" {
  CLI -> User: "Select Platform\n(Official / Self-Hosted)"
  User -> CLI: "Provides selection"
  CLI -> Browser: "Opens authentication URL"
  User -> Browser: "Logs in & authorizes"
  Browser -> Platform: "Sends credentials"
  Platform -> CLI: "Returns Access Token"
  CLI -> CLI: "Saves Token for future use"
}

CLI -> Platform: "Uploads docs & media files"
Platform -> CLI: "Success response"
CLI -> User: "✅ Published Successfully!"

```

## Publishing Options

You have two main options for hosting your documentation:

<x-cards data-columns="2">
  <x-card data-title="Official Platform" data-icon="lucide:globe">
    Publish to [docsmith.aigne.io](https://docsmith.aigne.io/app/), a free, public hosting platform provided by AIGNE. This is a good option for open-source projects or to quickly share your docs.
  </x-card>
  <x-card data-title="Your Own Website" data-icon="lucide:server">
    Publish to your own Discuss Kit instance for full control over access and branding. This is suitable for internal or private documentation. You can get a Discuss Kit instance from the [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu).
  </x-card>
</x-cards>

## Step-by-Step Guide

Follow these steps to publish your documentation for the first time.

### 1. Run the Publish Command

In your project's root directory, run the following command:

```bash Terminal icon=lucide:terminal
aigne doc publish
```

### 2. Choose Your Platform

If this is your first time publishing, you will be prompted to select a destination. Choose the option that fits your needs.

![Choose between the official platform or a self-hosted instance](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

If you select your own website, you will be asked to enter its URL.

### 3. Authenticate Your Account

For the first connection to a new platform, a browser window will open for you to log in and authorize the CLI. This is a one-time step per platform; your access token is saved locally in `~/.aigne/doc-smith-connected.yaml` for future use.

### 4. Confirmation

Once the upload is complete, a success message will appear in your terminal.

```
✅ Documentation Published Successfully!
```

## Publishing in CI/CD Environments

For automated workflows, you can provide arguments and environment variables to bypass the interactive prompts.

| Method | Name | Description |
|---|---|---|
| **Argument** | `--appUrl` | Specifies the URL of your Discuss Kit instance directly. |
| **Env Var** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | Provides the access token, skipping the interactive login. |

Here is an example of a non-interactive publish command suitable for a CI/CD pipeline:

```bash CI/CD Example icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## Troubleshooting

If you encounter an issue during publishing, check for these common problems:

- **Connection Error**: The provided URL for your self-hosted instance might be incorrect, or the server may be unreachable. Verify the URL and your network connection.

- **Invalid Website URL**: The URL must point to a valid website built on the ArcBlock platform. The CLI will show an error like `The provided URL is not a valid website on ArcBlock platform`. To host your documentation, you can start by getting a [Discuss Kit instance from the store](https://store.blocklet.dev/blocklets/z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu).

- **Missing Required Components**: The destination website must have the Discuss Kit component installed. If it is missing, the CLI will return an error like `This website does not have required components for publishing`. Please refer to the [Discuss Kit documentation](https://www.arcblock.io/docs/web3-kit/en/discuss-kit) to add the necessary component.

For a complete list of commands and options, refer to the [CLI Command Reference](./cli-reference.md).