import { joinURL } from "ufo";

/**
 * Custom error class for invalid blocklet application URLs.
 */
export class InvalidBlockletError extends Error {
  constructor(url, status, statusText) {
    super(`The application URL "${url}" is invalid. I was unable to fetch the configuration.`);
    this.name = "InvalidBlockletError";
    this.url = url;
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * Custom error class for missing component mount points.
 */
export class ComponentNotFoundError extends Error {
  constructor(did, appUrl) {
    super(`Your website "${appUrl}" is missing a required component to host your documentation.`);
    this.name = "ComponentNotFoundError";
    this.did = did;
    this.appUrl = appUrl;
  }
}

const BLOCKLET_INFO_CACHE = {};

// Export for testing purposes
export function clearBlockletCache() {
  Object.keys(BLOCKLET_INFO_CACHE).forEach((key) => {
    delete BLOCKLET_INFO_CACHE[key];
  });
}

export async function getComponentInfo(appUrl) {
  const blockletJsUrl = joinURL(appUrl, "__blocklet__.js?type=json");

  const cacheInfo = BLOCKLET_INFO_CACHE[appUrl];

  // Cache for 10 min
  if (cacheInfo) {
    if (Date.now() > cacheInfo.__blocklet_info_cache_timestamp + 1000 * 60 * 10) {
      delete BLOCKLET_INFO_CACHE[appUrl];
    } else {
      // Return a copy without the cache timestamp
      const { __blocklet_info_cache_timestamp, ...config } = cacheInfo;
      return config;
    }
  }

  let blockletJs;
  try {
    blockletJs = await fetch(blockletJsUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
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
    BLOCKLET_INFO_CACHE[appUrl] = {
      ...config,
      __blocklet_info_cache_timestamp: Date.now(),
    };
  } catch {
    throw new InvalidBlockletError(appUrl, null, "The server returned an invalid JSON response.");
  }

  return config;
}

export async function getComponentMountPoint(appUrl, did) {
  const config = await getComponentInfo(appUrl);

  const component = config.componentMountPoints?.find((component) => component.did === did);
  if (!component) {
    throw new ComponentNotFoundError(did, appUrl);
  }

  return component.mountPoint;
}

export async function getComponentInfoWithMountPoint(appUrl, did) {
  const config = await getComponentInfo(appUrl);

  const component = config.componentMountPoints?.find((component) => component.did === did);
  if (!component) {
    throw new ComponentNotFoundError(did, appUrl);
  }

  return {
    ...config,
    mountPoint: component.mountPoint,
  };
}
