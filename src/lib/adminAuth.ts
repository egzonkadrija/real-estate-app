export const ADMIN_TOKEN_COOKIE = "admin-token";
export const ADMIN_TOKEN_STORAGE_KEY = "admin-token";

export function getAdminAuthHeaderValue(token: string | null): string | null {
  if (!token) return null;
  return `Bearer ${token}`;
}

export function getBrowserAdminAuthHeaderValue(): string | null {
  if (typeof window === "undefined") return null;
  return getAdminAuthHeaderValue(localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY));
}

export function getBrowserAdminAuthHeaders(
  extraHeaders?: HeadersInit
): HeadersInit {
  const authValue = getBrowserAdminAuthHeaderValue();
  if (!authValue) return extraHeaders ?? {};

  return {
    ...(extraHeaders ?? {}),
    Authorization: authValue,
  };
}
