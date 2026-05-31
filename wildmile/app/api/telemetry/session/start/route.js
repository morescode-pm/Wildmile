import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import TelemetrySession from "models/TelemetrySession";
import { hashUserId, getCentralTime } from "lib/telemetry/utils";
import crypto from "crypto";

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const {
      anonymousId,
      userId,
      platform,
      entryPage,
      timezone,
      localTime,
      browser,
      browserVersion,
      deviceType,
      screenWidth,
      screenHeight,
      referrer,
      appVersion,
    } = data;

    const sessionId = crypto.randomUUID();
    const now = new Date();
    const userIdHash = userId ? hashUserId(userId) : null;

    const sessionData = {
      sessionId,
      anonymousId,
      isAuthenticated: !!userId,
      userIdHash,
      authenticatedAtUtc: userId ? now : null,
      platform: platform || "web",
      browser,
      browserVersion,
      deviceType,
      screenWidth,
      screenHeight,
      referrer,
      appVersion,
      timezone,
      entryPage,
      exitPage: entryPage,
      startedAtUtc: now,
      startedAtLocal: localTime,
      startedAtCentral: getCentralTime(now),
      lastActivityAtUtc: now,
    };

    const session = await TelemetrySession.create(sessionData);

    return NextResponse.json({ sessionId: session.sessionId });
  } catch (error) {
    console.error("Telemetry Start Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
