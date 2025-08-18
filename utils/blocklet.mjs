/**
 * Custom error class for invalid blocklet application URLs
 */
export class InvalidBlockletError extends Error {
  constructor(url, status, statusText) {
    super(`Invalid application URL: "${url}". Unable to fetch configuration.`);
    this.name = "InvalidBlockletError";
    this.url = url;
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * Custom error class for missing component mount points
 */
export class ComponentNotFoundError extends Error {
  constructor(did, appUrl) {
    super(`Your website "${appUrl}" missing required component to host your docs.`);
    this.name = "ComponentNotFoundError";
    this.did = did;
    this.appUrl = appUrl;
  }
}

export async function getComponentMountPoint(appUrl, did) {
  const url = new URL(appUrl);
  const blockletJsUrl = `${url.origin}/__blocklet__.js?type=json`;

  let blockletJs;
  try {
    blockletJs = await fetch(blockletJsUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    throw new InvalidBlockletError(appUrl, null, error.message);
  }

  if (!blockletJs.ok) {
    throw new InvalidBlockletError(appUrl, blockletJs.status, blockletJs.statusText);
  }

  let config;
  try {
    config = await blockletJs.json();
  } catch {
    throw new InvalidBlockletError(appUrl, null, "Invalid JSON response");
  }

  const component = config.componentMountPoints?.find((component) => component.did === did);
  if (!component) {
    throw new ComponentNotFoundError(did, appUrl);
  }

  return component.mountPoint;
}
