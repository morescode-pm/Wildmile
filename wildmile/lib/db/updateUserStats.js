import dbConnect from "./setup";
import User from "models/User";
import UserProgress from "models/users/UserProgress";
import Observation from "models/cameratrap/Observation";
import TrashLog from "models/Trash";
import IndividualTrashItem from "models/IndividualTrashItem";
import TrashItem from "models/TrashItem";
import Achievement from "models/users/Achievement";

/**
 * Updates a user's statistics based on their observations and trash logs.
 * @param {string} userId - The ID of the user to update.
 * @returns {Promise<Object>} - The updated UserProgress document.
 */
async function updateUserStats(userId) {
  await dbConnect();

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    const [observations, trashLogResult, trashItemsAggregation] =
      await Promise.all([
        Observation.find({ creator: user._id }).sort({ createdAt: 1 }).lean(),
        TrashLog.aggregate([
          { $match: { creator: user._id, deleted: false } },
          {
            $group: {
              _id: null,
              cleanupEvents: { $sum: 1 },
              weightCollected: { $sum: "$weight" },
              totalVolunteers: { $sum: "$numOfParticipants" },
              sitesMonitored: { $addToSet: "$site" },
              totalHours: {
                $sum: {
                  $divide: [{ $subtract: ["$timeEnd", "$timeStart"] }, 3600000],
                },
              },
            },
          },
        ]),
        IndividualTrashItem.aggregate([
          { $match: { creator: user._id } },
          {
            $lookup: {
              from: "trashitems",
              localField: "itemId",
              foreignField: "_id",
              as: "itemDetails",
            },
          },
          { $unwind: "$itemDetails" },
          {
            $group: {
              _id: null,
              itemsLogged: { $sum: "$quantity" },
              uniqueMaterials: { $addToSet: "$itemDetails.material" },
              uniqueCategories: { $addToSet: "$itemDetails.catagory" },
              locationsMonitored: {
                $addToSet: {
                  $cond: [
                    { $ifNull: ["$location", false] },
                    {
                      $concat: [
                        "$location.coordinates.0",
                        ",",
                        "$location.coordinates.1",
                      ],
                    },
                    null,
                  ],
                },
              },
            },
          },
        ]),
      ]);

    const [trashLogStats] = trashLogResult;

    let currentStreak = 0;
    let longestStreak = 0;
    let lastLoginDate = null;

    if (observations.length > 0) {
      const observationDates = observations.map((obs) =>
        new Date(obs.createdAt).toLocaleDateString()
      );
      const uniqueDates = [...new Set(observationDates)];
      uniqueDates.sort();

      currentStreak = 1;
      let tempStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const dayDiff = Math.floor(
          (currDate - prevDate) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          tempStreak++;
          currentStreak = tempStreak;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          tempStreak = 1;
          currentStreak = 1;
        }
      }

      const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
      const today = new Date();
      const daysSinceLastObservation = Math.floor(
        (today - lastDate) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastObservation > 1) {
        currentStreak = 0;
      }

      lastLoginDate = new Date(uniqueDates[uniqueDates.length - 1]);
    }

    const stats = {
      imagesReviewed: 0,
      animalsObserved: 0,
      uniqueSpecies: new Set(),
      blanksLogged: 0,
      deploymentsReviewed: new Set(),
      speciesConsensus: 0,
      expertVerified: 0,
      itemsLogged: 0,
      uniqueMaterials: new Set(),
      uniqueCategories: new Set(),
      cleanupEvents: 0,
      weightCollected: 0,
      locationsMonitored: new Set(),
      dataQualityScore: 0,
      totalVolunteers: 0,
      totalHours: 0,
      avgItemsPerCleanup: 0,
      sitesMonitored: new Set(),
    };

    const uniqueMediaIds = new Set(observations.map((obs) => obs.mediaId));
    stats.imagesReviewed = uniqueMediaIds.size;

    const animalObservations = observations.filter(
      (obs) => obs.observationType === "animal"
    );
    stats.animalsObserved = animalObservations.reduce(
      (sum, obs) => sum + (obs.count || 1),
      0
    );

    stats.blanksLogged = observations.filter(
      (obs) => obs.observationType === "blank"
    ).length;

    stats.uniqueSpecies = new Set(
      animalObservations
        .map((obs) => obs.scientificName)
        .filter((name) => name && name.trim() !== "")
    );

    stats.deploymentsReviewed = new Set(
      observations.map((obs) => obs.deployment).filter(Boolean)
    );

    stats.speciesConsensus = observations.filter(
      (obs) => obs.consensusReached
    ).length;

    stats.expertVerified = observations.filter(
      (obs) => obs.expertVerified
    ).length;

    // Update stats from trash log aggregation
    if (trashLogStats) {
      stats.cleanupEvents = trashLogStats.cleanupEvents;
      stats.weightCollected = trashLogStats.weightCollected || 0;
      stats.totalVolunteers = trashLogStats.totalVolunteers || 0;
      stats.totalHours = Math.round(trashLogStats.totalHours || 0);
      stats.sitesMonitored = new Set(
        trashLogStats.sitesMonitored.filter(Boolean)
      );
    }

    // Update stats from individual trash items
    if (trashItemsAggregation.length > 0) {
      const trashItemStats = trashItemsAggregation[0];
      stats.itemsLogged = trashItemStats.itemsLogged || 0;
      stats.uniqueMaterials = new Set(
        trashItemStats.uniqueMaterials.filter(Boolean)
      );
      stats.uniqueCategories = new Set(
        trashItemStats.uniqueCategories.filter(Boolean)
      );
      stats.locationsMonitored = new Set(
        trashItemStats.locationsMonitored.filter(Boolean)
      );
    }

    // Calculate averages
    if (stats.cleanupEvents > 0) {
      stats.avgItemsPerCleanup = Math.round(
        stats.itemsLogged / stats.cleanupEvents
      );
    }

    // Convert Sets to counts
    stats.uniqueSpecies = stats.uniqueSpecies.size;
    stats.deploymentsReviewed = stats.deploymentsReviewed.size;
    stats.uniqueMaterials = stats.uniqueMaterials.size;
    stats.uniqueCategories = stats.uniqueCategories.size;
    stats.locationsMonitored = stats.locationsMonitored.size;
    stats.sitesMonitored = stats.sitesMonitored.size;

    // Update user progress
    let progress = await UserProgress.findOne({ user: user._id });
    if (!progress) {
      progress = new UserProgress({ user: user._id });
    }

    // Update streaks
    progress.streaks = {
      current: currentStreak,
      longest: Math.max(longestStreak, progress.streaks?.longest || 0),
      lastLoginDate: lastLoginDate,
    };

    // Update stats
    Object.assign(progress.stats, stats);

    // Check achievements (which now handles points calculation)
    const newlyEarned = await progress.checkAchievements();

    // Save progress
    await progress.save();

    return { progress, newlyEarned };
  } catch (error) {
    console.error(`Error updating stats for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Updates all users' stats.
 */
async function updateAllUserStats() {
  try {
    const users = await User.find({});
    const results = [];

    for (const user of users) {
      try {
        const progress = await updateUserStats(user._id);
        results.push({ userId: user._id, success: true, progress });
      } catch (error) {
        results.push({
          userId: user._id,
          success: false,
          error: error.message,
        });
      }
    }

    console.log("Successfully processed all users");
    return results;
  } catch (error) {
    console.error("Error updating all user stats:", error);
    throw error;
  }
}

export { updateUserStats, updateAllUserStats };
