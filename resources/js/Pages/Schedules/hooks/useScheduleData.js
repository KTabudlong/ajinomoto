import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Custom hook for managing schedule data
 * @param {Object} options - Configuration options
 * @param {Array} options.months - Array of months to fetch (default: current and next month)
 * @param {boolean} options.autoFetch - Whether to fetch data automatically on mount (default: true)
 * @returns {Object} - Schedule data, loading state, error state, and refetch function
 */
export const useScheduleData = ({ months = null, autoFetch = true } = {}) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default to current and next month if not specified
  const getDefaultMonths = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return [
      {
        year: currentYear,
        month: currentMonth,
        start: new Date(currentYear, currentMonth, 1)
          .toISOString()
          .slice(0, 10),
        end: new Date(currentYear, currentMonth + 1, 0)
          .toISOString()
          .slice(0, 10),
      },
      {
        year: currentYear,
        month: currentMonth + 1,
        start: new Date(currentYear, currentMonth + 1, 1)
          .toISOString()
          .slice(0, 10),
        end: new Date(currentYear, currentMonth + 2, 0)
          .toISOString()
          .slice(0, 10),
      },
    ];
  };

  const fetchScheduleData = async (customMonths = null) => {
    setLoading(true);
    setError(null);

    try {
      const monthsToFetch = customMonths || months || getDefaultMonths();

      const promises = monthsToFetch.map((month) =>
        axios.get("/api/schedules", {
          params: { start: month.start, end: month.end },
        }),
      );

      const responses = await Promise.all(promises);

      const allSchedules = responses.flatMap(
        (response) => response.data.data || response.data || [],
      );

      setSchedules(allSchedules);
    } catch (err) {
      console.error("Error fetching schedule data:", err);
      setError("Failed to load schedule data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchScheduleData();
    }
  }, [autoFetch]);

  return {
    schedules,
    loading,
    error,
    refetch: fetchScheduleData,
    setSchedules,
  };
};
