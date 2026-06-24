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
    const session = await TelemetrySession.findOne({ sessionId });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const durationSeconds = Math.floor(
      (now.getTime() - session.startedAtUtc.getTime()) / 1000
    );

    await TelemetrySession.updateOne(
      { sessionId },
      {
        $set: {
          endedAtUtc: now,
          durationSeconds,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telemetry End Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
