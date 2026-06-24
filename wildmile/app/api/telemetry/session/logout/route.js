import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import TelemetrySession from "models/TelemetrySession";

export async function POST(request) {
  try {
    await dbConnect();
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const now = new Date();
    await TelemetrySession.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          loggedOutAtUtc: now,
          isAuthenticated: false,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telemetry Logout Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
