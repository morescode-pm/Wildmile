import mongoose from "mongoose";

const PageViewSchema = new mongoose.Schema({
  page: { type: String, required: true },
  enteredAtUtc: { type: Date, default: Date.now },
  authenticated: { type: Boolean, required: true },
});

const TelemetrySessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    anonymousId: { type: String, required: true, index: true },
    isAuthenticated: { type: Boolean, default: false, index: true },
    userIdHash: { type: String, default: null, index: true },
    authenticatedAtUtc: { type: Date, default: null, index: true },
    loggedOutAtUtc: { type: Date, default: null },
    platform: { type: String, required: true, index: true },
    browser: { type: String },
    browserVersion: { type: String },
    deviceType: { type: String },
    screenWidth: { type: Number },
    screenHeight: { type: Number },
    referrer: { type: String },
    appVersion: { type: String },
    timezone: { type: String },
    entryPage: { type: String },
    exitPage: { type: String },
    startedAtUtc: { type: Date, default: Date.now, index: true },
    startedAtLocal: { type: String },
    startedAtCentral: { type: String },
    lastActivityAtUtc: { type: Date, default: Date.now, index: true },
    endedAtUtc: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },
    pageViewCount: { type: Number, default: 0 },
    expired: { type: Boolean, default: false, index: true },
    pageViews: [PageViewSchema],
  },
  {
    timestamps: true,
    collection: "telemetry_sessions",
  }
);

export default mongoose.models.TelemetrySession ||
  mongoose.model("TelemetrySession", TelemetrySessionSchema);
