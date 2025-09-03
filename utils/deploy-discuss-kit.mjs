import chalk from "chalk";
import { joinURL } from "ufo";
import { getComponentInfoWithMountPoint, getComponentInfo } from "./blocklet.mjs";
import { PAYMENT_KIT_DID } from "./constants.mjs";
import { saveValueToConfig } from "./utils.mjs";

// ==================== 配置 URL ====================
const BASE_URL = process.env.DOC_PAYMENT_BASE_URL || "";

// ==================== 超时配置 ====================
const TIMEOUT_CONFIG = {
  paymentWait: 60,      // 步骤2: 支付等待 5分钟 (60 * 5秒)
  installation: 60,     // 步骤3: 安装等待 5分钟 (60 * 5秒)  
  serviceStart: 60,     // 步骤4: 服务启动 5分钟 (60 * 5秒)
  intervalMs: 5000,     // 轮询间隔 5秒
};

// ==================== API 端点 ====================
const API_ENDPOINTS = {
  createCheckout: `/api/checkout-sessions/start`,
  paymentPage: `/checkout/pay/{id}`,
  orderStatus: `/api/vendors/order/{id}/status`,
  orderDetail: `/api/vendors/order/{id}/detail`,
};

let prefix = ''
let paymentLinkId = ''
/**
 * Deploy a new Discuss Kit service and return the installation URL
 * @returns {Promise<string>} - The URL of the deployed service
 */
export async function deployDiscussKit(id) {
  const { mountPoint, PAYMENT_LINK_ID_KEY } = await getComponentInfoWithMountPoint(BASE_URL, PAYMENT_KIT_DID);
  prefix = mountPoint;
  paymentLinkId = PAYMENT_LINK_ID_KEY;
  
  try {
    // 步骤1: 创建支付链接并打开
    const cachedCheckoutId = await checkCacheCheckoutId(id);
    const checkoutId = cachedCheckoutId || await createPaymentSession();
    const paymentUrl = joinURL(BASE_URL, prefix, API_ENDPOINTS.paymentPage.replace('{id}', checkoutId));
    if (cachedCheckoutId !== checkoutId) {
      await openBrowser(paymentUrl);
    }

    // 步骤2: 等待支付完成
    console.log(`${chalk.blue("⏳")} Step 1/4: Waiting for payment...`);
    console.log(`${chalk.blue("🔗")} Payment link: ${chalk.cyan(paymentUrl)}\n`);
    await pollPaymentStatus(checkoutId);
    saveValueToConfig('checkoutId', checkoutId, 'Checkout ID for document deployment service');

    // 步骤3: 等待服务安装
    console.log(`${chalk.blue("📦")} Step 2/4: Installing service...`);
    const readyVendors = await waitInstallation(checkoutId);
    
    // 步骤4: 等待服务启动
    console.log(`${chalk.blue("🚀")} Step 3/4: Starting service...`);
    const runningVendors = await waitServiceRunning(readyVendors);
    
    // 步骤5: 获取最终URL
    console.log(`${chalk.blue("🌐")} Step 4/4: Getting service URL...`);
    const urlInfo = await getDashboardAndUrl(checkoutId, runningVendors);
    const { appUrl, homeUrl, token } = urlInfo || {};

    console.log(`\n${chalk.blue("🔗")} Your website is available at: ${chalk.cyan(homeUrl || appUrl)}\n`);
    
    return {
      appUrl,
      homeUrl,
      token,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 检查是否有缓存 checkoutId
 */
async function checkCacheCheckoutId(checkoutId) {
  try {
    if (!checkoutId) {
      return '';
    }
    
    const orderStatusUrl = joinURL(BASE_URL, prefix, API_ENDPOINTS.orderStatus.replace('{id}', checkoutId));
    const response = await fetch(orderStatusUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }
    
    // 检查支付状态和 vendors 状态
    const isPaid = data.payment_status === 'paid';

    return isPaid ? checkoutId : '';
    
  } catch (error) {
    saveValueToConfig('checkoutId', '', 'Checkout ID for document deployment service');
    return '';
  }
}



/**
 * 创建支付链接 - 步骤1
 */
async function createPaymentSession() {
  // 1. 调用支付 API
  if (!paymentLinkId) {
    throw new Error("Payment link ID not found");
  }

  const createCheckoutId = joinURL(BASE_URL, prefix, API_ENDPOINTS.createCheckout, paymentLinkId);
  try {
    const response = await fetch(createCheckoutId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const checkoutId = data.checkoutSession.id;
    return  checkoutId;
  } catch (error) {
    console.error(`${chalk.red("❌")} Failed to create payment session:`, error.message, createCheckoutId);
    throw new Error(`Failed to create payment session: ${error.message}`);
  }
}

/**
 * 打开浏览器
 */
async function openBrowser(paymentUrl) {
  const { default: open } = await import('open');
  try {
    await open(paymentUrl);
  } catch (error) {
    console.log(`${chalk.yellow("⚠️  Could not open browser automatically.")}`);
    console.log(`${chalk.blue("Please manually open this URL:")} ${chalk.cyan(paymentUrl)}`);
  }
}

/**
 * 等待支付完成 - 步骤2 (5分钟超时)
 */
async function pollPaymentStatus(checkoutId) {
  const maxAttempts = TIMEOUT_CONFIG.paymentWait; // 5分钟超时 (60 * 5秒)
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      const orderStatusUrl = joinURL(BASE_URL, prefix, API_ENDPOINTS.orderStatus.replace('{id}', checkoutId));
      const response = await fetch(orderStatusUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }
      
      // 检查支付状态和 vendors 状态
      const isPaid = data.payment_status === 'paid';
      if (isPaid) {
        return data.vendors;
      }
      
    } catch (error) {
      // 如果是最后一次尝试，抛出错误
      if (attempts === maxAttempts) {
        throw new Error("Payment timeout - please complete payment within 5 minutes");
      }
    }
    
    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, TIMEOUT_CONFIG.intervalMs));
  }
  
  throw new Error("Payment timeout");
}

