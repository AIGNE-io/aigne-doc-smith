import { stat } from "node:fs/promises";
import chalk from "chalk";
import { joinURL } from "ufo";

import { getComponentInfoWithMountPoint, requestWithAuthToken } from "./http.mjs";
import {
  CLOUD_SERVICE_URL_PROD,
  CLOUD_SERVICE_URL_STAGING,
  DISCUSS_KIT_DID,
} from "./constants.mjs";
import { uploadFiles } from "./upload.mjs";

export default async function updateBranding({ appUrl, projectInfo, accessToken, finalPath }) {
  try {
    const origin = new URL(appUrl).origin;
    if ([CLOUD_SERVICE_URL_PROD, CLOUD_SERVICE_URL_STAGING].includes(origin)) {
      console.log("ℹ️ Skipped updating branding for official service\n");
      return;
    }

    console.log(`🔄 Updating branding for ${chalk.cyan(origin)}`);

    // Get component information and mount point
    const componentInfo = await getComponentInfoWithMountPoint(origin, DISCUSS_KIT_DID);
    const mountPoint = componentInfo.mountPoint || "/";

    if (projectInfo.name.length > 40) {
      console.warn(
        `⚠️ Name is too long, it should be less than 40 characters\nWill be truncated to 40 characters`,
      );
    }

    if (projectInfo.description.length > 160) {
      console.warn(
        `⚠️ Description is too long, it should be less than 160 characters\nWill be truncated to 160 characters`,
      );
    }

    const res = await requestWithAuthToken(
      joinURL(origin, mountPoint, "/api/branding"),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: projectInfo.name.slice(0, 40),
          appDescription: projectInfo.description.slice(0, 160),
        }),
      },
      accessToken,
    );

    if (res.success) {
      if (!finalPath) {
        console.warn("\n🔄 Skipped updating branding for missing logo file\n");
        return;
      }

      try {
        const projectLogoStat = await stat(finalPath);

        if (projectLogoStat.isFile()) {
          // Upload to blocklet logo endpoint
          await uploadFiles({
            appUrl: origin,
            filePaths: [finalPath],
            accessToken,
            concurrency: 1,
            endpoint: `${origin}/.well-known/service/blocklet/logo/upload/square/${componentInfo.did}`,
          });
        }
        console.log("✅ Branding has been successfully updated\n");
      } catch (error) {
        console.warn(`⚠️ Just failed to update logo: ${error.message}\n`);
      }
    } else {
      console.warn(`⚠️ Failed to update branding: ${res.error}\n`);
    }
  } catch (error) {
    console.warn(`⚠️ Failed to update branding: ${error.message}\n`);
  }
}
