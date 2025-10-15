import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import chalk from "chalk";
import { joinURL } from "ufo";

import { getComponentInfoWithMountPoint } from "../../utils/blocklet.mjs";
import {
  CLOUD_SERVICE_URL_PROD,
  CLOUD_SERVICE_URL_STAGING,
  DISCUSS_KIT_DID,
  DOC_SMITH_DIR,
} from "../../utils/constants/index.mjs";
import { requestWithAuthToken } from "../../utils/request.mjs";
import { uploadFiles } from "../../utils/upload-files.mjs";

export default async function updateBranding({ appUrl, projectInfo, accessToken }) {
  try {
    const origin = new URL(appUrl).origin;
    if ([CLOUD_SERVICE_URL_PROD, CLOUD_SERVICE_URL_STAGING].includes(origin)) {
      console.log("Skipped updating branding for official service\n");
      return;
    }

    console.log(`🔄 Updating branding for ${chalk.cyan(origin)}`);

    const componentInfo = await getComponentInfoWithMountPoint(origin, DISCUSS_KIT_DID);
    const mountPoint = componentInfo.mountPoint || "/";

    const res = await requestWithAuthToken(
      joinURL(origin, mountPoint, "/api/branding"),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appName: projectInfo.name,
          appDescription: projectInfo.description,
        }),
      },
      accessToken,
    );

    if (res.success) {
      try {
        const projectLogoPath = resolve(process.cwd(), DOC_SMITH_DIR, projectInfo.icon);
        const projectLogoStat = await stat(projectLogoPath);

        if (projectLogoStat.isFile()) {
          // Upload to blocklet logo endpoint
          await uploadFiles({
            appUrl: origin,
            filePaths: [projectLogoPath],
            accessToken,
            concurrency: 1,
            endpoint: `${origin}/.well-known/service/blocklet/logo/upload/square/${componentInfo.did}`,
          });
        }
        console.log("✅ Updated branding successfully!\n");
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