/**
 * 等待安装完成 - 步骤3
 */
async function waitInstallation(checkoutId) {
  const maxAttempts = TIMEOUT_CONFIG.installation; // 5分钟超时 (60 * 5秒)
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;

    const orderStatusUrl = joinURL(BASE_URL, prefix, API_ENDPOINTS.orderStatus.replace('{id}', checkoutId));
    const response = await fetch(orderStatusUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }
    
    // 检查所有 vendor 是否满足条件：progress >= 80 且 appUrl 存在
    const isInstalled = data.vendors?.every(vendor => vendor.progress >= 80 && vendor.appUrl);
    if (isInstalled) {
      return data.vendors;
    }
      
    // 如果是最后一次尝试，抛出错误
    if (attempts === maxAttempts) {
      throw new Error("Installation timeout - services failed to install within 5 minutes");
    }
    
    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, TIMEOUT_CONFIG.intervalMs));
  }
  
  throw new Error("Installation timeout");
}

/**
 * 等待服务运行 - 步骤4
 */
async function waitServiceRunning(readyVendors) {
  const maxAttempts = TIMEOUT_CONFIG.serviceStart; // 5分钟超时 (60 * 5秒)
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      // 并发检查所有 vendor 的运行状态
      const vendorChecks = readyVendors.map(async (vendor) => {
        try {
          const blockletInfo = await getComponentInfo(vendor.appUrl);
          
          if (blockletInfo.status === 'running') {
            return vendor;
          }
          return null;
        } catch (error) {
          return null;
        }
      });
      
      const results = await Promise.all(vendorChecks);
      const runningVendors = results.filter(vendor => vendor !== null);
      
      if (runningVendors.length === readyVendors.length) {
        return runningVendors;
      }
      
    } catch (error) {
      // 继续重试
    }
    
    // 如果是最后一次尝试，抛出错误
    if (attempts === maxAttempts) {
      throw new Error("Service start timeout - services failed to start within 5 minutes");
    }
    
    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, TIMEOUT_CONFIG.intervalMs));
  }
  
  throw new Error("Service start timeout");
}





/**
 * 获取最终URL - 步骤5
 */
async function getDashboardAndUrl(checkoutId, runningVendors) {
  try {
    // 5. 获取订单详情
    const orderDetailUrl = joinURL(BASE_URL, prefix, API_ENDPOINTS.orderDetail.replace('{id}', checkoutId));
    const response = await fetch(orderDetailUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.vendors.length === 0) {
      throw new Error("No vendors found in order details");
    }

    // 延时 3 秒
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 返回第一个 vendor 的 appUrl（通常只有一个）
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
    // 如果获取详情失败，使用运行中的 vendor 的 appUrl
    return {
      appUrl: runningVendors[0]?.appUrl || null,
      dashboardUrl: runningVendors[0]?.dashboardUrl || null,
      homeUrl: runningVendors[0]?.homeUrl || null,
      token: runningVendors[0]?.token || null,
    };
  }
}

export default deployDiscussKit;
