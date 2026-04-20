const TOKEN_KEY = "scheduler_token";
const ORG_KEY = "scheduler_org_slug";

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredOrganizationSlug() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ORG_KEY) || "";
}

export function setStoredAuth(token, organizationSlug) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `scheduler_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  }
  if (organizationSlug) {
    window.localStorage.setItem(ORG_KEY, organizationSlug);
    document.cookie = `scheduler_org_slug=${organizationSlug}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  }
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ORG_KEY);
  document.cookie = "scheduler_token=; path=/; max-age=0; samesite=lax";
  document.cookie = "scheduler_org_slug=; path=/; max-age=0; samesite=lax";
}

export async function apiFetch(url, options = {}) {
  const token = getStoredToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed: ${response.status}`);
  }

  return payload?.data;
}
