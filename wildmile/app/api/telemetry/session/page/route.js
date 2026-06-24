import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import TelemetrySession from "models/TelemetrySession";

export async function POST(request) {
  try {
    await dbConnect();
    const { sessionId, page, authenticated } = await request.json();

    if (!sessionId || !page) {
      return NextResponse.json(
        { error: "Session ID and page are required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const pageView = {
      page,
      enteredAtUtc: now,
      authenticated: !!authenticated,
    };

    await TelemetrySession.findOneAndUpdate(
      { sessionId },
      {
        $push: { pageViews: pageView },
        $inc: { pageViewCount: 1 },
        exitPage: page,
        lastActivityAtUtc: now,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telemetry Page Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
