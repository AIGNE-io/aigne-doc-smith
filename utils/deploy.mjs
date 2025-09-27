import chalk from "chalk";
import Debug from "debug";
import { joinURL } from "ufo";

import pkg from "../package.json" with { type: "json" };
import { getComponentInfo, getComponentInfoWithMountPoint } from "./blocklet.mjs";
import { PAYMENT_KIT_DID } from "./constants/index.mjs";
import { saveValueToConfig } from "./utils.mjs";

const debug = Debug(`${pkg.name}:deploy`);

// ==================== URL Configuration ====================
const BASE_URL = process.env.DOC_SMITH_BASE_URL || "";

// ==================== Timeout Configuration ====================
const INTERVAL_MS = 3000; // 3 seconds between each check
const TIMEOUTS = {
  paymentWait: 300, // Step 2: Payment wait timeout (5 minutes)
  installation: 300, // Step 3: Installation timeout (5 minutes)
  serviceStart: 300, // Step 4: Website startup timeout (5 minutes)
};

// ==================== Utility Functions ====================

/**
 * Generic polling utility with timeout and retry logic
 * @param {Object} options - Polling configuration
 * @param {Function} options.checkCondition - Async function that returns result if condition met, null/false if not
 * @param {number} options.maxAttempts - Maximum number of attempts
 * @param {number} options.intervalMs - Interval between attempts in milliseconds
 * @param {string} options.timeoutMessage - Error message for timeout
 * @param {string} options.stepName - Name of the step for logging (optional)
 * @returns {Promise<any>} Result from checkCondition when successful
 */
async function pollWithTimeout({
  checkCondition,
  maxAttempts,
  intervalMs = INTERVAL_MS,
  timeoutMessage,
  stepName = "Operation",
}) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      const result = await checkCondition();
      if (result !== null && result !== false) {
        return result;
      }
    } catch (_error) {
      // Log error for debugging but continue retrying unless it's the last attempt
      if (attempts === maxAttempts) {
        throw new Error(`${timeoutMessage} (${stepName} failed after ${maxAttempts} attempts)`);
      }
      // Continue retrying for non-fatal errors
    }

    // If this is the last attempt, don't wait - just exit the loop
    if (attempts === maxAttempts) {
      break;
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // If we reach here, all attempts were exhausted
  throw new Error(`${timeoutMessage} (${stepName} timed out after ${maxAttempts} attempts)`);
}

// ==================== API Endpoints ====================
const API_ENDPOINTS = {
  createCheckout: `/api/checkout-sessions/start`,
  paymentPage: `/checkout/pay/{id}`,
  orderStatus: `/api/vendors/order/{id}/status`,
  orderDetail: `/api/vendors/order/{id}/detail`,
};

let prefix = "";
let paymentLinkId = "";
/**
 * Deploy a new Discuss Kit Website and return the installation URL
 * @returns {Promise<string>} - The URL of the deployed Website
 */
