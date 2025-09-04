---
labels: ["Reference"]
---

# Deploy Discuss Kit Service

AIGNE DocSmith now offers an innovative feature that automatically creates and deploys a new Discuss Kit service for hosting your documentation. This eliminates the need to manually set up a hosting platform, providing a seamless end-to-end solution from documentation generation to live publication.

This feature is perfect for users who want a dedicated, private documentation website without the complexity of manual setup and configuration.

## The Deployment Process

When you choose to deploy a new Discuss Kit service, DocSmith guides you through a streamlined 4-step process:

### Step 1: Payment Session Creation
The system creates a secure payment session and automatically opens your browser to complete the transaction. The payment covers the infrastructure costs for your dedicated documentation website.

### Step 2: Payment Processing
DocSmith monitors the payment status in real-time, waiting up to 5 minutes for completion. You can safely close the browser window after payment, as the CLI will continue monitoring automatically.

### Step 3: Service Installation
Once payment is confirmed, the system automatically installs and configures all necessary components, including the Discuss Kit platform and any required dependencies. This process typically takes 3-5 minutes.

### Step 4: Service Startup & URL Generation
Finally, the system starts your new documentation website and provides you with the final URLs for accessing your site, including administrative dashboard links.

## Enhanced Publishing Options

The new deployment feature integrates seamlessly with DocSmith's existing publishing workflow. When you run `aigne doc publish`, you now have multiple options:

<x-cards data-columns="2">
  <x-card data-title="Official Platform" data-icon="lucide:globe">
    Publish to the free docsmith.aigne.io platform for public, open-source documentation.
  </x-card>
  <x-card data-title="Existing Website" data-icon="lucide:server">
    Publish to your current website that already has Discuss Kit installed.
  </x-card>
  <x-card data-title="New Dedicated Website" data-icon="lucide:rocket">
    Deploy a completely new, private Discuss Kit service specifically for your documentation.
  </x-card>
  <x-card data-title="Resume Setup" data-icon="lucide:play-circle">
    Continue from a previous deployment setup that was interrupted or incomplete.
  </x-card>
</x-cards>

## Key Features & Benefits

### Automatic Infrastructure Management

- **Zero Configuration**: No need to manually set up servers, databases, or hosting environments.
- **Component Installation**: Automatically installs and configures Discuss Kit and all dependencies.
- **Service Monitoring**: Real-time status monitoring ensures your service is fully operational before completion.

### Enhanced User Experience

- **Resume Capability**: If a deployment is interrupted, you can resume from where you left off using cached session data.
- **Multilingual Support**: Custom success messages are provided in both English and Chinese for better user experience.
- **Intelligent Timeouts**: Reasonable timeout configurations (5 minutes per step) with clear progress indicators.

### Payment & Security Integration

- **Secure Payment Processing**: Integration with Payment Kit for secure transaction handling.
- **Session Management**: Persistent session tracking allows for interrupted deployments to be resumed.
- **Token-Based Authentication**: Automatic generation and management of access tokens for your new service.

## Usage Examples

### Deploy a New Documentation Website

```bash
# Start the publishing process and select "new website" option
aigne doc publish
```

The CLI will present you with deployment options, and you can choose "Publish to a new website" to begin the automated setup process.

### Resume an Interrupted Deployment

If your previous deployment was interrupted, DocSmith automatically detects this and offers a resume option:

```bash
# The CLI will show "Continue your previous website setup" option
aigne doc publish
```

### Direct Publishing After Deployment

Once your new service is deployed, future publications to the same service are instant:

```bash
# Publishes directly to your configured service
aigne doc publish
```

## Technical Implementation

The deployment process leverages several sophisticated mechanisms:

- **Payment Session Management**: Secure checkout session creation with metadata support for customized success messages.
- **Service Status Polling**: Intelligent monitoring of installation progress and service health.
- **Component Verification**: Automatic verification that all required components are properly installed and running.
- **Configuration Persistence**: Automatic saving of service URLs and authentication tokens for future use.

## Troubleshooting

### Common Issues and Solutions

- **Payment Timeout**: If payment takes longer than 5 minutes, the session will timeout. Simply restart the process to create a new payment session.
- **Installation Delays**: Service installation typically completes within 5 minutes. If it takes longer, the system will timeout and provide guidance.
- **Service Startup Issues**: The system monitors service health and will retry automatically. If problems persist, contact support.

### Error Recovery

The deployment process includes robust error handling:

- Automatic cleanup of failed deployments
- Session data preservation for resume capability  
- Clear error messages with actionable next steps

---

This new deployment capability represents a significant enhancement to DocSmith's publishing workflow, making it easier than ever to create professional documentation websites. For more information about the standard publishing process, see [Publish Your Docs](./features-publish-your-docs.md).
