# Getting Started

This guide will walk you through the essential steps to install the `@blocklet/js-sdk` and make your first API call. Our goal is to get you up and running in just a few minutes.

## Installation

First, you need to add the SDK to your project. You can use your preferred package manager:

```bash Installation icon=mdi:bash
npm install @blocklet/js-sdk

# or

yarn add @blocklet/js-sdk

# or

pnpm add @blocklet/js-sdk
```

## Basic Usage

The SDK is designed to be straightforward. The two most common use cases are accessing core Blocklet services (like user authentication) and making authenticated requests to your own Blocklet's backend.

### Accessing Core Services

The easiest way to use the SDK is by importing the `getBlockletSDK` singleton factory. This function ensures that you always get the same SDK instance throughout your application, simplifying state management.

Here's how you can use it to fetch the current user's profile:

```javascript Get User Profile icon=logos:javascript
import { getBlockletSDK } from '@blocklet/js-sdk';

const sdk = getBlockletSDK();

async function fetchUserProfile() {
  try {
    const { data: userProfile } = await sdk.user.getProfile();
    console.log('User Profile:', userProfile);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
  }
}

fetchUserProfile();
```

The `sdk` instance provides access to various services like `user`, `userSession`, `blocklet`, and more. These services handle communication with the well-known Blocklet service endpoints for you.

### Making API Requests to Your Blocklet

For communicating with your own Blocklet's backend API, the SDK provides `createAxios` and `createFetch` helper functions. These are wrappers around Axios and the native Fetch API that come pre-configured with everything needed for authenticated requests.

They automatically handle:
- Setting the correct `baseURL` for your component.
- Attaching the session token to the `Authorization` header.
- Including the `x-csrf-token` for security.
- Refreshing the session token automatically if it expires.

Here’s how to create an API client for your backend using `createAxios`:

```javascript Create an API Client icon=logos:javascript
import { createAxios } from '@blocklet/js-sdk';

// Create an Axios instance configured for your Blocklet
const apiClient = createAxios();

async function fetchData() {
  try {
    // Make a request to your own backend, e.g., GET /api/posts
    const response = await apiClient.get('/api/posts');
    console.log('Posts:', response.data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

fetchData();
```

With this setup, you don't need to manually manage tokens or headers. The SDK takes care of the authentication flow seamlessly.

## Next Steps

You've now learned how to install the `@blocklet/js-sdk` and use it for the two most common scenarios. To dive deeper, we recommend exploring the following guides:

<x-cards>
  <x-card data-title="Making API Requests" data-icon="lucide:file-code-2" data-href="/guides/making-api-requests">
    Learn more about advanced configuration for `createAxios` and `createFetch`, including error handling and request parameters.
  </x-card>
  <x-card data-title="Authentication" data-icon="lucide:key-round" data-href="/guides/authentication">
    Understand how the SDK manages session and refresh tokens under the hood to keep your users logged in.
  </x-card>
</x-cards>
