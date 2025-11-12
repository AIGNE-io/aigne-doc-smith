export async function requestWithAuthToken(url, options, authToken) {
  if (!authToken) {
    console.error("No authentication token provided");
  }
  const response = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${authToken}` },
  });
  return response.json();
}