export async function deploy(id, cachedUrl) {
  const { mountPoint, PAYMENT_LINK_ID } = await getComponentInfoWithMountPoint(
    BASE_URL,
    PAYMENT_KIT_DID,
  );
  prefix = mountPoint;
  paymentLinkId = PAYMENT_LINK_ID;

  if (!PAYMENT_LINK_ID) {
    const { PAYMENT_LINK_ID: id } = await getComponentInfoWithMountPoint(
      joinURL(BASE_URL, mountPoint),
      PAYMENT_KIT_DID,
    );
    paymentLinkId = id;
  }

  // Step 1: Create payment link and open
  const cachedCheckoutId = await checkCacheCheckoutId(id);
  let checkoutId = cachedCheckoutId;
  let paymentUrl = cachedUrl;
  if (!cachedCheckoutId) {
    const { checkoutId: newCheckoutId, paymentUrl: newPaymentUrl } = await createPaymentSession();
    checkoutId = newCheckoutId;
    paymentUrl = newPaymentUrl;
  }

  if (!paymentUrl) {
    paymentUrl = joinURL(BASE_URL, prefix, API_ENDPOINTS.paymentPage.replace("{id}", checkoutId));
  }
  if (cachedCheckoutId !== checkoutId) {
    await openBrowser(paymentUrl);
  }

  // Step 2: Wait for payment completion
  console.log(`⏳ Step 1/4: Waiting for payment...`);
  console.log(`🔗 Payment link: ${chalk.cyan(paymentUrl)}\n`);
  await pollPaymentStatus(checkoutId);
  await saveValueToConfig("checkoutId", checkoutId, "Checkout ID for document deployment website");
  await saveValueToConfig("paymentUrl", paymentUrl, "Payment URL for document deployment website");

  // Step 3: Wait for website installation
  console.log(`📦 Step 2/4: Installing Website...`);
  const readyVendors = await waitInstallation(checkoutId);

  // Step 4: Wait for website startup
  console.log(`🚀 Step 3/4: Starting Website...`);
  const runningVendors = await waitWebsiteRunning(readyVendors);

  // Step 5: Get final URL
  console.log(`🌐 Step 4/4: Getting Website URL...`);
  const urlInfo = await getDashboardAndUrl(checkoutId, runningVendors);
  const { appUrl, homeUrl, token, subscriptionUrl } = urlInfo || {};

  console.log(`\n🔗 Your website is available at: ${chalk.cyan(homeUrl || appUrl)}`);

  if (subscriptionUrl) {
    console.log(`🔗 Your subscription management URL: ${chalk.cyan(subscriptionUrl)}\n`);
  } else {
    // just log one space line
    console.log("");
  }

  return {
    appUrl,
    homeUrl,
    token,
  };
}

/**
 * Check if there is a cached checkoutId
 */
