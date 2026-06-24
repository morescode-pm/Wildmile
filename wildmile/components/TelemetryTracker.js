"use client";

import { useTelemetry } from "/hooks/useTelemetry";
import { useUser } from "/lib/hooks";

export default function TelemetryTracker() {
  const { user } = useUser();
  useTelemetry(user);
  return null;
}
