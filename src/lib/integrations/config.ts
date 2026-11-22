import type { Platform } from "../store";

// OAuth app credentials come from the environment (.env.local locally, Secrets on Replit).
export const platformConfig: Record<
  Platform,
  { label: string; clientIdVar: string; clientSecretVar: string; consoleUrl: string }
> = {
  youtube: {
    label: "YouTube",
    clientIdVar: "GOOGLE_CLIENT_ID",
    clientSecretVar: "GOOGLE_CLIENT_SECRET",
    consoleUrl: "https://console.cloud.google.com/apis/credentials",
  },
  instagram: {
    label: "Instagram",
    clientIdVar: "INSTAGRAM_APP_ID",
    clientSecretVar: "INSTAGRAM_APP_SECRET",
    consoleUrl: "https://developers.facebook.com/apps",
  },
};

export function credentials(platform: Platform) {
  const { clientIdVar, clientSecretVar } = platformConfig[platform];
  const clientId = process.env[clientIdVar];
  const clientSecret = process.env[clientSecretVar];
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function isConfigured(platform: Platform) {
  return credentials(platform) !== null;
}

// APP_URL pins the public base URL (it must match the redirect URI registered with Google / Meta).
export function redirectUri(platform: Platform, requestOrigin: string) {
  const base = (process.env.APP_URL ?? requestOrigin).replace(/\/+$/, "");
  return `${base}/api/oauth/${platform}/callback`;
}

export function isPlatform(value: string): value is Platform {
  return value === "youtube" || value === "instagram";
}
