"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const ACTIVITY_THROTTLE_MS = 60000;
const HEARTBEAT_INTERVAL_MS = 60000;

export function useTelemetry(user) {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState(null);
  const lastActivityRef = useRef(0);
  const isInitializedRef = useRef(false);
  const prevUserRef = useRef(user);

  useEffect(() => {
    // 1. Get or create anonymousId
    let anonymousId = localStorage.getItem("telemetryAnonymousId");
    if (!anonymousId) {
      anonymousId = crypto.randomUUID();
      localStorage.setItem("telemetryAnonymousId", anonymousId);
    }

    const startSession = async () => {
      const data = {
        anonymousId,
        userId: user?._id,
        platform: "web",
        entryPage: window.location.pathname,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localTime: new Date().toLocaleString(),
        browser: navigator.userAgent,
        browserVersion: navigator.appVersion,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        referrer: document.referrer,
        appVersion: "1.0.0", // Hardcoded or pulled from config
      };

      try {
        const response = await fetch("/api/telemetry/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result.sessionId) {
          setSessionId(result.sessionId);
          localStorage.setItem("telemetrySessionId", result.sessionId);
        }
      } catch (error) {
        console.error("Failed to start telemetry session:", error);
      }
    };

    if (!isInitializedRef.current) {
      startSession();
      isInitializedRef.current = true;
    }

    // Heartbeat
    const heartbeatInterval = setInterval(() => {
      const currentSessionId = localStorage.getItem("telemetrySessionId");
      if (currentSessionId) {
        fetch("/api/telemetry/session/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: currentSessionId }),
        });
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(heartbeatInterval);
  }, []); // Only on mount

  // Track route changes
  useEffect(() => {
    const currentSessionId = localStorage.getItem("telemetrySessionId");
    if (currentSessionId && pathname) {
      fetch("/api/telemetry/session/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          page: pathname,
          authenticated: !!user,
        }),
      });
    }
  }, [pathname, user]);

  // Track activity
  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > ACTIVITY_THROTTLE_MS) {
        const currentSessionId = localStorage.getItem("telemetrySessionId");
        if (currentSessionId) {
          fetch("/api/telemetry/session/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: currentSessionId,
              currentPage: window.location.pathname,
            }),
          });
          lastActivityRef.current = now;
        }
      }
    };

    const events = ["click", "scroll", "mousemove", "keydown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, []);

  // Sync auth state changes
  useEffect(() => {
    const currentSessionId = localStorage.getItem("telemetrySessionId");
    if (!currentSessionId) return;

    if (!prevUserRef.current && user) {
      // Logged in
      fetch("/api/telemetry/session/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSessionId, userId: user._id }),
      });
    } else if (prevUserRef.current && !user) {
      // Logged out
      fetch("/api/telemetry/session/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSessionId }),
      });
    }

    prevUserRef.current = user;
  }, [user]);

  return { sessionId };
}
