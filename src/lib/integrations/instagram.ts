import type { ConnectionRecord } from "../store";
import { credentials } from "./config";

// Instagram API with Instagram Login (Business Login for Instagram), professional accounts only.
const GRAPH = "https://graph.instagram.com";
const VERSION = "v27.0";
const SCOPES = ["instagram_business_basic", "instagram_business_content_publish"];

export function instagramAuthUrl(clientId: string, redirectUri: string, state: string) {
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    enable_fb_login: "false",
    state,
  }).toString();
  return url.toString();
}

async function json(res: Response, what: string) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? data.error_message ?? `${what} failed (${res.status})`);
  }
  return data;
}

export async function instagramExchangeCode(code: string, redirectUri: string) {
  const creds = credentials("instagram");
  if (!creds) throw new Error("Instagram API keys are not set.");

  // Meta appends "#_" to the code in some redirects; it is not part of the code.
  const form = new FormData();
  form.set("client_id", creds.clientId);
  form.set("client_secret", creds.clientSecret);
  form.set("grant_type", "authorization_code");
  form.set("redirect_uri", redirectUri);
  form.set("code", code.replace(/#_$/, ""));
  const short = await json(
    await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body: form }),
    "Instagram code exchange",
  );
  const shortToken = (short.data?.[0] ?? short).access_token as string;

  const long = await json(
    await fetch(
      `${GRAPH}/access_token?${new URLSearchParams({
        grant_type: "ig_exchange_token",
        client_secret: creds.clientSecret,
        access_token: shortToken,
      })}`,
    ),
    "Instagram long-lived token",
  );

  const me = await json(
    await fetch(`${GRAPH}/${VERSION}/me?${new URLSearchParams({ fields: "user_id,username", access_token: long.access_token })}`),
    "Instagram profile lookup",
  );

  return {
    accountId: String(me.user_id ?? me.id),
    accountName: `@${me.username}`,
    accessToken: long.access_token as string,
    expiresAt: new Date(Date.now() + (long.expires_in ?? 5_184_000) * 1000).toISOString(),
  };
}

// Long-lived tokens last 60 days; refresh once they are over a day old and within 10 days of expiry.
export async function instagramAccessToken(connection: ConnectionRecord) {
  const expiresIn = connection.expiresAt ? new Date(connection.expiresAt).getTime() - Date.now() : Infinity;
  const age = Date.now() - new Date(connection.connectedAt).getTime();
  if (expiresIn <= 0) throw new Error("Instagram session expired. Reconnect the account.");
  if (expiresIn > 10 * 86_400_000 || age < 86_400_000) return { accessToken: connection.accessToken };
  const data = await json(
    await fetch(
      `${GRAPH}/refresh_access_token?${new URLSearchParams({ grant_type: "ig_refresh_token", access_token: connection.accessToken })}`,
    ),
    "Instagram token refresh",
  );
  return {
    accessToken: data.access_token as string,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

// Reels: create a container from a public video URL, wait for processing, then publish.
export async function instagramPublishReel(
  accessToken: string,
  accountId: string,
  video: { videoUrl: string; caption: string },
) {
  const container = await json(
    await fetch(`${GRAPH}/${VERSION}/${accountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: video.videoUrl,
        caption: video.caption.slice(0, 2200),
        share_to_feed: true,
        is_ai_generated: true,
      }),
    }),
    "Instagram container",
  );

  // Meta recommends checking once a minute for up to 5 minutes; check every 10s for up to 5 minutes.
  for (let attempt = 0; attempt < 30; attempt++) {
    const status = await json(
      await fetch(`${GRAPH}/${VERSION}/${container.id}?fields=status_code`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      "Instagram container status",
    );
    if (status.status_code === "FINISHED") break;
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(`Instagram could not process the video (${status.status_code}).`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }

  const published = await json(
    await fetch(`${GRAPH}/${VERSION}/${accountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ creation_id: container.id }),
    }),
    "Instagram publish",
  );

  const media = await json(
    await fetch(`${GRAPH}/${VERSION}/${published.id}?fields=permalink`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
    "Instagram permalink",
  ).catch(() => ({}));

  return { id: published.id as string, url: (media.permalink as string | undefined) ?? undefined };
}
