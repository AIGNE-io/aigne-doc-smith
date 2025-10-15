export async function requestWithAuthToken(url, options, authToken) {
  const response = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${authToken}` },
  });
  return response.json();
}
