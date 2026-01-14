import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Platform } from "react-native";

/**
 * Gets the base URL for the Express API server (e.g., "https://...").
 *
 * Priority:
 *  1) EXPO_PUBLIC_API_URL (preferred; supports http/https or host:port)
 *  2) REACT_APP_API_URL   (legacy fallback; some bundlers still inject this)
 *  3) EXPO_PUBLIC_DOMAIN  (Replit-style domain; assumed https)
 *  4) Web same-origin (ONLY if it is not Capacitor localhost)
 *  5) Local fallbacks (dev only):
 *     - Android emulator: http://10.0.2.2:1801
 *     - Others:          http://127.0.0.1:1801
 */
export function getApiUrl(): string {
  // 1) Prefer explicit API URL from Expo public env
  const explicitExpo = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitExpo) {
    if (!/^https?:\/\//i.test(explicitExpo)) return `http://${explicitExpo}`;
    return explicitExpo.replace(/\/+$/, "");
  }

  // 2) Legacy fallback (some builds still inject REACT_APP_API_URL)
  const explicitReact = (process.env as any).REACT_APP_API_URL?.trim?.();
  if (explicitReact) {
    if (!/^https?:\/\//i.test(explicitReact)) return `http://${explicitReact}`;
    return explicitReact.replace(/\/+$/, "");
  }

  // 3) Replit-style domain (assume https)
  const domain = process.env.EXPO_PUBLIC_DOMAIN?.trim();
  if (domain) {
    return new URL(`https://${domain}`).href.replace(/\/+$/, "");
  }

  // 4) Web fallback: same-origin — BUT avoid Capacitor's http://localhost origin
  if (Platform.OS === "web") {
    const g = globalThis as any;
    const origin: string | undefined = g?.location?.origin;

    // Detect Capacitor (webview) and ignore its localhost origin as an API base
    const isCapacitor =
      typeof g?.Capacitor !== "undefined" ||
      typeof g?.capacitor !== "undefined" ||
      typeof g?.CapacitorWebView !== "undefined";

    if (typeof origin === "string" && origin.length > 0) {
      const normalized = origin.replace(/\/+$/, "");
      const isLocalhost =
        /^https?:\/\/localhost(?::\d+)?$/i.test(normalized) ||
        /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i.test(normalized);

      // Only use origin if it's NOT Capacitor localhost
      if (!(isCapacitor && isLocalhost)) {
        return normalized;
      }
    }
    // If we can't trust origin (Capacitor localhost), fall through.
  }

  // 5) Dev-only local fallbacks
  if (Platform.OS === "android") return "http://10.0.2.2:1801";
  return "http://127.0.0.1:1801";
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, { credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: { retry: false },
  },
});
