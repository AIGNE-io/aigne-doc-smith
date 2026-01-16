import { BrokerClient, STEPS } from "@blocklet/payment-broker-client/node";
import chalk from "chalk";
import open from "open";
import { getOfficialAccessToken } from "./auth.mjs";
import { CLOUD_SERVICE_URL_PROD } from "./constants.mjs";
import { saveValueToConfig } from "./config.mjs";

const BASE_URL = process.env.DOC_SMITH_BASE_URL || CLOUD_SERVICE_URL_PROD;
const SUCCESS_MESSAGE = {
  en: "Congratulations! Your website has been successfully installed. You can now return to the command-line tool to continue.",
  zh: "恭喜您，你的网站已安装成功！可以返回命令行工具继续后续操作！",
};

/**
 * Deploys a new Discuss Kit Website and returns the installation URL.
 * @param {string} id - The cached checkout ID (optional).
 * @param {string} locale - preferred locale
 * @returns {Promise<Object>} The deployment result with URLs.
 */
export async function deploy(id, locale) {
  const authToken = await getOfficialAccessToken(BASE_URL, true, locale);

  if (!authToken) {
    throw new Error("Could not get an official access token.");
  }

  const client = new BrokerClient({ baseUrl: BASE_URL, authToken });

  console.log(`🚀 Starting deployment...`);

  const result = await client.deploy({
    cachedCheckoutId: id,
    needShortUrl: true,
    pageInfo: { successMessage: SUCCESS_MESSAGE },
    hooks: {
      [STEPS.PAYMENT_PENDING]: async ({ sessionId, paymentUrl, isResuming }) => {
        console.log(`⏳ Step 1/4: Waiting for payment...`);
        console.log(`🔗 Payment link: ${chalk.cyan(paymentUrl)}\n`);

        await saveValueToConfig(
          "checkoutId",
          sessionId,
          "Checkout ID for document deployment website",
        );

        if (!isResuming) {
          await open(paymentUrl);
        }
      },

      [STEPS.INSTALLATION_STARTING]: () => {
        console.log(`📦 Step 2/4: Installing the website...`);
      },

      [STEPS.SERVICE_STARTING]: () => {
        console.log(`🚀 Step 3/4: Starting the website...`);
      },

      [STEPS.ACCESS_PREPARING]: () => {
        console.log(`🌐 Step 4/4: Getting the website URL...`);
      },

      [STEPS.ACCESS_READY]: async ({ appUrl, homeUrl, subscriptionUrl }) => {
        console.log(`\n🔗 Your website is available at: ${chalk.cyan(homeUrl || appUrl)}`);
        if (subscriptionUrl) {
          console.log(`🔗 Your subscription management URL: ${chalk.cyan(subscriptionUrl)}\n`);
        } else {
          console.log("");
        }
      },
    },
  });

  const { appUrl, homeUrl, subscriptionUrl, dashboardUrl, vendors, sessionId, data } = result;
  const token = vendors?.[0]?.token;

  return {
    appUrl,
    homeUrl,
    dashboardUrl,
    subscriptionUrl,
    token,
    sessionId,
    data,
  };
}
