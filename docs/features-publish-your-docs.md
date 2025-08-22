---
labels: ["Reference"]
---

# Publish Your Docs

Once your documentation is generated, the next step is to make it accessible online. AIGNE DocSmith provides a streamlined process to publish your content to either the official, free AIGNE platform or your own self-hosted website. This guide walks you through the simple `publish` command.

## The Publishing Command

The entire publishing process is handled by a single command:

```bash
aigne doc publish
```

Running this command initiates an interactive wizard that guides you through the necessary steps, making it the recommended method for most users.

### The Interactive Wizard

When you run `aigne doc publish` for the first time, you will be prompted to choose where you want your documentation to live.

![Choose where to publish your documentation](https://docsmith.aigne.io/image-bin/uploads/9fd929060b5abe13d03cf5eb7aea85aa.png)

You have two main options:

1.  **Official Platform (`docsmith.aigne.io`)**: This is a free-to-use option where your documentation will be publicly accessible. It's an excellent choice for open-source projects or any documentation you want to share widely without managing your own infrastructure.

2.  **Self-Hosted Platform**: This option allows you to publish documentation to your own website. This is ideal for private, internal, or commercial project documentation. To use this, you must have an instance of [Discuss Kit](https://www.npmjs.com/package/@arcblock/discuss-kit) running on your site.

### Authorization

The first time you publish to a specific URL, DocSmith will need to get your authorization to post content on your behalf. This is a secure, one-time process per platform:

1.  A browser window will automatically open.
2.  You will be prompted to connect and approve the access request from AIGNE DocSmith.
3.  Once approved, an access token is securely saved on your local machine for all future publications to that URL, so you won't have to repeat this step.

After a successful publication, you will see a confirmation message:

```
✅ Documentation Published Successfully!
```

## Publishing to a Custom URL Directly

For automated workflows or to bypass the interactive prompts, you can specify the target URL directly using the `--appUrl` flag.

```bash
# Publish to a custom Discuss Kit instance
aigne doc publish --appUrl https://your-discuss-kit-instance.com
```

## Troubleshooting

If you encounter issues during the publishing process, here are some common problems and their solutions:

*   **Error: `The provided URL is not a valid website`**: This means the URL does not point to a website built on the correct underlying platform. You can get started with your own compatible website by following the guide at the [Discuss Kit Store](https://www.npmjs.com/package/@arcblock/discuss-kit).

*   **Error: `This website does not have required components for publishing`**: The target website is valid, but it's missing the necessary "Discuss Kit" component to host the documentation. Please refer to the [documentation on adding components](https://www.npmjs.com/package/@arcblock/discuss-kit) to resolve this.

*   **Error: `Unable to connect to...`**: This is typically a network issue. Check that the URL is correct and that the server is online and accessible from your network.

---

With your documentation now published, you might want to make it accessible to a global audience. Continue to the next section to learn how to [Translate Documentation](./features-translate-documentation.md).