async function checkCacheCheckoutId(checkoutId) {
  try {
    if (!checkoutId) {
      return "";
    }

    const orderStatusUrl = joinURL(
      BASE_URL,
      prefix,
      API_ENDPOINTS.orderStatus.replace("{id}", checkoutId),
    );
    const response = await fetch(orderStatusUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Check payment status and vendors status
    const isPaid = data.payment_status === "paid";

    return isPaid ? checkoutId : "";
  } catch (_error) {
    await saveValueToConfig("checkoutId", "", "Checkout ID for document deployment website");
    return "";
  }
}

/**
 * Create payment session - Step 1
 */
async function createPaymentSession() {
  // 1. Call payment API
  if (!paymentLinkId) {
    throw new Error("Payment link ID not found");
  }

  const createCheckoutId = joinURL(BASE_URL, prefix, API_ENDPOINTS.createCheckout, paymentLinkId);
  try {
    const response = await fetch(createCheckoutId, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        needShortUrl: true,
        metadata: {
          page_info: {
            has_vendor: true,
            success_message: {
              en: "Congratulations! Your website has been successfully installed. You can return to the command-line tool to continue the next steps.",
              zh: "恭喜您，你的网站已安装成功！可以返回命令行工具继续后续操作！",
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const checkoutId = data.checkoutSession.id;
    const paymentUrl = data.paymentUrl;

    return { checkoutId, paymentUrl };
  } catch (error) {
    console.error(
      `${chalk.red("❌")} Failed to create payment session:`,
      error.message,
      createCheckoutId,
    );
    throw new Error(`Failed to create payment session: ${error.message}`);
  }
}

/**
 * Open browser with payment URL
 */
async function openBrowser(paymentUrl) {
  const { default: open } = await import("open");
  try {
    await open(paymentUrl);
  } catch (_error) {
    console.log(`${chalk.yellow("⚠️  Could not open browser automatically.")}`);
    console.log(`${chalk.blue("Please manually open this URL:")} ${chalk.cyan(paymentUrl)}`);
  }
}

/**
 * Wait for payment completion - Step 2 (5 minute timeout)
 */
async function pollPaymentStatus(checkoutId) {
  return pollWithTimeout({
    checkCondition: async () => {
      const orderStatusUrl = joinURL(
        BASE_URL,
        prefix,
        API_ENDPOINTS.orderStatus.replace("{id}", checkoutId),
      );
      const response = await fetch(orderStatusUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Check payment status and vendors status
      const isPaid = data.payment_status === "paid";
      if (isPaid) {
        return data.vendors;
      }

      return null; // Not ready yet, continue polling
    },
    maxAttempts: Math.ceil((TIMEOUTS.paymentWait * 1000) / INTERVAL_MS),
    intervalMs: INTERVAL_MS,
    timeoutMessage: "Payment timeout - please complete payment within 5 minutes",
    stepName: "Payment",
  });
}

/**
 * Wait for installation completion - Step 3
 */
async function waitInstallation(checkoutId) {
  return pollWithTimeout({
    checkCondition: async () => {
      const orderStatusUrl = joinURL(
        BASE_URL,
        prefix,
        API_ENDPOINTS.orderStatus.replace("{id}", checkoutId),
      );

      debug("waitInstallation", orderStatusUrl);

      const response = await fetch(orderStatusUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      debug("waitInstallation response:", response.status, response.statusText);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Check if all vendors meet conditions: progress >= 80 and appUrl exists
      const isCompleted = data.vendors?.every((vendor) => vendor.progress >= 80);

      if (isCompleted) {
        return data.vendors;
      }

      return null; // Not ready yet, continue polling
    },
    maxAttempts: Math.ceil((TIMEOUTS.installation * 1000) / INTERVAL_MS),
    intervalMs: INTERVAL_MS,
    timeoutMessage: "Installation timeout - website failed to install within 5 minutes",
    stepName: "Installation",
  });
}

/**
 * Wait for Website to start running - Step 4
 */
async function waitWebsiteRunning(readyVendors) {
  return pollWithTimeout({
    checkCondition: async () => {
      // Check running status of all vendors concurrently
      const vendorChecks = readyVendors.map(async (vendor) => {
        try {
          // Using appUrl is not ideal, but it allows direct verification of DNS propagation and instance accessibility from the client side
          if (!vendor.appUrl) {
            return vendor;
          }

          const blockletInfo = await getComponentInfo(vendor.appUrl);

          if (blockletInfo.status === "running") {
            return vendor;
          }
          return null;
        } catch (error) {
          debug("waitWebsiteRunning error:", error);
          return null;
        }
      });

      const results = await Promise.all(vendorChecks);
      const runningVendors = results.filter((vendor) => vendor !== null);

      if (runningVendors.length === readyVendors.length) {
        return runningVendors;
      }

      return null; // Not ready yet, continue polling
    },
    maxAttempts: Math.ceil((TIMEOUTS.serviceStart * 1000) / INTERVAL_MS),
    intervalMs: INTERVAL_MS,
    timeoutMessage: "Website start timeout - website failed to start within 5 minutes",
    stepName: "Website Start",
  });
}

/**
 * Get final URL - Step 5
 */
async function getDashboardAndUrl(checkoutId, runningVendors) {
  try {
    // 5. Get order details
    const orderDetailUrl = joinURL(
      BASE_URL,
      prefix,
      API_ENDPOINTS.orderDetail.replace("{id}", checkoutId),
    );
    const response = await fetch(orderDetailUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.vendors.length === 0) {
      throw new Error("No vendors found in order details");
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const appUrl = runningVendors.find((vendor) => vendor.appUrl)?.appUrl;
    debug("getDashboardAndUrl:", appUrl);

    if (!appUrl) {
      throw new Error("No app URL found in order details");
    }

    const availableVendor = data.vendors.find((vendor) => vendor.dashboardUrl);

    return {
      appUrl,
      subscriptionUrl: data.subscriptionUrl,
      dashboardUrl: availableVendor?.dashboardUrl,
      homeUrl: availableVendor?.homeUrl,
      token: availableVendor?.token,
    };
  } catch (error) {
    console.error(`${chalk.red("❌")} Failed to get order details:`, error.message);
    // If getting details fails, use the appUrl of running vendor
    const fallbackVendor = runningVendors.find((vendor) => vendor.appUrl);

    return {
      appUrl: fallbackVendor?.appUrl || null,
      dashboardUrl: fallbackVendor?.dashboardUrl || null,
      homeUrl: fallbackVendor?.homeUrl || null,
      token: fallbackVendor?.token || null,
    };
  }
}

export default deploy;
