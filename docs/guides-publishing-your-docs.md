# Publishing Your Docs

After generating your documentation, the next step is to make it accessible online. This guide provides a systematic procedure for publishing your documentation using the `aigne doc publish` command.

## The Publish Command

The `aigne doc publish` command uploads your generated documentation files to a web service, making them available to your audience through a web browser.

You can execute the command using its full name or one of its aliases for convenience.

```bash Command Execution icon=lucide:terminal
# Full command
aigne doc publish

# Aliases
aigne doc pub
aigne doc p
```

When this command is run for the first time, it initiates an interactive prompt to guide you through selecting a publishing platform.

![Publish Documentation Dialog](../assets/screenshots/doc-publish.png)

## Publishing Destinations

The tool provides several destinations for hosting your documentation. The interactive setup will present the following choices.

### Option 1: DocSmith Cloud

This option publishes your documentation to `docsmith.aigne.io`, a free hosting service.

*   **Intended Use**: This method is suitable for open-source projects or any documentation that is intended for public access.
*   **Cost**: Free.
*   **Outcome**: Your documentation will be publicly available at a URL provided after the publishing process is complete.

### Option 2: Your Existing Website

This option allows you to publish documentation to a website you already own and manage. It requires you to operate your own instance of Discuss Kit.

*   **Intended Use**: This is for integrating documentation directly into an existing company website, product portal, or personal domain.
*   **Requirements**: You must have your own hosting infrastructure and a running instance of Discuss Kit.
*   **Procedure**:
    1.  Select the "Your existing website" option from the interactive prompt.
    2.  When prompted, enter the full URL of your website (e.g., `https://docs.your-company.com`).
    3.  To set up your own documentation website, you can obtain a Discuss Kit instance from the official store: [https://www.web3kit.rocks/discuss-kit](https://www.web3kit.rocks/discuss-kit). Discuss Kit is a non-open-source service that provides the necessary backend for hosting.

### Option 3: New Website

This option assists you in setting up a new, dedicated website for your documentation.

*   **Intended Use**: This is for users who need a standalone documentation portal but do not have an existing website.
*   **Cost**: This is a paid service.
*   **Procedure**: The command-line interface will guide you through the process of deploying and configuring a new Discuss Kit instance. If you have previously started this process, an option to resume the setup will also be available.

## Automated Publishing

For automated environments, such as a Continuous Integration/Continuous Deployment (CI/CD) pipeline, you can bypass the interactive prompt by specifying the destination URL directly.

Use the `--appUrl` flag with the command to define the publishing target.

```bash Direct Publishing Example icon=lucide:terminal
aigne doc publish --appUrl https://docs.your-company.com
```

Once you publish to a specific URL for the first time (either through the interactive prompt or the `--appUrl` flag), the tool saves this URL to your local configuration file. Subsequent executions of `aigne doc publish` will automatically use the saved URL, streamlining the update process.

## Troubleshooting

### Authorization Errors

If the publishing process fails with an error message containing "401" or "403," it indicates an issue with your authentication token. The token may be invalid, expired, or lack the required permissions.

To resolve this, you can reset your local authentication token. The `clear` command provides an option to clear your saved credentials.

```bash Clear Configuration icon=lucide:terminal
aigne doc clear
```

When prompted, you can choose to clear the `authTokens` to reset your login session. After the command completes, run `aigne doc publish` again. You will be prompted to re-authenticate, which will generate a new, valid token.

---

After successfully publishing your documentation, you may need to update it as your project evolves. For instructions on this process, please see the [Updating Documentation](./guides-updating-documentation.md) guide.
