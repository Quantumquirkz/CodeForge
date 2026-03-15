/**
 * Base URL for API requests. When VITE_API_URL is set (e.g. frontend and backend
 * run separately), all API paths are prefixed with this value.
 * When unset, same-origin requests are used (default).
 */
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "";

/**
 * Returns the full URL for an API path, prepending API_BASE when configured.
 */
export function apiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
