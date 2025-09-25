import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as openModule from "open";
import * as authUtilsModule from "../../utils/auth-utils.mjs";

// Import the deploy function
import { deploy } from "../../utils/deploy.mjs";
import * as utilsModule from "../../utils/utils.mjs";

// Mock BrokerClient
const mockBrokerClient = {
  deploy: mock(),
};

const mockBrokerClientConstructor = mock(() => mockBrokerClient);

// Mock the payment broker client module
mock.module("@blocklet/payment-broker-client/node", () => ({
  BrokerClient: mockBrokerClientConstructor,
  STEPS: {
    PAYMENT_PENDING: "PAYMENT_PENDING",
    INSTALLATION_STARTING: "INSTALLATION_STARTING",
    SERVICE_STARTING: "SERVICE_STARTING",
    ACCESS_PREPARING: "ACCESS_PREPARING",
    ACCESS_READY: "ACCESS_READY",
  },
}));

describe("deploy", () => {
  let originalConsole;
  let consoleOutput;
  let getOfficialAccessTokenSpy;
  let saveValueToConfigSpy;
  let openDefaultSpy;

  beforeEach(() => {
    // Note: DOC_SMITH_BASE_URL is not set, so BASE_URL will be empty string

    // Mock console to capture output
    consoleOutput = [];
    originalConsole = {
      log: console.log,
      error: console.error,
    };
    console.log = (...args) => consoleOutput.push({ type: "log", args });
    console.error = (...args) => consoleOutput.push({ type: "error", args });

    // Mock dependencies
    getOfficialAccessTokenSpy = spyOn(authUtilsModule, "getOfficialAccessToken").mockResolvedValue(
      "mock-auth-token",
    );
    saveValueToConfigSpy = spyOn(utilsModule, "saveValueToConfig").mockResolvedValue();
    openDefaultSpy = spyOn(openModule, "default").mockResolvedValue();

    // Reset mocks
    mockBrokerClientConstructor.mockClear();
    mockBrokerClient.deploy.mockClear();
  });

  afterEach(() => {
    // Restore console
    console.log = originalConsole.log;
    console.error = originalConsole.error;

    // Restore all spies
    getOfficialAccessTokenSpy?.mockRestore();
    saveValueToConfigSpy?.mockRestore();
    openDefaultSpy?.mockRestore();

    // Clean up environment
    delete process.env.NODE_ENV;
  });

  test("successful deployment flow", async () => {
    // Mock successful deployment result
    const mockResult = {
      appUrl: "https://app.test",
      homeUrl: "https://home.test",
      dashboardUrl: "https://dashboard.test",
      subscriptionUrl: "https://subscription.test",
      vendors: [{ token: "auth-token-123" }],
    };

    mockBrokerClient.deploy.mockResolvedValue(mockResult);

    const result = await deploy();

    // Verify BrokerClient was constructed with correct config
    expect(mockBrokerClientConstructor).toHaveBeenCalledWith({
      baseUrl: "",
      authToken: "mock-auth-token",
      paymentLinkKey: "PAYMENT_LINK_ID",
      timeout: 300000,
      polling: {
        interval: 3000,
        maxAttempts: 100,
        backoffStrategy: "linear",
      },
    });

    // Verify deploy was called with correct parameters
    expect(mockBrokerClient.deploy).toHaveBeenCalledWith(
      expect.objectContaining({
        cachedCheckoutId: undefined,
        cachedPaymentUrl: undefined,
        page_info: expect.objectContaining({
          success_message: expect.objectContaining({
            en: expect.stringContaining("Congratulations"),
            zh: expect.stringContaining("恭喜您"),
          }),
        }),
        hooks: expect.objectContaining({
          PAYMENT_PENDING: expect.any(Function),
          INSTALLATION_STARTING: expect.any(Function),
          SERVICE_STARTING: expect.any(Function),
          ACCESS_PREPARING: expect.any(Function),
          ACCESS_READY: expect.any(Function),
        }),
        onError: expect.any(Function),
      }),
    );

    // Verify result transformation
    expect(result).toEqual({
      appUrl: "https://app.test",
      homeUrl: "https://home.test",
      dashboardUrl: "https://dashboard.test",
      subscriptionUrl: "https://subscription.test",
      token: "auth-token-123",
    });

    // Verify console output
    const logs = consoleOutput.filter((o) => o.type === "log").map((o) => o.args.join(" "));
    expect(logs.some((log) => log.includes("🚀 Starting deployment..."))).toBe(true);
  });

  test("successful deployment with cached parameters", async () => {
    const mockResult = {
      appUrl: "https://app.test",
      homeUrl: "https://home.test",
      vendors: [{ token: "auth-token-123" }],
    };

    mockBrokerClient.deploy.mockResolvedValue(mockResult);

    const result = await deploy("cached-checkout-id", "https://cached-payment.url");

    // Verify deploy was called with cached parameters
    expect(mockBrokerClient.deploy).toHaveBeenCalledWith(
      expect.objectContaining({
        cachedCheckoutId: "cached-checkout-id",
        cachedPaymentUrl: "https://cached-payment.url",
      }),
    );

    expect(result.appUrl).toBe("https://app.test");
    expect(result.token).toBe("auth-token-123");
  });

  test("handles missing auth token", async () => {
    getOfficialAccessTokenSpy.mockResolvedValue(null);

    await expect(deploy()).rejects.toThrow("Failed to get official access token");

    // Verify BrokerClient was not created
    expect(mockBrokerClientConstructor).not.toHaveBeenCalled();
  });

  test("handles BrokerClient deployment failure", async () => {
    const deployError = new Error("Deployment failed");
    mockBrokerClient.deploy.mockRejectedValue(deployError);

    await expect(deploy()).rejects.toThrow("Deployment failed");

    // Verify BrokerClient was created and deploy was called
    expect(mockBrokerClientConstructor).toHaveBeenCalled();
    expect(mockBrokerClient.deploy).toHaveBeenCalled();
  });

  test("PAYMENT_PENDING hook functionality", async () => {
    let paymentPendingHook;

    mockBrokerClient.deploy.mockImplementation(async (config) => {
      paymentPendingHook = config.hooks.PAYMENT_PENDING;
      return {
        appUrl: "https://app.test",
        vendors: [{ token: "test-token" }],
      };
    });

    await deploy();

    // Test the PAYMENT_PENDING hook
    await paymentPendingHook({
      sessionId: "session-123",
      paymentUrl: "https://payment.test/session-123",
      isResuming: false,
    });

    // Verify saveValueToConfig was called
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "checkoutId",
      "session-123",
      "Checkout ID for document deployment website",
    );
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "paymentUrl",
      "https://payment.test/session-123",
      "Payment URL for document deployment website",
    );

    // Verify browser was opened
    expect(openDefaultSpy).toHaveBeenCalledWith("https://payment.test/session-123");

    // Verify console output
    const logs = consoleOutput.filter((o) => o.type === "log").map((o) => o.args.join(" "));
    expect(logs.some((log) => log.includes("⏳ Step 1/4: Waiting for payment..."))).toBe(true);
    expect(logs.some((log) => log.includes("🔗 Payment link:"))).toBe(true);
  });

  test("PAYMENT_PENDING hook with isResuming=true", async () => {
    let paymentPendingHook;

    mockBrokerClient.deploy.mockImplementation(async (config) => {
      paymentPendingHook = config.hooks.PAYMENT_PENDING;
      return {
        appUrl: "https://app.test",
        vendors: [{ token: "test-token" }],
      };
    });

    await deploy();

    // Test the PAYMENT_PENDING hook with isResuming=true
    await paymentPendingHook({
      sessionId: "session-123",
      paymentUrl: "https://payment.test/session-123",
      isResuming: true,
    });

    // Verify browser was NOT opened when resuming
    expect(openDefaultSpy).not.toHaveBeenCalled();

    // But saveValueToConfig should still be called
    expect(saveValueToConfigSpy).toHaveBeenCalledWith(
      "checkoutId",
      "session-123",
      "Checkout ID for document deployment website",
    );
  });

  test("other hooks functionality", async () => {
    let hooks;

    mockBrokerClient.deploy.mockImplementation(async (config) => {
      hooks = config.hooks;
      return {
        appUrl: "https://app.test",
        vendors: [{ token: "test-token" }],
      };
    });

    await deploy();

    // Test INSTALLATION_STARTING hook
    hooks.INSTALLATION_STARTING();
    let logs = consoleOutput.filter((o) => o.type === "log").map((o) => o.args.join(" "));
    expect(logs.some((log) => log.includes("📦 Step 2/4: Installation Website..."))).toBe(true);

    // Test SERVICE_STARTING hook
    hooks.SERVICE_STARTING();
    logs = consoleOutput.filter((o) => o.type === "log").map((o) => o.args.join(" "));
    expect(logs.some((log) => log.includes("🚀 Step 3/4: Starting Website..."))).toBe(true);

    // Test ACCESS_PREPARING hook
    hooks.ACCESS_PREPARING();
    logs = consoleOutput.filter((o) => o.type === "log").map((o) => o.args.join(" "));
    expect(logs.some((log) => log.includes("🌐 Step 4/4: Getting Website URL..."))).toBe(true);

    // Test ACCESS_READY hook without subscription
    await hooks.ACCESS_READY({
      appUrl: "https://app.test",
      homeUrl: "https://home.test",
    });
    logs = consoleOutput.filter((o) => o.type === "log").map((o) => o.args.join(" "));
    expect(logs.some((log) => log.includes("🔗 Your website is available at:"))).toBe(true);
    expect(logs.some((log) => log.includes("https://home.test"))).toBe(true);

    // Test ACCESS_READY hook with subscription
    await hooks.ACCESS_READY({
      appUrl: "https://app.test",
      homeUrl: "https://home.test",
      subscriptionUrl: "https://subscription.test",
    });
    logs = consoleOutput.filter((o) => o.type === "log").map((o) => o.args.join(" "));
    expect(logs.some((log) => log.includes("🔗 Your subscription management URL:"))).toBe(true);
    expect(logs.some((log) => log.includes("https://subscription.test"))).toBe(true);
  });

  test("handles missing vendors in result", async () => {
    const mockResult = {
      appUrl: "https://app.test",
      homeUrl: "https://home.test",
      vendors: null,
    };

    mockBrokerClient.deploy.mockResolvedValue(mockResult);

    const result = await deploy();

    expect(result.token).toBeUndefined();
    expect(result.appUrl).toBe("https://app.test");
    expect(result.homeUrl).toBe("https://home.test");
  });

  test("handles empty vendors array in result", async () => {
    const mockResult = {
      appUrl: "https://app.test",
      homeUrl: "https://home.test",
      vendors: [],
    };

    mockBrokerClient.deploy.mockResolvedValue(mockResult);

    const result = await deploy();

    expect(result.token).toBeUndefined();
    expect(result.appUrl).toBe("https://app.test");
    expect(result.homeUrl).toBe("https://home.test");
  });

  test("uses default BASE_URL when not set", async () => {
    delete process.env.DOC_SMITH_BASE_URL;

    const mockResult = {
      appUrl: "https://app.test",
      vendors: [{ token: "test-token" }],
    };

    mockBrokerClient.deploy.mockResolvedValue(mockResult);

    await deploy();

    // Verify BrokerClient was constructed with empty baseUrl
    expect(mockBrokerClientConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: "",
      }),
    );
  });

  test("handles browser opening failure", async () => {
    openDefaultSpy.mockRejectedValue(new Error("Cannot open browser"));

    let paymentPendingHook;
    mockBrokerClient.deploy.mockImplementation(async (config) => {
      paymentPendingHook = config.hooks.PAYMENT_PENDING;
      return {
        appUrl: "https://app.test",
        vendors: [{ token: "test-token" }],
      };
    });

    await deploy();

    // The hook should throw when browser opening fails (expected behavior)
    await expect(
      paymentPendingHook({
        sessionId: "session-123",
        paymentUrl: "https://payment.test/session-123",
        isResuming: false,
      }),
    ).rejects.toThrow("Cannot open browser");

    // Config should still be saved
    expect(saveValueToConfigSpy).toHaveBeenCalled();
  });

  test("handles saveValueToConfig failure", async () => {
    saveValueToConfigSpy.mockRejectedValue(new Error("Config save failed"));

    let paymentPendingHook;
    mockBrokerClient.deploy.mockImplementation(async (config) => {
      paymentPendingHook = config.hooks.PAYMENT_PENDING;
      return {
        appUrl: "https://app.test",
        vendors: [{ token: "test-token" }],
      };
    });

    await deploy();

    // The hook should throw when config saving fails (expected behavior)
    await expect(
      paymentPendingHook({
        sessionId: "session-123",
        paymentUrl: "https://payment.test/session-123",
        isResuming: false,
      }),
    ).rejects.toThrow("Config save failed");
  });
});
