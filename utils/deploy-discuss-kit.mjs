import chalk from "chalk";
import { joinURL } from "ufo";
import { getComponentInfo, getComponentInfoWithMountPoint } from "./blocklet.mjs";
import { PAYMENT_KIT_DID } from "./constants.mjs";
import { saveValueToConfig } from "./utils.mjs";

// ==================== URL Configuration ====================
const BASE_URL = process.env.DOC_PAYMENT_BASE_URL || "";

// ==================== Timeout Configuration ====================
const TIMEOUT_CONFIG = {
  paymentWait: 60, // Step 2: Payment wait 5 minutes (60 * 5 seconds)
  installation: 60, // Step 3: Installation wait 5 minutes (60 * 5 seconds)
  serviceStart: 60, // Step 4: Service startup 5 minutes (60 * 5 seconds)
  intervalMs: 5000, // Polling interval 5 seconds
};

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
 * Deploy a new Discuss Kit service and return the installation URL
 * @returns {Promise<string>} - The URL of the deployed service
 */
export async function deployDiscussKit(id) {
  const { mountPoint, PAYMENT_LINK_ID_KEY } = await getComponentInfoWithMountPoint(
    BASE_URL,
    PAYMENT_KIT_DID,
  );
  prefix = mountPoint;
  paymentLinkId = PAYMENT_LINK_ID_KEY;
  // Step 1: Create payment link and open
  const cachedCheckoutId = await checkCacheCheckoutId(id);
  const checkoutId = cachedCheckoutId || (await createPaymentSession());
  const paymentUrl = joinURL(
    BASE_URL,
    prefix,
    API_ENDPOINTS.paymentPage.replace("{id}", checkoutId),
  );
  if (cachedCheckoutId !== checkoutId) {
    await openBrowser(paymentUrl);
  }

  // Step 2: Wait for payment completion
  console.log(`${chalk.blue("⏳")} Step 1/4: Waiting for payment...`);
  console.log(`${chalk.blue("🔗")} Payment link: ${chalk.cyan(paymentUrl)}\n`);
  await pollPaymentStatus(checkoutId);
  saveValueToConfig("checkoutId", checkoutId, "Checkout ID for document deployment service");

  // Step 3: Wait for service installation
  console.log(`${chalk.blue("📦")} Step 2/4: Installing service...`);
  const readyVendors = await waitInstallation(checkoutId);

  // Step 4: Wait for service startup
  console.log(`${chalk.blue("🚀")} Step 3/4: Starting service...`);
  const runningVendors = await waitServiceRunning(readyVendors);

  // Step 5: Get final URL
  console.log(`${chalk.blue("🌐")} Step 4/4: Getting service URL...`);
  const urlInfo = await getDashboardAndUrl(checkoutId, runningVendors);
  const { appUrl, homeUrl, token } = urlInfo || {};

  console.log(
    `\n${chalk.blue("🔗")} Your website is available at: ${chalk.cyan(homeUrl || appUrl)}\n`,
  );

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
    saveValueToConfig("checkoutId", "", "Checkout ID for document deployment service");
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
    return checkoutId;
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
  const maxAttempts = TIMEOUT_CONFIG.paymentWait; // 5 minute timeout (60 * 5 seconds)
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
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
    } catch (_error) {
      // If this is the last attempt, throw error
      if (attempts === maxAttempts) {
        throw new Error("Payment timeout - please complete payment within 5 minutes");
      }
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT_CONFIG.intervalMs));
  }

  throw new Error("Payment timeout");
}

/**
 * Wait for installation completion - Step 3
 */
async function waitInstallation(checkoutId) {
  const maxAttempts = TIMEOUT_CONFIG.installation; // 5 minute timeout (60 * 5 seconds)
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

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

    // Check if all vendors meet conditions: progress >= 80 and appUrl exists
    const isInstalled = data.vendors?.every((vendor) => vendor.progress >= 80 && vendor.appUrl);
    if (isInstalled) {
      return data.vendors;
    }

    // If this is the last attempt, throw error
    if (attempts === maxAttempts) {
      throw new Error("Installation timeout - services failed to install within 5 minutes");
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT_CONFIG.intervalMs));
  }

  throw new Error("Installation timeout");
}

/**
 * Wait for service to start running - Step 4
 */
async function waitServiceRunning(readyVendors) {
  const maxAttempts = TIMEOUT_CONFIG.serviceStart; // 5 minute timeout (60 * 5 seconds)
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    try {
      // Check running status of all vendors concurrently
      const vendorChecks = readyVendors.map(async (vendor) => {
        try {
          const blockletInfo = await getComponentInfo(vendor.appUrl);

          if (blockletInfo.status === "running") {
            return vendor;
          }
          return null;
        } catch (_error) {
          return null;
        }
      });

      const results = await Promise.all(vendorChecks);
      const runningVendors = results.filter((vendor) => vendor !== null);

      if (runningVendors.length === readyVendors.length) {
        return runningVendors;
      }
    } catch (_error) {
      // Continue retrying
    }

    // If this is the last attempt, throw error
    if (attempts === maxAttempts) {
      throw new Error("Service start timeout - services failed to start within 5 minutes");
    }

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT_CONFIG.intervalMs));
  }

  throw new Error("Service start timeout");
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

    // Wait 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Return the appUrl of the first vendor (usually only one)
    const appUrl = runningVendors[0]?.appUrl;
    if (!appUrl) {
      throw new Error("No app URL found in order details");
    }

    return {
      appUrl,
      dashboardUrl: data.vendors[0]?.dashboardUrl,
      homeUrl: data.vendors[0]?.homeUrl,
      token: data.vendors[0]?.token,
    };
  } catch (error) {
    console.error(`${chalk.red("❌")} Failed to get order details:`, error.message);
    // If getting details fails, use the appUrl of running vendor
    return {
      appUrl: runningVendors[0]?.appUrl || null,
      dashboardUrl: runningVendors[0]?.dashboardUrl || null,
      homeUrl: runningVendors[0]?.homeUrl || null,
      token: runningVendors[0]?.token || null,
    };
  }
}

export default deployDiscussKit;
