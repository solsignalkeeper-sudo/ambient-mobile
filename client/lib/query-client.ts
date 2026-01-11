import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Platform } from "react-native";

export function getApiUrl(): string {
  // 1) Allow hard override (best for sanity while debugging)
  const envUrl =
    (process.env.EXPO_PUBLIC_API_URL as string | undefined) ||
    (process.env.REACT_APP_API_URL as string | undefined);

  if (envUrl && envUrl.trim()) return envUrl.replace(/\/$/, "");

  // 2) Platform-safe defaults
  // Android emulator must use 10.0.2.2 to reach host machine (your Mac)
  // iOS simulator can use localhost
  // Physical device must use your Mac LAN IP (e.g. http://192.168.1.23:1801)
  try {
    // Avoid importing Platform here if your web build complains;
    // keep it runtime-safe.
    // @ts-ignore
    const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

    if (isAndroid) return "http://10.0.2.2:1801";
  } catch (e) {
    // ignore
  }

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
  data?: unknown | undefined,
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
export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, { credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
