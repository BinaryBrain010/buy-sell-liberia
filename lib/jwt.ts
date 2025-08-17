// Lightweight JWT helpers for client-side checks (no signature verification)
export type JWTPayload = {
  exp?: number;
  iat?: number;
  userId?: string;
  email?: string;
  [key: string]: any;
};

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenValid(token?: string | null): boolean {
  if (!token) return false;
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}

export function getLocalAuthStatus(): {
  isLoggedIn: boolean;
  payload?: JWTPayload;
  source: "accessToken" | "refreshToken" | "none";
} {
  if (typeof window === "undefined")
    return { isLoggedIn: false, source: "none" };
  const access = localStorage.getItem("accessToken");
  if (isTokenValid(access)) {
    const payload = decodeJWT(access as string) || undefined;
    return { isLoggedIn: true, payload, source: "accessToken" };
  }
  const refresh = localStorage.getItem("refreshToken");
  if (isTokenValid(refresh)) {
    const payload = decodeJWT(refresh as string) || undefined;
    return { isLoggedIn: true, payload, source: "refreshToken" };
  }
  return { isLoggedIn: false, source: "none" };
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}
