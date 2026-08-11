"use server";

import { revalidateTag } from "next/cache";
import dbConnect from "lib/db/setup";

import User from "models/User";
import UserProgress from "models/users/UserProgress";
import Observation from "models/cameratrap/Observation";
import Achievement from "models/users/Achievement";
import { updateUserStats, updateAllUserStats } from "lib/db/updateUserStats";

// Lightweight read-only function — reads previously computed stats without recalculating
export async function getUserStats(userId) {
  if (!userId) return null;
  await dbConnect();

  try {
    const [user, progress] = await Promise.all([
      User.findById(userId, "profile roles").lean(),
      UserProgress.findOne({ user: userId }).populate([
        {
          path: "achievements.achievement",
          model: "Achievement",
          select: "name description icon badge level type domain criteria points",
        },
        {
          path: "domainRanks.$*.currentRank",
          model: "Achievement",
          select: "name description icon badge level type domain criteria points",
        },
      ]),
    ]);

    if (!user || !progress) return null;

    const rankAchievements = progress.achievements
      .filter(
        (a) => a.achievement?.type === "RANK" && a.progress === 100 && a.earnedAt
      )
      .sort((a, b) => b.achievement.level - a.achievement.level);

    const avatar =
      rankAchievements.length > 0
        ? rankAchievements[0].achievement.badge
        : "💩";

    const formattedDomainRanks = {};
    progress.domainRanks?.forEach((value, domain) => {
      formattedDomainRanks[domain] = {
        points: value.points || 0,
        currentRank: value.currentRank
          ? {
              id: value.currentRank._id,
              name: value.currentRank.name,
              description: value.currentRank.description,
              icon: value.currentRank.icon,
              badge: value.currentRank.badge,
              level: value.currentRank.level,
              type: value.currentRank.type,
              domain: value.currentRank.domain,
              points: value.currentRank.points,
            }
          : null,
      };
    });

    return {
      user: {
        ...user,
        avatar,
      },
      stats: progress.stats,
      streaks: progress.streaks,
      achievements: progress.achievements
        .filter((a) => a.achievement)
        .map((a) => ({
          id: a.achievement._id,
          name: a.achievement.name,
          description: a.achievement.description,
          icon: a.achievement.icon,
          badge: a.achievement.badge,
          level: a.achievement.level,
          type: a.achievement.type,
          domain: a.achievement.domain,
          points: a.achievement.points,
          progress: a.progress,
          earnedAt: a.earnedAt,
          criteria: a.achievement.criteria,
        })),
      totalPoints: progress.totalPoints,
      level: progress.level,
      domainRanks: formattedDomainRanks,
      lastActive:
        progress.stats?.lastActive ||
        (progress.streaks?.lastLoginDate
          ? new Date(progress.streaks.lastLoginDate)
          : null),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}

export { updateUserStats, updateAllUserStats };

export async function updateUserProgress(userId, stats) {
  await dbConnect();

  try {
    // 1. Update stats (which also checks achievements and saves)
    // We get back the most fresh, updated document and any newly earned achievements.
    const { progress, newlyEarned } = await updateUserStats(userId);

    const newlyEarnedAchievements = newlyEarned.map((achievement) => ({
      id: achievement._id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      badge: achievement.badge,
      points: achievement.points,
      earnedAt: new Date(), // Using current date as a fallback, though checkAchievements sets it on the progress doc
    }));

    // Revalidate relevant cache tags
    revalidateTag("user-progress");
    revalidateTag("achievements");

    return { success: true, newAchievements: newlyEarnedAchievements };
  } catch (error) {
    console.error("Error updating progress:", error);
    return { success: false, error: "Failed to update progress" };
  }
}
