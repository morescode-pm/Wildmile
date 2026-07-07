import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import { updateAllUserStats, updateUserStats } from "lib/db/updateUserStats";
import { getSession } from "lib/getSession";

export async function POST(request) {
  await dbConnect();
  const session = await getSession();

  // Basic admin check - ideally should use a more robust role check
  if (!session || !session.roles || !session.roles.includes("Admin") && !session.roles.includes("SuperAdmin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Safely parse JSON body, handle empty bodies for global recalculation
    let userId;
    try {
      const body = await request.json();
      userId = body?.userId;
    } catch (e) {
      // Body is empty or not JSON, which is fine for global recalculation
      userId = null;
    }

    if (userId) {
      // Recalculate for a specific user
      const result = await updateUserStats(userId);
      const message = result.updated
        ? `Stats updated for user ${userId}`
        : `No changes needed for user ${userId}`;
      return NextResponse.json({ success: true, message, result });
    } else {
      // Recalculate for ALL users
      const data = await updateAllUserStats();
      const message = `Stats updated: ${data.updatedCount}, Skipped: ${data.skippedCount} (Total: ${data.totalCount})`;
      return NextResponse.json({
        success: true,
        message,
        updatedCount: data.updatedCount,
        skippedCount: data.skippedCount,
        totalCount: data.totalCount,
        results: data.results,
      });
    }
  } catch (error) {
    console.error("Error recalculating stats:", error);
    return NextResponse.json(
      { error: "Failed to recalculate stats", details: error.message },
      { status: 500 }
    );
  }
}
