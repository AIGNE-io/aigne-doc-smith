import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import pLimit from "p-limit";
import pRetry from "p-retry";

import { getComponentMountPoint } from "./http.mjs";
import { DISCUSS_KIT_DID, MEDIA_KIT_DID } from "./constants.mjs";
import { getMimeType } from "./files.mjs";

/**
 * Perform single file upload
 */
async function performSingleUpload(filePath, fileHash, uploadEndpoint, accessToken, url) {
  const baseFilename = path.basename(filePath, path.extname(filePath));
  const fileBuffer = fs.readFileSync(filePath);
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  const fileExt = path.extname(filePath).substring(1);
  const mimeType = getMimeType(filePath);

  const hashBasedFilename = `${fileHash.substring(0, 16)}.${fileExt}`;

  const uploaderId = "Uploader";
  const fileId = `${uploaderId}-${baseFilename.toLowerCase().replace(/[^a-z0-9]/g, "")}-${fileHash.substring(0, 16)}`;

  const tusMetadata = {
    uploaderId,
    relativePath: hashBasedFilename,
    name: hashBasedFilename,
    type: mimeType,
    filetype: mimeType,
    filename: hashBasedFilename,
  };

  const encodedMetadata = Object.entries(tusMetadata)
    .map(([key, value]) => `${key} ${Buffer.from(value).toString("base64")}`)
    .join(",");

  const uploadEndpointUrl = new URL(uploadEndpoint);
  const endpointPath = uploadEndpointUrl.pathname;

  // Create upload
  const createResponse = await fetch(uploadEndpoint, {
    method: "POST",
    headers: {
      "Tus-Resumable": "1.0.0",
      "Upload-Length": fileSize.toString(),
      "Upload-Metadata": encodedMetadata,
      Cookie: `login_token=${accessToken}`,
      "x-uploader-file-name": hashBasedFilename,
      "x-uploader-file-id": fileId,
      "x-uploader-file-ext": fileExt,
      "x-uploader-base-url": endpointPath,
      "x-uploader-endpoint-url": uploadEndpoint,
      "x-uploader-metadata": JSON.stringify({
        uploaderId,
        relativePath: hashBasedFilename,
        name: hashBasedFilename,
        type: mimeType,
      }),
      "x-component-did": DISCUSS_KIT_DID,
    },
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(
      `Failed to create upload: ${createResponse.status} ${createResponse.statusText}\n${errorText}`,
    );
  }

  const uploadUrl = createResponse.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("No upload URL received from server");
  }

  // Upload file content
  const uploadResponse = await fetch(`${url.origin}${uploadUrl}`, {
    method: "PATCH",
    headers: {
      "Tus-Resumable": "1.0.0",
      "Upload-Offset": "0",
      "Content-Type": "application/offset+octet-stream",
      Cookie: `login_token=${accessToken}`,
      "x-uploader-file-name": hashBasedFilename,
      "x-uploader-file-id": fileId,
      "x-uploader-file-ext": fileExt,
      "x-uploader-base-url": endpointPath,
      "x-uploader-endpoint-url": uploadEndpoint,
      "x-uploader-metadata": JSON.stringify({
        uploaderId,
        relativePath: hashBasedFilename,
        name: hashBasedFilename,
        type: mimeType,
      }),
      "x-component-did": DISCUSS_KIT_DID,
      "x-uploader-file-exist": "true",
    },
    body: fileBuffer,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(
      `Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}\n${errorText}`,
    );
  }

  const uploadResult = await uploadResponse.json();

  let uploadedFileUrl = uploadResult.url;
  if (!uploadedFileUrl && uploadResult?.size) {
    uploadedFileUrl = uploadResponse.url;
  }

  if (!uploadedFileUrl) {
    throw new Error("No URL found in the upload response");
  }

  return {
    filePath,
    url: uploadedFileUrl,
  };
}

/**
 * Upload multiple files with concurrency control
 * @param {Object} options - Upload options
 * @param {string} options.appUrl - Application URL
 * @param {string[]} options.filePaths - Array of file paths to upload
 * @param {string} options.accessToken - Access token for authentication
 * @param {number} [options.concurrency=3] - Number of concurrent uploads
 * @param {string} [options.endpoint] - Custom upload endpoint
 * @returns {Promise<{results: Array<{filePath: string, url: string}>}>}
 */
export async function uploadFiles(options) {
  const { appUrl, filePaths, endpoint, concurrency = 3, accessToken } = options;

  if (filePaths.length === 0) {
    return { results: [] };
  }

  const url = new URL(appUrl);
  const mountPoint = await getComponentMountPoint(appUrl, MEDIA_KIT_DID);

  // Use custom endpoint or default to discuss kit media endpoint
  const uploadEndpoint = endpoint || `${url.origin}${mountPoint}/api/uploads`;

  const limit = pLimit(concurrency);
  const ongoingUploads = new Map();

  const uploadPromises = filePaths.map((filePath) =>
    limit(async () => {
      const filename = path.basename(filePath);

      try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        // Check if this file is already being uploaded
        const existingUpload = ongoingUploads.get(fileHash);
        if (existingUpload) {
          const result = await existingUpload;
          return {
            filePath,
            url: result.url,
          };
        }

        // Create upload promise and cache it
        const uploadPromise = (async () => {
          try {
            const result = await pRetry(
              () => performSingleUpload(filePath, fileHash, uploadEndpoint, accessToken, url),
              {
                retries: 3,
                onFailedAttempt: (error) => {
                  console.warn(
                    `File upload attempt ${error.attemptNumber} failed for "${filename}". Remaining retries: ${error.retriesLeft}`,
                  );
                  if (error.retriesLeft === 0) {
                    console.error(
                      `File upload failed - all retry attempts exhausted for "${filename}"`,
                    );
                  }
                },
              },
            );

            return result;
          } catch (error) {
            console.error(
              `File upload failed - error uploading "${filename}" after all retries:`,
              error,
            );
            return {
              filePath,
              url: "",
            };
          }
        })();

        // Cache the upload promise
        ongoingUploads.set(fileHash, uploadPromise);

        try {
          const result = await uploadPromise;
          return {
            filePath,
            url: result.url,
          };
        } finally {
          // Clean up the ongoing upload tracking
          ongoingUploads.delete(fileHash);
        }
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
        return {
          filePath,
          url: "",
        };
      }
    }),
  );

  const uploadResults = await Promise.all(uploadPromises);

  return { results: uploadResults };
}
