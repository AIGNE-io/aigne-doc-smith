# Publish Your Docs

After generating your documentation, the `aigne doc publish` command uploads your files and makes them accessible via a shareable link. This guide provides a step-by-step process for publishing your documentation to either the official AIGNE platform or a self-hosted instance.

## The Publishing Process

The `aigne doc publish` command starts an interactive workflow. The first time you publish to a destination, the CLI will open a browser to guide you through a one-time authentication process. For subsequent publishes, it will use the saved credentials stored in `~/.aigne/doc-smith-connected.yaml`.

```d2 The Publishing Workflow icon=lucide:upload-cloud
shape: sequence_diagram

User: {
  label: "Developer / CI-CD"
  shape: c4-person
}

CLI: {
  label: "CLI\n(aigne doc publish)"
}

Local-Config: {
  label: "Local Config\n(~/.aigne/...)"
  shape: cylinder
}

Browser

Platform: {
  label: "Platform\n(Official or Self-Hosted)"
}

User -> CLI: "Run command"

alt "Interactive Mode" {
  CLI -> Local-Config: "Check for credentials"
  opt "Credentials not found (First time)" {
    CLI -> User: "Prompt to choose platform"
    User -> CLI: "Platform selected"
    CLI -> Browser: "Open auth URL"
    User -> Browser: "Login & Authorize"
    Browser -> Platform: "Request token"
    Platform -> Browser: "Return token"
    Browser -> CLI: "Send token to CLI"
    CLI -> Local-Config: "Save credentials"
  }
  CLI -> Platform: "Upload documentation"
  Platform -> CLI: "Confirm success"
  CLI -> User: "Display success message"
}

alt "CI/CD Mode" {
  note over CLI: "Reads token from ENV VAR"
  CLI -> Platform: "Upload documentation"
  Platform -> CLI: "Confirm success"
  CLI -> User: "Return success status"
}
```

## Publishing Options

You can choose between two primary destinations for hosting your documentation:

<x-cards data-columns="2">
  <x-card data-title="Official Platform" data-icon="lucide:globe">
    Publish to docsmith.aigne.io, a service operated by AIGNE. This is a straightforward option for open-source projects or for quickly sharing your documentation publicly.
  </x-card>
  <x-card data-title="Self-Hosted Instance" data-icon="lucide:server">
    Publish to your own Discuss Kit instance for complete control over branding, access, and data privacy. This is the recommended option for internal or private documentation. You can run your own Discuss Kit instance by following the instructions available at the official documentation.
  </x-card>
</x-cards>

## Step-by-Step Guide

Follow these steps to publish your documentation.

### 1. Run the Publish Command

Navigate to your project's root directory and execute the following command:

```bash Terminal icon=lucide:terminal
aigne doc publish
```

### 2. Choose Your Platform

If this is your first time publishing, you will be prompted to select a destination. Choose the option that fits your requirements.

![Choose between the official platform or a self-hosted instance](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d0_3cf5eb7aea85aa.png)

If you select a self-hosted instance, you will be asked to enter its URL.

### 3. Authenticate Your Account

For the initial connection, a browser window will open automatically for you to log in and authorize the CLI. This step is only required once per platform. The access token is saved locally for future use.

### 4. Confirmation

Once the upload is complete, a success message will appear in your terminal, confirming that the documentation is live.

```
✅ Documentation Published Successfully!
```

## Publishing in CI/CD Environments

To use the publish command in automated workflows like CI/CD pipelines, you can bypass the interactive prompts by providing the necessary information through arguments and environment variables.

| Method | Name | Description |
|---|---|---|
| **Argument** | `--appUrl` | Specifies the URL of your Discuss Kit instance. |
| **Env Var** | `DOC_DISCUSS_KIT_ACCESS_TOKEN` | Provides the access token to skip the interactive login process. |

Here is an example of a non-interactive publish command suitable for a CI/CD script:

```bash CI/CD Example icon=lucide:workflow
export DOC_DISCUSS_KIT_ACCESS_TOKEN="your_access_token_here"
aigne doc publish --appUrl https://docs.mycompany.com
```

## Troubleshooting

If you encounter an issue during the publishing process, it may be due to one of the following common problems.

- **Connection Error**: The CLI may return an error message like `Unable to connect to: <URL>`. This can be caused by network issues, a server that is temporarily unavailable, or an incorrect URL. Verify that the URL is correct and the server is reachable.

- **Invalid Website URL**: The command may fail with the message `The provided URL is not a valid website on ArcBlock platform`. The destination URL must be a website built on the ArcBlock platform. To host your documentation, you can run your own instance of Discuss Kit.

- **Missing Required Components**: An error stating `This website does not have required components for publishing` indicates that the destination website does not have the Discuss Kit component installed. Please refer to the Discuss Kit documentation to add the necessary component to your site.

For a complete list of commands and options, see the [CLI Command Reference](./cli-reference.md).