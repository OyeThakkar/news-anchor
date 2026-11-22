import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isAnchorId } from "@/lib/anchors";
import { credentials, isPlatform, redirectUri } from "@/lib/integrations/config";
import { instagramAuthUrl } from "@/lib/integrations/instagram";
import { youtubeAuthUrl } from "@/lib/integrations/youtube";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/oauth/[platform]/start">) {
  const { platform } = await ctx.params;
  const anchor = request.nextUrl.searchParams.get("anchor") ?? "";
  if (!isPlatform(platform) || !isAnchorId(anchor)) {
    return NextResponse.json({ error: "Unknown platform or anchor." }, { status: 400 });
  }

  const profile = new URL(`/${anchor}/profile`, request.nextUrl.origin);
  const creds = credentials(platform);
  if (!creds) {
    profile.searchParams.set("oauth_error", `${platform} API keys are not set on the server.`);
    return NextResponse.redirect(profile);
  }

  // The state ties the callback to this browser and this anchor (CSRF protection).
  const state = `${anchor}.${randomUUID()}`;
  const redirect = redirectUri(platform, request.nextUrl.origin);
  const authUrl =
    platform === "youtube"
      ? youtubeAuthUrl(creds.clientId, redirect, state)
      : instagramAuthUrl(creds.clientId, redirect, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/api/oauth",
    maxAge: 600,
  });
  return response;
}
