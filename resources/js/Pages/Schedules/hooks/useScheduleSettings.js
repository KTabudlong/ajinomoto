import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Custom hook for managing schedule settings data
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch data automatically on mount (default: true)
 * @returns {Object} - Schedule settings data, loading state, error state, and refetch function
 */
export const useScheduleSettings = ({ autoFetch = true } = {}) => {
  const [settings, setSettings] = useState({
    timeSlots: [],
    dayColors: {},
    timeFormat: "12h", // Changed from '12h' to '12h'
    slotDuration: 60,
    timeBuffer: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all settings in parallel
      const [timeSlotsRes, dayColorsRes, timeFormatRes, slotDurationRes, timeBufferRes] =
        await Promise.all([
          axios.get("/api/schedule-settings/time-slots"),
          axios.get("/api/schedule-settings/day-colors"),
          axios.get("/api/schedule-settings/time-format"),
          axios.get("/api/schedule-settings/slot-duration"),
          axios.get("/api/schedule-settings/time-buffer"),
        ]);

      // Extract time slots - convert array of objects to array of time strings
      const timeSlots =
        timeSlotsRes.data && Array.isArray(timeSlotsRes.data)
          ? timeSlotsRes.data.map((slot) => slot.start_time)
          : [];

      // Extract day colors - should be an object with day_of_week as keys
      const dayColors = dayColorsRes.data || {};

      // Extract time format - should be { format: '12h' }
      const timeFormat =
        timeFormatRes.data && timeFormatRes.data.format
          ? timeFormatRes.data.format
          : "12h"; // Changed from '24h' to '12h'

      // Extract slot duration - should be { duration_minutes: 60 }
      const slotDuration =
        slotDurationRes.data && slotDurationRes.data.duration_minutes
          ? slotDurationRes.data.duration_minutes
          : 60;

      // Extract time buffer - should be { buffer_hours: 3 }
      const timeBuffer =
        timeBufferRes.data && timeBufferRes.data.buffer_hours
          ? timeBufferRes.data.buffer_hours
          : 3;

      setSettings({
        timeSlots,
        dayColors,
        timeFormat,
        slotDuration,
        timeBuffer,
      });
    } catch (err) {
      console.error("Error fetching schedule settings:", err);
      setError("Failed to load schedule settings. Using defaults.");

      // Set default values on error
      setSettings({
        timeSlots: [
          "07:00",
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
        ],
        dayColors: {
          0: "#6366F1", // Sunday - Indigo
          1: "#3B82F6", // Monday - Blue
          2: "#F59E0B", // Tuesday - Yellow
          3: "#10B981", // Wednesday - Green
          4: "#F97316", // Thursday - Orange
          5: "#EC4899", // Friday - Pink
          6: "#8B5CF6", // Saturday - Purple
        },
        timeFormat: "12h", // Changed from '12h' to '12h'
        slotDuration: 60,
        timeBuffer: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchSettings();
    }
  }, [autoFetch]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    setSettings,
  };
};
