"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseChatTimerOptions {
  bookedDate: string | null;
  bookedTime: string | null;
  slotDuration: number | null;
  chatStatus: string;
  enabled?: boolean;
}

interface UseChatTimerReturn {
  /** Time remaining in ms, null if no session time set */
  timeRemaining: number | null;
  /** Formatted countdown string e.g. "1h 23m 45s" */
  formattedTime: string | null;
  /** Whether the session has expired */
  isExpired: boolean;
  /** Whether we're within 30 minutes of expiry */
  isWarning: boolean;
  /** Whether the 30-min warning just triggered (true for one tick) */
  warningTriggered: boolean;
  /** The session end time as a Date, null if not calculable */
  sessionEndTime: Date | null;
}

/**
 * Parses booked_time like "09:00-09:30" and returns end time portion
 */
function parseEndTime(
  bookedTime: string,
): { hours: number; minutes: number } | null {
  const parts = bookedTime.split("-");
  if (parts.length !== 2) return null;
  const endPart = parts[1].trim();
  const [hours, minutes] = endPart.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return { hours, minutes };
}

/**
 * Parses booked_time like "09:00-09:30" and returns start time portion
 */
function parseStartTime(
  bookedTime: string,
): { hours: number; minutes: number } | null {
  const parts = bookedTime.split("-");
  if (parts.length < 1) return null;
  const startPart = parts[0].trim();
  const [hours, minutes] = startPart.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return { hours, minutes };
}

/**
 * Calculate session end time from booking data
 */
function calculateSessionEnd(
  bookedDate: string | null,
  bookedTime: string | null,
  slotDuration: number | null,
): Date | null {
  if (!bookedDate) return null;

  // If we have a booked_time range like "09:00-09:30", use the end time
  if (bookedTime) {
    const endTime = parseEndTime(bookedTime);
    if (endTime) {
      const end = new Date(`${bookedDate}T00:00:00`);
      end.setHours(endTime.hours, endTime.minutes, 0, 0);
      return end;
    }

    // If booked_time has a start time and we have duration, calculate end
    const startTime = parseStartTime(bookedTime);
    if (startTime && slotDuration) {
      const end = new Date(`${bookedDate}T00:00:00`);
      end.setHours(startTime.hours, startTime.minutes, 0, 0);
      end.setMinutes(end.getMinutes() + slotDuration);
      return end;
    }
  }

  // If we only have date and duration but no time, can't determine exact end
  return null;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "0s";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

const THIRTY_MINUTES = 30 * 60 * 1000;

export function useChatTimer({
  bookedDate,
  bookedTime,
  slotDuration,
  chatStatus,
  enabled = true,
}: UseChatTimerOptions): UseChatTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [warningTriggered, setWarningTriggered] = useState(false);
  const warningFiredRef = useRef(false);

  const sessionEndTime = calculateSessionEnd(
    bookedDate,
    bookedTime,
    slotDuration,
  );

  const isActiveChat = chatStatus === "active" || chatStatus === "pending";

  const tick = useCallback(() => {
    if (!sessionEndTime || !isActiveChat || !enabled) {
      setTimeRemaining(null);
      return;
    }

    const now = Date.now();
    const remaining = sessionEndTime.getTime() - now;
    setTimeRemaining(remaining);

    // Fire warning once when crossing 30-min threshold
    if (
      remaining > 0 &&
      remaining <= THIRTY_MINUTES &&
      !warningFiredRef.current
    ) {
      warningFiredRef.current = true;
      setWarningTriggered(true);
      // Reset trigger after a tick so consumers can catch the edge
      setTimeout(() => setWarningTriggered(false), 100);
    }
  }, [sessionEndTime, isActiveChat, enabled]);

  useEffect(() => {
    tick(); // initial
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const isExpired = timeRemaining !== null && timeRemaining <= 0;
  const isWarning =
    timeRemaining !== null &&
    timeRemaining > 0 &&
    timeRemaining <= THIRTY_MINUTES;

  return {
    timeRemaining,
    formattedTime:
      timeRemaining !== null
        ? formatTimeRemaining(Math.max(0, timeRemaining))
        : null,
    isExpired,
    isWarning,
    warningTriggered,
    sessionEndTime,
  };
}
