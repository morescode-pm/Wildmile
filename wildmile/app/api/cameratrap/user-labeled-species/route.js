import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import Species from "models/Species";
import { getSession } from "lib/getSession";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getSession();

    if (!session?._id) {
      return NextResponse.json([]);
    }

    const speciesNames = await getUserLabeledSpecies(session._id);
    const speciesDocs = await resolveSpeciesDocs(speciesNames);

    return NextResponse.json(speciesDocs, {
      headers: {
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching user labeled species:", error);
    return NextResponse.json(
      { error: "Error fetching user labeled species" },
      { status: 500 }
    );
  }
}

async function getUserLabeledSpecies(userId) {
  const results = await Observation.aggregate([
    {
      $match: {
        creator: userId,
        observationType: "animal",
        scientificName: { $exists: true, $ne: "" },
      },
    },
    {
      $group: {
        _id: "$scientificName",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return results.map((r) => r._id);
}

async function resolveSpeciesDocs(speciesNames) {
  if (!speciesNames.length) return [];

  const existing = await Species.find({
    name: { $in: speciesNames },
  }).lean();

  const speciesMap = new Map(existing.map((s) => [s.name.toLowerCase(), s]));

  const missing = speciesNames.filter(
    (name) => !speciesMap.has(name.toLowerCase())
  );

  if (missing.length > 0) {
    const fetched = await Promise.allSettled(
      missing.map((name) => Species.findOrFetchByName(name))
    );
    for (const result of fetched) {
      if (result.status === "fulfilled" && result.value) {
        speciesMap.set(result.value.name.toLowerCase(), result.value);
      }
    }
  }

  return speciesNames
    .map((name) => speciesMap.get(name.toLowerCase()))
    .filter(Boolean);
}
