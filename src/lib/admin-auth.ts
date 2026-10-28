import type { createInternalNeonAuth } from "@neondatabase/auth";

export const NEON_AUTH_URL =
  import.meta.env.VITE_NEON_AUTH_URL ??
  "https://ep-falling-thunder-avg9v3nc.neonauth.c-11.us-east-1.aws.neon.tech/neondb/auth";

let authPromise: Promise<ReturnType<typeof createInternalNeonAuth>> | undefined;

// The SDK creates a per-tab identifier at import time. Keep it in the browser,
// rather than evaluating it during server rendering or Worker startup.
export function getAdminAuth() {
  if (typeof window === "undefined")
    throw new Error("Admin sign-in requires a browser.");
  if (!authPromise) {
    authPromise = import("@neondatabase/auth")
      .then(({ createInternalNeonAuth }) =>
        createInternalNeonAuth(NEON_AUTH_URL),
      )
      .catch((error) => {
        authPromise = undefined;
        throw error;
      });
  }
  return authPromise;
}

export async function getAdminToken() {
  const token = await (await getAdminAuth()).getJWTToken();
  if (!token)
    throw new Error("Your admin session has expired. Please sign in again.");
  return token;
}
