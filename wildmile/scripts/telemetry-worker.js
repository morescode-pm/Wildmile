const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

// Setup Mongoose with absolute paths for models if necessary or use require
// Since we are using ES modules in the main app, this standalone script might need adjustment
// or we use 'esm' loader.

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in environment.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Import model and worker logic
  // Using dynamic import since the project uses ES modules
  const { expireInactiveSessions } = await import("../lib/telemetry/worker.js");
  const TelemetrySession = (await import("../models/TelemetrySession.js")).default;

  try {
    await expireInactiveSessions();
    console.log("Session expiration job completed successfully.");
  } catch (error) {
    console.error("Error running session expiration job:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
