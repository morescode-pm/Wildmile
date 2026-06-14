import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import User from "models/User";
import UserProgress from "models/users/UserProgress";
// import { updateUserStats } from "lib/db/updateUserStats";

// Update single user
export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Update user stats
    // await updateUserStats(userId);
    // console.log(progress);

    // Get user info
    // const user = await User.findById(userId, "profile roles");
    const progress = await UserProgress.findOne({ user: userId });
    await progress.checkAchievements();
    // await progress.save();
    // Get achievements with populated details
    await progress.populate([
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
      { path: "user", select: "profile avatar" },
    ]);

    // Find the highest level RANK achievement that has been earned
    const rankAchievements = progress.achievements
      .filter(
        (a) =>
          a.achievement?.type === "RANK" && a.progress === 100 && a.earnedAt,
      )
      .sort((a, b) => b.achievement.level - a.achievement.level);

    // Get the avatar from the highest rank achievement or use poop emoji
    const avatar =
      rankAchievements.length > 0
        ? rankAchievements[0].achievement.badge
        : "💩";

    // Format achievements for response
    const formattedAchievements = progress.achievements
      .filter((a) => a.achievement)
      .map((achievement) => ({
        id: achievement.achievement._id,
        name: achievement.achievement.name,
        description: achievement.achievement.description,
        icon: achievement.achievement.icon,
        badge: achievement.achievement.badge,
        level: achievement.achievement.level,
        type: achievement.achievement.type,
        domain: achievement.achievement.domain,
        points: achievement.achievement.points,
        progress: achievement.progress,
        earnedAt: achievement.earnedAt,
        criteria: achievement.achievement.criteria,
      }));

    // Get all observations by the user
    const observations = await Observation.find({ creator: userId });

    // Calculate total images reviewed (unique media IDs)
    const uniqueMediaIds = new Set(observations.map((obs) => obs.mediaId));
    const totalImagesReviewed = uniqueMediaIds.size;

    // Calculate total animals observed
    const animalObservations = observations.filter(
      (obs) => obs.observationType === "animal",
    );
    const totalAnimalsObserved = animalObservations.reduce(
      (sum, obs) => sum + (obs.count || 1),
      0,
    );

    // Calculate total blanks logged
    const totalBlanksLogged = observations.filter(
      (obs) => obs.observationType === "blank",
    ).length;

    // Calculate unique species
    const uniqueSpecies = new Set(
      animalObservations
        .map((obs) => obs.scientificName)
        .filter((name) => name), // Remove null/undefined
    );

    // Get top species
    const speciesCounts = animalObservations.reduce((acc, obs) => {
      const key = obs.commonName || obs.scientificName;
      if (!acc[key]) {
        acc[key] = {
          commonName: obs.commonName,
          scientificName: obs.scientificName,
          count: 0,
        };
      }
      acc[key].count += obs.count || 1;
      return acc;
    }, {});

    const topSpecies = Object.values(speciesCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Convert domainRanks Map to object for JSON response
    const domainRanks = {};
    if (progress.domainRanks) {
      progress.domainRanks.forEach((value, key) => {
        domainRanks[key] = value;
      });
    }

    const responseData = {
      user: {
        ...progress.user.toObject(),
        avatar,
      },
      stats: {
        ...progress.stats,
        totalImagesReviewed,
        totalAnimalsObserved,
        totalBlanksLogged,
        uniqueSpeciesCount: uniqueSpecies.size,
      },
      streaks: progress.streaks,
      achievements: formattedAchievements,
      totalPoints: progress.totalPoints,
      level: progress.level,
      domainRanks,
      topSpecies,
      uniqueSpeciesCount: uniqueSpecies.size,
      totalImagesReviewed,
      totalAnimalsObserved,
      totalBlanksLogged,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 },
    );
  }
}
