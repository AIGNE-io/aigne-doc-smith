# Publishing Your Docs

Once you have generated your documentation, the next step is to publish it online, making it accessible to your audience. This guide provides a systematic overview of the publishing process using the `aigne doc publish` command.

## The Publish Command

The primary command for making your documentation live is `aigne doc publish`. This command uploads your generated files to a web service, where they can be viewed in a browser.

You can execute the command using its full name or its shorter aliases:

```bash
# Full command
aigne doc publish

# Aliases
aigne doc pub
aigne doc p
```

When you run the publish command for the first time, you will be presented with an interactive prompt to select your preferred publishing platform.

## Publishing Options

You have several options for where to host your documentation. The interactive prompt will guide you through the selection.

### 1. DocSmith Cloud (Free Hosting)

This option publishes your documentation to `docsmith.aigne.io`, a free hosting service provided by AIGNE.

-   **Use Case:** Ideal for open-source projects, personal blogs, or any scenario where public accessibility is desired without the need for custom infrastructure.
-   **Cost:** Free.
-   **Outcome:** Your documents will be publicly available at a URL provided upon successful publication.

### 2. Your Existing Website

This option allows you to publish the documentation to a website that you already own and manage.

-   **Use Case:** Best for integrating documentation directly into an existing company website, product site, or personal domain. This method requires you to run your own instance of Discuss Kit.
-   **Cost:** Requires your own hosting infrastructure.
-   **Setup:**
    1.  Select this option in the prompt.
    2.  You will be asked to enter the URL of your website (e.g., `https://docs.your-company.com`).
    3.  To set up your own documentation website, you can get a Discuss Kit instance from the official store: [https://www.web3kit.rocks/discuss-kit](https://www.web3kit.rocks/discuss-kit).

### 3. New Website (Paid Service)

If you do not have an existing website, this service helps you set up a new, dedicated site for your documentation.

-   **Use Case:** Suitable for creating a professional, standalone documentation portal with a custom domain and hosting managed for you.
-   **Cost:** This is a paid service.
-   **Process:** The command will guide you through the necessary steps to deploy and configure a new Discuss Kit instance. If you have started this process before, you will also see an option to resume your previous setup.

## Direct Publishing

For automated workflows, such as CI/CD pipelines, or after you have completed the initial setup, you can bypass the interactive prompt by specifying the application URL directly.

Use the `--appUrl` flag followed by your website's URL.

```bash
# Example for a custom documentation site
aigne doc publish --appUrl https://docs.your-company.com
```

Once you successfully publish to a specific URL (either by selecting an option in the prompt or by using the `--appUrl` flag), DocSmith saves this URL in your local configuration. On subsequent runs, it will automatically publish to the saved URL without asking again.

## Troubleshooting

### Authorization Errors

If you encounter an error message containing "401" or "403," it indicates that your authentication token is invalid or has expired. This can happen if permissions have changed or if the token is old.

To resolve this, you can clear all stored configuration and credentials by running the `clear` command:

```bash
aigne doc clear
```

After clearing the configuration, run `aigne doc publish` again. You will be guided through the authentication and setup process as if it were the first time.