import TelemetrySession from "models/TelemetrySession";

/**
 * Finds inactive sessions and marks them as expired.
 * An inactive session is one where lastActivityAtUtc is more than 30 minutes ago
 * and it hasn't already ended.
 */
export async function expireInactiveSessions() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const inactiveSessions = await TelemetrySession.find({
    expired: false,
    endedAtUtc: null,
    lastActivityAtUtc: { $lt: thirtyMinutesAgo },
  });

  console.log(`Found ${inactiveSessions.length} inactive sessions to expire.`);

  for (const session of inactiveSessions) {
    const endedAtUtc = session.lastActivityAtUtc;
    const durationSeconds = Math.floor(
      (endedAtUtc.getTime() - session.startedAtUtc.getTime()) / 1000
    );

    await TelemetrySession.updateOne(
      { _id: session._id },
      {
        $set: {
          expired: true,
          endedAtUtc,
          durationSeconds,
        },
      }
    );
    console.log(`Session ${session.sessionId} marked as expired.`);
  }
}
