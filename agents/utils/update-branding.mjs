import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import { joinURL } from "ufo";
import { getBlockletMetaDid } from "../../utils/blocklet.mjs";
import { DOC_SMITH_DIR } from "../../utils/constants/index.mjs";
import { requestWithAuthToken } from "../../utils/request.mjs";
import { uploadFiles } from "../../utils/upload-files.mjs";

export default async function updateBranding({ appUrl, projectInfo, accessToken }) {
  try {
    const res = await requestWithAuthToken(
      joinURL(appUrl, "/api/branding"),
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
          const blockletDID = await getBlockletMetaDid(appUrl);
          const url = new URL(appUrl);

          // Upload to blocklet logo endpoint
          await uploadFiles({
            appUrl,
            filePaths: [projectLogoPath],
            accessToken,
            concurrency: 1,
            endpoint: `${url.origin}/.well-known/service/blocklet/logo/upload/square/${blockletDID}`,
          });
        }
      } catch (error) {
        console.warn(`Just failed to update logo: ${error.message}`);
      }
    } else {
      console.warn(`Failed to update branding: ${res.error}`);
    }
  } catch (error) {
    console.warn(`Failed to update branding: ${error.message}`);
  }
}
