import type { ConnectionRecord } from "../store";
import { credentials } from "./config";

// Google OAuth 2.0 + YouTube Data API v3.
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"];

export function youtubeAuthUrl(clientId: string, redirectUri: string, state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  }).toString();
  return url.toString();
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? data.error ?? `Google token error ${res.status}`);
  return data as { access_token: string; expires_in: number; refresh_token?: string };
}

export async function youtubeExchangeCode(code: string, redirectUri: string) {
  const creds = credentials("youtube");
  if (!creds) throw new Error("YouTube API keys are not set.");
  const tokens = await tokenRequest({
    code,
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `YouTube channel lookup failed (${res.status})`);
  const channel = data.items?.[0];
  if (!channel) throw new Error("This Google account has no YouTube channel.");

  return {
    accountId: channel.id as string,
    accountName: (channel.snippet?.customUrl ?? channel.snippet?.title ?? channel.id) as string,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  };
}

// Returns a valid access token, refreshing it when it is about to expire.
export async function youtubeAccessToken(connection: ConnectionRecord) {
  const fresh = connection.expiresAt && new Date(connection.expiresAt).getTime() - Date.now() > 60_000;
  if (fresh) return { accessToken: connection.accessToken };
  const creds = credentials("youtube");
  if (!creds || !connection.refreshToken) throw new Error("YouTube session expired. Reconnect the channel.");
  const tokens = await tokenRequest({
    refresh_token: connection.refreshToken,
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    grant_type: "refresh_token",
  });
  return {
    accessToken: tokens.access_token,
    expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  };
}

// Resumable upload: create the session with metadata, then send the file bytes.
export async function youtubeUpload(
  accessToken: string,
  video: { bytes: Uint8Array; title: string; description: string; isShort: boolean },
) {
  const title = (video.isShort && !/#shorts/i.test(video.title) ? `${video.title} #Shorts` : video.title).slice(0, 100);
  const session = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": String(video.bytes.byteLength),
      },
      body: JSON.stringify({
        snippet: { title, description: video.description.slice(0, 5000), categoryId: "25" },
        // Synthetic (AI-generated) content disclosure.
        status: { privacyStatus: "public", selfDeclaredMadeForKids: false, containsSyntheticMedia: true },
      }),
    },
  );
  if (!session.ok) {
    const data = await session.json().catch(() => ({}));
    throw new Error(data.error?.message ?? `YouTube upload session failed (${session.status})`);
  }
  const uploadUrl = session.headers.get("location");
  if (!uploadUrl) throw new Error("YouTube did not return an upload URL.");

  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(video.bytes.byteLength) },
    body: new Blob([video.bytes as Uint8Array<ArrayBuffer>], { type: "video/mp4" }),
  });
  const data = await upload.json();
  if (!upload.ok) throw new Error(data.error?.message ?? `YouTube upload failed (${upload.status})`);
  return { id: data.id as string, url: `https://www.youtube.com/watch?v=${data.id}` };
}
