# Publishing Your Docs

Once your documentation is generated, the final step is to make it available online. This document provides a step-by-step guide on how to publish your documentation using the `aigne doc publish` command, making it accessible to your audience.

## The Publish Command

The `aigne doc publish` command uploads your generated documentation files to a web service, allowing users to view them in a web browser. For efficiency, you can use the main command or its shorter aliases.

```bash Command Aliases icon=lucide:terminal
# Full command
aigne doc publish

# Short alias
aigne doc pub

# Shorter alias
aigne doc p
```

Executing this command for the first time will start an interactive setup process, guiding you to select a publishing platform for your documentation.

![A screenshot of the command-line interface prompting the user to select a publishing platform.](../assets/screenshots/doc-publish.png)

## Publishing Options

The tool offers several destinations for hosting your documentation. During the interactive setup, you will be presented with the following choices.

### 1. DocSmith Cloud (Free Hosting)

This option publishes your documentation to `docsmith.aigne.io`, a free, public hosting service provided by AIGNE.

*   **Best for**: Open-source projects, personal portfolios, or any documentation intended for public access.
*   **Cost**: Free.
*   **Outcome**: Your documentation will be hosted on a public URL, which is provided upon successful publication.

### 2. Your Existing Website (Self-Hosted)

This option allows you to publish documentation to a website you already own and operate. This requires you to run your own instance of Discuss Kit, which provides the necessary backend and front-end components for the documentation site.

*   **Best for**: Integrating documentation directly into an existing company website, product portal, or personal domain for complete control.
*   **Requirements**: You must have your own hosting environment.
*   **Procedure**:
    1.  Select the "Your existing website" option in the prompt.
    2.  Enter the full URL of your website (e.g., `https://docs.your-company.com`).
    3.  To set up your own documentation website, you can obtain a Discuss Kit instance from the official store: [https://www.web3kit.rocks/discuss-kit](https://www.web3kit.rocks/discuss-kit).

### 3. New Website (Paid Service)

This option helps you set up a new, dedicated website for your documentation through a guided process.

*   **Best for**: Users who require a professional, standalone documentation portal without managing the setup themselves.
*   **Cost**: This is a paid service.
*   **Procedure**: The command-line tool will direct you through the necessary steps to deploy and configure a new, managed Discuss Kit instance. If you have previously started this process, an option to resume the setup will be provided.

## Automated Publishing for CI/CD

In automated environments like Continuous Integration/Continuous Deployment (CI/CD) pipelines, you can bypass the interactive prompts by specifying the destination URL directly using the `--appUrl` flag.

```bash Direct Publishing icon=lucide:terminal
aigne doc publish --appUrl https://your-docs-website.com
```

When you publish to a specific URL for the first time, whether through the interactive prompt or the `--appUrl` flag, the tool saves this URL to your local configuration file. Subsequent runs of `aigne doc publish` will automatically use the saved URL, simplifying the update process.

## Troubleshooting

### Authorization Errors (401/403)

If the publishing process fails with an error message containing "401" or "403," it typically indicates an issue with your authentication token. The token may be invalid, expired, or lack the necessary permissions for the specified documentation board.

To resolve this, you can reset your local authentication credentials using the `clear` command.

```bash Clear Configuration icon=lucide:terminal
aigne doc clear
```

This command will prompt you to select which configuration data to remove. Choose to clear the authentication tokens. Afterward, run `aigne doc publish` again. You will be prompted to re-authenticate, which will generate a new, valid token, allowing the publication to proceed.

---

After successfully publishing your documentation, you will need to keep it current as your project evolves. Refer to the [Updating Documentation](./guides-updating-documentation.md) guide for instructions on how to modify your existing documents.