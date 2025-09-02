import chalk from "chalk";
import { joinURL } from "ufo";

// ==================== 配置 URL ====================
const BASE_URL = process.env.DOC_PAYMENT_BASE_URL || "";
const PAYMENT_LINK_ID = process.env.DOC_PAYMENT_LINK_ID || "";

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
  blockletStatus: `/__blocklet__.js?type=json`,
};

/**
 * Deploy a new Discuss Kit service and return the installation URL
 * @param {Object} options - Options object with prompts
 * @returns {Promise<string>} - The URL of the deployed service
 */
export async function deployDiscussKit(options) {
  console.log(`Creating a new Discuss Kit service for your documentation...\n`);

  const serviceName = "my-discuss-kit"; // 固定名称

  try {
    // 步骤1: 创建支付链接并打开
    const { paymentUrl, checkoutId } = await createPaymentSession(serviceName);
    await openBrowser(paymentUrl);

    // 步骤2: 等待支付完成
    console.log(`${chalk.blue("⏳")} Step 1: Waiting for payment...`);
    console.log(`${chalk.blue("🔗")} Payment link: ${chalk.cyan(paymentUrl)}\n`);
    const vendors = await pollPaymentStatus(checkoutId);

    // 步骤3: 等待服务安装
    console.log(`${chalk.blue("📦")} Step 2: Installing service...`);
    const readyVendors = await waitInstallation(vendors);
    
    // 步骤4: 等待服务启动
    console.log(`${chalk.blue("🔍")} Step 3: Starting service...`);
    const runningVendors = await waitServiceRunning(readyVendors);
    
    // 步骤5: 获取最终URL
    console.log(`${chalk.blue("🌐")} Step 4: Getting service URL...`);
    const urlInfo = await getDashboardAndUrl(checkoutId, runningVendors);
    const { appUrl, homeUrl } = urlInfo || {};

    console.log(`Your service is available at: ${chalk.cyan(homeUrl)}\n`);
    
    return appUrl;
    
  } catch (error) {
    throw error;
  }
}


/**
 * 创建支付链接 - 步骤1
 */
async function createPaymentSession(serviceName) {
  // 1. 调用支付 API
  const createCheckoutUrl = joinURL(BASE_URL, API_ENDPOINTS.createCheckout, PAYMENT_LINK_ID);
  try {
    const response = await fetch(createCheckoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ livemode: true, metadata: {
        page_info: {
          form_purpose_description: {
            en: 'After successful payment, we will automatically install the Discuss Kit service for you.',
            zh: '支付成功后，我们会自动为您安装 Discuss Kit 服务。',
          },
        },
      }})
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const checkoutId = data.checkoutSession.id;
    
    // 2. 返回支付页面链接
    const paymentUrl = joinURL(BASE_URL, API_ENDPOINTS.paymentPage.replace('{id}', checkoutId));
    return { paymentUrl, checkoutId };
    
  } catch (error) {
    console.error(`${chalk.red("❌")} Failed to create payment session:`, error.message, createCheckoutUrl);
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
      const orderStatusUrl = joinURL(BASE_URL, API_ENDPOINTS.orderStatus.replace('{id}', checkoutId));
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
async function waitInstallation(vendors) {
  const maxAttempts = TIMEOUT_CONFIG.installation; // 5分钟超时 (60 * 5秒)
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // 检查所有 vendor 是否满足条件：progress >= 80 且 appUrl 存在
    const readyVendors = vendors.filter(vendor => 
      vendor.progress >= 80 && vendor.appUrl
    );
    
    if (readyVendors.length === vendors.length) {
      return readyVendors;
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
          const statusEndpoint = joinURL(vendor.appUrl, API_ENDPOINTS.blockletStatus);
          const response = await fetch(statusEndpoint);
          
          if (response.ok) {
            const data = await response.json();
            return data.status === 'running' ? vendor : null;
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
    const orderDetailUrl = joinURL(BASE_URL, API_ENDPOINTS.orderDetail.replace('{id}', checkoutId));
    const response = await fetch(orderDetailUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    // 打开所有 vendor 的 dashboard
    for (const vendor of data.vendors) {
      if (vendor.dashboardUrl) {
        try {
          await openBrowser(vendor.dashboardUrl);
        } catch (error) {
          // 静默处理，不打印错误
        }
      }
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
      dashboardUrl: runningVendors[0]?.dashboardUrl,
      homeUrl: runningVendors[0]?.homeUrl,
    };
    
  } catch (error) {
    console.error(`${chalk.red("❌")} Failed to get order details:`, error.message);
    // 如果获取详情失败，使用运行中的 vendor 的 appUrl
    return {
      appUrl: runningVendors[0]?.appUrl || null,
      dashboardUrl: runningVendors[0]?.dashboardUrl || null,
      homeUrl: runningVendors[0]?.homeUrl || null,
    };
  }
}

export default deployDiscussKit;
