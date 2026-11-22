import { NextResponse, type NextRequest } from "next/server";
import { isAnchorId } from "@/lib/anchors";
import { isPlatform, platformConfig, redirectUri } from "@/lib/integrations/config";
import { instagramExchangeCode } from "@/lib/integrations/instagram";
import { resetRetryable } from "@/lib/integrations/publish";
import { youtubeExchangeCode } from "@/lib/integrations/youtube";
import { update } from "@/lib/store";

export async function GET(request: NextRequest, ctx: RouteContext<"/api/oauth/[platform]/callback">) {
  const { platform } = await ctx.params;
  if (!isPlatform(platform)) return NextResponse.json({ error: "Unknown platform." }, { status: 400 });

  const params = request.nextUrl.searchParams;
  const state = params.get("state") ?? "";
  const expected = request.cookies.get(`oauth_state_${platform}`)?.value;
  const anchor = state.split(".")[0];
  if (!expected || state !== expected || !isAnchorId(anchor)) {
    return NextResponse.json({ error: "Sign-in expired or did not match. Start again from the Profile page." }, { status: 400 });
  }

  const profile = new URL(`/${anchor}/profile`, request.nextUrl.origin);
  const label = platformConfig[platform].label;

  try {
    const error = params.get("error_description") ?? params.get("error");
    if (error) throw new Error(error.replace(/\+/g, " "));
    const code = params.get("code");
    if (!code) throw new Error("No authorization code was returned.");

    const redirect = redirectUri(platform, request.nextUrl.origin);
    const account =
      platform === "youtube" ? await youtubeExchangeCode(code, redirect) : await instagramExchangeCode(code, redirect);

    await update("connections", (records) => {
      const existing = records.findIndex((r) => r.anchor === anchor && r.platform === platform);
      const record = { anchor, platform, ...account, connectedAt: new Date().toISOString() };
      if (existing >= 0) records[existing] = record;
      else records.push(record);
    });
    await resetRetryable(anchor, platform);
    profile.searchParams.set("oauth_connected", `${label} connected as ${account.accountName}.`);
  } catch (error) {
    profile.searchParams.set("oauth_error", `${label}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const response = NextResponse.redirect(profile);
  response.cookies.delete({ name: `oauth_state_${platform}`, path: "/api/oauth" });
  return response;
}
