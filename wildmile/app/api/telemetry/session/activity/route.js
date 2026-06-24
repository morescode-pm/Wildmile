import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import TelemetrySession from "models/TelemetrySession";

export async function POST(request) {
  try {
    await dbConnect();
    const { sessionId, currentPage } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const now = new Date();
    const update = {
      lastActivityAtUtc: now,
    };
    if (currentPage) {
      update.exitPage = currentPage;
    }

    await TelemetrySession.findOneAndUpdate({ sessionId }, update);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telemetry Activity Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
