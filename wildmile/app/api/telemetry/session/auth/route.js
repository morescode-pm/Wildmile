import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import TelemetrySession from "models/TelemetrySession";
import { hashUserId } from "lib/telemetry/utils";

export async function POST(request) {
  try {
    await dbConnect();
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Session ID and user ID are required" },
        { status: 400 }
      );
    }

    const userIdHash = hashUserId(userId);
    const now = new Date();

    const session = await TelemetrySession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const update = {
      userIdHash,
      isAuthenticated: true,
    };

    if (!session.authenticatedAtUtc) {
      update.authenticatedAtUtc = now;
    }

    await TelemetrySession.updateOne({ sessionId }, { $set: update });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telemetry Auth Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
