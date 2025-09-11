import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

// Create mock functions for blocklet module only
const mockGetComponentInfoWithMountPoint = mock();
const mockGetComponentInfo = mock();

// Mock only the blocklet module globally (it's safe as it's specific to this functionality)
mock.module("../utils/blocklet.mjs", () => ({
  getComponentInfoWithMountPoint: mockGetComponentInfoWithMountPoint,
  getComponentInfo: mockGetComponentInfo,
}));

// Mock the open module to prevent opening browser during tests
const mockOpenDefault = mock(() => Promise.resolve());
mock.module("open", () => ({
  default: mockOpenDefault,
}));

// Import the real utils module and deploy function
import { deploy } from "../utils/deploy.mjs";
import * as utils from "../utils/utils.mjs";

describe("deploy function", () => {
  let originalFetch;
  let originalConsole;
  let consoleOutput;
  let saveValueToConfigSpy;
  let originalSetTimeout;

  beforeEach(async () => {
    // Reset environment
    process.env.DOC_SMITH_BASE_URL = "https://test.example.com";
    process.env.NODE_ENV = "test";

    // Mock console to capture output
    consoleOutput = [];
    originalConsole = {
      log: console.log,
      error: console.error,
    };
    console.log = (...args) => consoleOutput.push({ type: "log", args });
    console.error = (...args) => consoleOutput.push({ type: "error", args });

    // Mock setTimeout to make tests run instantly
    originalSetTimeout = global.setTimeout;
    global.setTimeout = (callback, _delay) => {
      // Call immediately in tests
      return originalSetTimeout(callback, 0);
    };

    // Mock fetch
    originalFetch = global.fetch;

    // Use spyOn to mock saveValueToConfig without affecting other tests
    saveValueToConfigSpy = spyOn(utils, "saveValueToConfig").mockResolvedValue();

    // Reset blocklet mocks
    mockGetComponentInfoWithMountPoint.mockReset();
    mockGetComponentInfo.mockReset();

    // Set default mock implementations
    mockGetComponentInfoWithMountPoint.mockResolvedValue({
      mountPoint: "/payment",
      PAYMENT_LINK_ID: "test-payment-id",
    });

    mockGetComponentInfo.mockResolvedValue({
      status: "running",
    });
  });

  afterEach(() => {
    // Restore originals
    global.fetch = originalFetch;
    global.setTimeout = originalSetTimeout;
    console.log = originalConsole.log;
    console.error = originalConsole.error;

    // Restore spies
    if (saveValueToConfigSpy) {
      saveValueToConfigSpy.mockRestore();
    }

    // Reset open mock
    mockOpenDefault.mockReset();

    // Reset environment
    delete process.env.NODE_ENV;
  });

  test("successful deployment flow", async () => {
    // Mock API responses for the complete flow
    let callCount = 0;
    global.fetch = mock(async (url) => {
      callCount++;

      // Step 1: Create payment session
      if (url.includes("/api/checkout-sessions/start")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            checkoutSession: { id: "checkout-123" },
            paymentUrl: "https://payment.test/checkout-123",
          }),
        };
      }

      // Step 2-4: Poll payment/installation/service status
      if (url.includes("/api/vendors/order/checkout-123/status")) {
        if (callCount <= 2) {
          // First call: payment completed, installation in progress
          return {
            ok: true,
            status: 200,
            json: async () => ({
              payment_status: "paid",
              vendors: [{ id: "vendor-1", progress: 50, appUrl: null }],
            }),
          };
        } else {
          // Subsequent calls: installation complete
          return {
            ok: true,
            status: 200,
            json: async () => ({
              payment_status: "paid",
              vendors: [{ id: "vendor-1", progress: 100, appUrl: "https://app.test" }],
            }),
          };
        }
      }

      // Step 5: Get order details
      if (url.includes("/api/vendors/order/checkout-123/detail")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            vendors: [
              {
                appUrl: "https://app.test",
                dashboardUrl: "https://dashboard.test",
                homeUrl: "https://home.test",
                token: "auth-token-123",
              },
            ],
          }),
        };
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    const result = await deploy();

    // Verify result
    expect(result).toEqual({
      appUrl: "https://app.test",
      homeUrl: "https://home.test",
      token: "auth-token-123",
    });

    // Verify saveValueToConfig was called
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "checkoutId",
      "checkout-123",
      "Checkout ID for document deployment service",
    );
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "paymentUrl",
      expect.stringContaining("payment"),
      "Payment URL for document deployment service",
    );

    // Verify console output shows progress
    const logs = consoleOutput.filter((o) => o.type === "log").map((o) => o.args.join(" "));
    expect(logs.some((log) => log.includes("Step 1/4: Waiting for payment"))).toBe(true);
    expect(logs.some((log) => log.includes("Step 2/4: Installing service"))).toBe(true);
    expect(logs.some((log) => log.includes("Step 3/4: Starting service"))).toBe(true);
    expect(logs.some((log) => log.includes("Step 4/4: Getting service URL"))).toBe(true);
    expect(logs.some((log) => log.includes("Your website is available at"))).toBe(true);
  });

  test("handles missing payment link ID", async () => {
    mockGetComponentInfoWithMountPoint.mockResolvedValue({
      mountPoint: "/payment",
      PAYMENT_LINK_ID: null,
    });

    await expect(deploy()).rejects.toThrow("Payment link ID not found");
  });

  test("handles payment session creation failure", async () => {
    global.fetch = mock(async (url) => {
      if (url.includes("/api/checkout-sessions/start")) {
        return {
          ok: false,
          status: 400,
          json: async () => ({ error: "Payment creation failed" }),
        };
      }
    });

    await expect(deploy()).rejects.toThrow("Failed to create payment session");

    const errors = consoleOutput.filter((o) => o.type === "error");
    expect(errors.length).toBeGreaterThan(0);
  });

  test("handles network errors gracefully", async () => {
    global.fetch = mock(async () => {
      throw new Error("Network connection failed");
    });

    await expect(deploy()).rejects.toThrow("Failed to create payment session");
  });

  test("handles browser opening failure gracefully", async () => {
    // Mock successful API flow
    global.fetch = mock(async (url) => {
      if (url.includes("/api/checkout-sessions/start")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            checkoutSession: { id: "checkout-123" },
            paymentUrl: "https://payment.test/checkout-123",
          }),
        };
      }

      if (url.includes("/status")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            payment_status: "paid",
            vendors: [{ id: "vendor-1", progress: 100, appUrl: "https://app.test" }],
          }),
        };
      }

      if (url.includes("/detail")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            vendors: [
              {
                appUrl: "https://app.test",
                homeUrl: "https://home.test",
                token: "auth-token-123",
              },
            ],
          }),
        };
      }
    });

    // Mock open to fail
    mockOpenDefault.mockRejectedValue(new Error("Cannot open browser"));

    // Call deploy without cached parameters - should still succeed
    const result = await deploy();

    // Should still complete successfully despite browser opening failure
    expect(result.appUrl).toBe("https://app.test");
    expect(result.homeUrl).toBe("https://home.test");
    expect(result.token).toBe("auth-token-123");
  });

  test("handles cached checkout ID", async () => {
    // Mock successful status check for cached ID
    global.fetch = mock(async (url) => {
      if (url.includes("/status")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            payment_status: "paid",
            vendors: [{ id: "vendor-1", progress: 100, appUrl: "https://app.test" }],
          }),
        };
      }

      if (url.includes("/detail")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            vendors: [
              {
                appUrl: "https://app.test",
                homeUrl: "https://home.test",
                token: "auth-token-123",
              },
            ],
          }),
        };
      }
    });

    const result = await deploy("existing-checkout-id", "https://cached-payment.url");

    expect(result.appUrl).toBe("https://app.test");

    // Should not call open since using cached checkout
    expect(mockOpenDefault).not.toHaveBeenCalled();
  });

  test("clears checkout ID when cache check fails", async () => {
    // Mock successful responses for the complete flow after cache check fails
    let callCount = 0;
    global.fetch = mock(async (url) => {
      callCount++;

      // First call: cache check fails
      if (callCount === 1 && url.includes("/status")) {
        throw new Error("Network error during cache check");
      }

      // Create payment session
      if (url.includes("/api/checkout-sessions/start")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            checkoutSession: { id: "new-checkout-123" },
            paymentUrl: "https://payment.test/new-checkout-123",
          }),
        };
      }

      // Subsequent status checks and detail calls
      if (url.includes("/status")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            payment_status: "paid",
            vendors: [{ id: "vendor-1", progress: 100, appUrl: "https://app.test" }],
          }),
        };
      }

      if (url.includes("/detail")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            vendors: [
              {
                appUrl: "https://app.test",
                homeUrl: "https://home.test",
                token: "auth-token-123",
              },
            ],
          }),
        };
      }
    });

    // Call deploy with invalid cached checkout ID - should clear it and create new one
    const result = await deploy("invalid-checkout-id");

    expect(result.appUrl).toBe("https://app.test");

    // Verify that checkoutId was cleared due to cache check failure
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "checkoutId",
      "",
      "Checkout ID for document deployment service",
    );
  });
});
