// Schedule utility functions
// This file exports utility functions for schedule-related operations

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  getISOWeek,
  getWeekOfMonth,
  isAfter,
  isSameDay,
  startOfDay,
} from "date-fns";

// Export time buffer utilities
export * from './timeBufferUtils';

// Default fallback values (used when API fails)
export const DEFAULT_DAY_COLORS = {
  0: "#6366F1", // Sunday - Indigo
  1: "#3B82F6", // Monday - Blue
  2: "#F59E0B", // Tuesday - Yellow
  3: "#10B981", // Wednesday - Green
  4: "#F97316", // Thursday - Orange
  5: "#EC4899", // Friday - Pink
  6: "#8B5CF6", // Saturday - Purple
};

export const DEFAULT_TIME_SLOTS = [
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
];

export const DEFAULT_TIME_FORMAT = "12h"; // Changed from '24h' to '12h'
export const DEFAULT_SLOT_DURATION = 60;

// Schedule type descriptions
export const SCHEDULE_TYPE_DESCRIPTIONS = {
  single: "A single session on a specific date and time.",
  weekly:
    "Choose a week (one) to create a schedule with. Starts at Monday, ends with Sunday (selects only available dates).",
  monthly: "Repeats on selected days each month (e.g., every 2nd Monday).",
};

// Weekly utility functions (from legacy)
export const weeklyUtils = {
  /**
   * Get all dates (Mon-Sun) for the week of the given date
   */
  getWeekDates: (date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = addDays(weekStart, 6); // Sunday
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  },

  /**
   * Get week number using ISO week
   */
  getWeekNumber: (date) => {
    return getISOWeek(date);
  },

  /**
   * Get month ordinal (e.g., 3rd week of July)
   */
  getMonthOrdinal: (date) => {
    const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
    const ordinals = ["1st", "2nd", "3rd", "4th", "5th"]; // up to 5 weeks
    return ordinals[weekOfMonth - 1] || `${weekOfMonth}th`;
  },

  /**
   * Get remaining weekdays from a given date
   */
  getRemainingWeekdays: (date) => {
    const week = weeklyUtils.getWeekDates(date);
    const todayIdx = week.findIndex((d) => isSameDay(d, date));
    // Only include Mon-Fri (1-5), and only days >= today
    return week
      .slice(todayIdx)
      .filter(
        (d) =>
          d.getDay() >= 1 &&
          d.getDay() <= 5 &&
          (isAfter(d, startOfDay(new Date())) ||
            isSameDay(d, startOfDay(new Date()))),
      );
  },
};

// Color utility functions
export const colorUtils = {
  // Schedule type colors with accessibility considerations
  scheduleTypeColors: {
    single: {
      primary: "#3b82f6", // Blue
      light: "#dbeafe", // Light blue for hover
      dark: "#1e40af", // Dark blue for contrast
      text: "#ffffff", // White text for contrast
    },
    weekly: {
      primary: "#10b981", // Green
      light: "#d1fae5", // Light green for hover
      dark: "#047857", // Dark green for contrast
      text: "#ffffff", // White text for contrast
    },
    monthly: {
      primary: "#f59e0b", // Orange
      light: "#fed7aa", // Light orange for hover
      dark: "#d97706", // Dark orange for contrast
      text: "#ffffff", // White text for contrast
    },
  },

  // Accessibility-friendly color indicators for color blindness
  scheduleTypeIndicators: {
    single: "●", // Circle
    weekly: "■", // Square
    monthly: "◆", // Diamond
  },

  /**
   * Get schedule type colors
   */
  getScheduleTypeColors: (type) => {
    return (
      colorUtils.scheduleTypeColors[type] ||
      colorUtils.scheduleTypeColors.single
    );
  },

  /**
   * Get schedule type indicator
   */
  getScheduleTypeIndicator: (type) => {
    return (
      colorUtils.scheduleTypeIndicators[type] ||
      colorUtils.scheduleTypeIndicators.single
    );
  },

  /**
   * Convert hex color to Tailwind class (approximate mapping)
   */
  hexToTailwind: (hex) => {
    const colorMap = {
      "#3B82F6": "bg-blue-500", // Blue
      "#EF4444": "bg-red-500", // Red
      "#10B981": "bg-green-500", // Green
      "#F59E0B": "bg-yellow-500", // Yellow
      "#8B5CF6": "bg-purple-500", // Purple
      "#F97316": "bg-orange-500", // Orange
      "#EC4899": "bg-pink-500", // Pink
      "#6366F1": "bg-indigo-500", // Indigo
      "#06B6D4": "bg-cyan-500", // Cyan
      "#84CC16": "bg-lime-500", // Lime
      "#F43F5E": "bg-rose-500", // Rose
      "#A855F7": "bg-violet-500", // Violet
    };
    return colorMap[hex] || "bg-gray-500";
  },

  /**
   * Get CSS style for hex color
   */
  hexToStyle: (hex) => {
    return { backgroundColor: hex };
  },

  /**
   * Validate hex color format
   */
  isValidHex: (hex) => {
    return /^#[0-9A-F]{6}$/i.test(hex);
  },

  /**
   * Get day colors with fallback to defaults
   */
  getDayColors: (apiColors = null) => {
    return apiColors || DEFAULT_DAY_COLORS;
  },

  /**
   * Get day colors as Tailwind classes
   */
  getDayColorsTailwind: (apiColors = null) => {
    const colors = apiColors || DEFAULT_DAY_COLORS;
    const tailwindColors = {};

    Object.keys(colors).forEach((day) => {
      tailwindColors[day] = colorUtils.hexToTailwind(colors[day]);
    });

    return tailwindColors;
  },
};

// Time utility functions
export const timeUtils = {
  /**
   * Get time slots with fallback to defaults
   */
  getTimeSlots: (apiTimeSlots = null) => {
    return apiTimeSlots || DEFAULT_TIME_SLOTS;
  },

  /**
   * Get time format with fallback to defaults
   */
  getTimeFormat: (apiTimeFormat = null) => {
    return apiTimeFormat || DEFAULT_TIME_FORMAT;
  },

  /**
   * Get slot duration with fallback to defaults
   */
  getSlotDuration: (apiSlotDuration = null) => {
    return apiSlotDuration || DEFAULT_SLOT_DURATION;
  },

  /**
   * Format time based on user's time format preference
   */
  formatTime: (time, format = "12h") => {
    if (!time) return "";

    if (format === "12h") {
      // Convert 24h to 12h format
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }

    return time; // Return as-is for 24h format
  },

  /**
   * Convert 12h time to 24h format
   */
  to24Hour: (time12h) => {
    if (!time12h) return "";

    const [time, period] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  },
};

// Schedule conflict detection utilities
export const scheduleUtils = {
  /**
   * Helper function for startOfDay
   */
  startOfDay: (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },

  /**
   * SSOT: Get canonical array of selected dates for backend submission and UI logic
   * @param {string} scheduleType - The schedule type (single, weekly, monthly, custom)
   * @param {Object} state - Current state object containing all relevant state
   * @returns {Array} - Array of selected dates
   */
  getCurrentSelectedDates: (scheduleType, state) => {
    const {
      data,
      selectedDays,
      weekDates,
      selectedDates,
      loadedMonths = {},
    } = state;

    if (scheduleType === "single") {
      return data?.date ? [data.date] : [];
    }
    if (scheduleType === "weekly") {
      // If selectedDates is already populated, use it (this is what we set in handleWeeklyDateSelect)
      // This ensures React Calendar gets the correct dates for visual indicators
      if (selectedDates && selectedDates.length > 0) {
        return selectedDates;
      }

      // Fallback: recalculate based on selectedDays (for backward compatibility)
      const now = scheduleUtils.startOfDay(new Date());
      return weekDates.filter((d) => {
        if (d < now) return false;
        
        // Check if today is blocked by buffer
        const isToday = scheduleUtils.startOfDay(d).getTime() === scheduleUtils.startOfDay(now).getTime();
        if (isToday && state.settings?.timeBuffer && state.settings?.timeSlots && state.settings?.slotDuration) {
          const bufferInfo = getBufferInfo(state.settings.timeBuffer, state.settings.timeSlots, state.settings.slotDuration);
          if (!bufferInfo.isTodayBookable) {
            return false; // Filter out today if buffer blocks it
          }
        }
        
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const scheduled = (loadedMonths[monthStr] || []).some((sched) => {
          const schedStart = new Date(sched.start_time);
          const schedEnd = new Date(sched.end_time);
          return (
            scheduleUtils.startOfDay(d) >=
              scheduleUtils.startOfDay(schedStart) &&
            scheduleUtils.startOfDay(d) <= scheduleUtils.startOfDay(schedEnd)
          );
        });
        if (scheduled) return false;
        return selectedDays.includes(d.getDay());
      });
    }
    if (scheduleType === "monthly") {
      // For monthly schedules, use selectedDates (SSOT approach)
      return selectedDates.filter((d) => d && !isNaN(d));
    }

    return [];
  },

  /**
   * SSOT: Check if there are valid selected dates
   * @param {string} scheduleType - The schedule type
   * @param {Object} state - Current state object
   * @returns {boolean} - True if there are valid selected dates
   */
  hasValidSelectedDates: (scheduleType, state) => {
    return (
      scheduleUtils.getCurrentSelectedDates(scheduleType, state).length > 0
    );
  },

  /**
   * SSOT: Get the primary selected date (for single schedules or first date for others)
   * @param {string} scheduleType - The schedule type
   * @param {Object} state - Current state object
   * @returns {Date|null} - The primary selected date
   */
  getPrimarySelectedDate: (scheduleType, state) => {
    const selectedDates = scheduleUtils.getCurrentSelectedDates(
      scheduleType,
      state,
    );
    return selectedDates.length > 0 ? selectedDates[0] : null;
  },

  /**
   * SSOT: Get available time slots for a given date
   * @param {Date} date - The date to check
   * @param {Array} timeSlots - Available time slots
   * @param {Array} schedules - Existing schedules
   * @returns {Array} - Available time slots
   */
  getAvailableTimeSlots: (date, timeSlots = [], schedules = []) => {
    if (!date || !timeSlots || timeSlots.length === 0) return [];

    return timeSlots.filter(
      (time) => !scheduleUtils.isStartTimeDisabled(time, date, schedules),
    );
  },

  /**
   * SSOT: Get valid end times based on selected start time
   * @param {Date} date - The date
   * @param {string} startTime - Selected start time
   * @param {Array} timeSlots - Available time slots
   * @param {Array} schedules - Existing schedules
   * @returns {Array} - Valid end times
   */
  getValidEndTimes: (date, startTime, timeSlots = [], schedules = []) => {
    if (!startTime || !date || !timeSlots || timeSlots.length === 0) return [];

    return timeSlots.filter(
      (time) =>
        time > startTime &&
        !scheduleUtils.isEndTimeDisabled(time, date, startTime, schedules),
    );
  },

  /**
   * SSOT: Get unavailable time ranges for a date
   * @param {Date} date - The date to check
   * @param {Array} schedules - Existing schedules
   * @returns {Array} - Array of [start, end] time ranges
   */
  getUnavailableTimeRanges: (date, schedules = []) => {
    if (!date || !schedules || schedules.length === 0) return [];

    return schedules
      .filter((sched) => {
        const schedDate = new Date(sched.start_time);
        return (
          schedDate.toISOString().slice(0, 10) ===
          date.toISOString().slice(0, 10)
        );
      })
      .map((sched) => [new Date(sched.start_time), new Date(sched.end_time)]);
  },

  /**
   * Check if a date has conflicts with existing schedules
   * @param {Date} date - The date to check
   * @param {Array} schedules - Array of existing schedules
   * @returns {boolean} - True if there's a conflict
   */
  hasConflict: (date, schedules = []) => {
    if (!schedules || schedules.length === 0) return false;

    const dateStr = date.toISOString().slice(0, 10);
    return schedules.some((schedule) => {
      const scheduleDate = new Date(schedule.start_time)
        .toISOString()
        .slice(0, 10);
      return scheduleDate === dateStr;
    });
  },

  /**
   * Check if a time slot is disabled for start time
   * @param {string} time - Time in HH:MM format
   * @param {Date} date - The date to check
   * @param {Array} schedules - Array of existing schedules
   * @returns {boolean} - True if time slot should be disabled
   */
  isStartTimeDisabled: (time, date, schedules = []) => {
    if (!date || !schedules || schedules.length === 0) return false;
    if (typeof time !== "string") return true; // Defensive: disable if not a string

    // Create the slot date using the same timezone as the input date
    const slotDate = new Date(date);
    const [h, m] = time.split(":");
    slotDate.setHours(Number(h), Number(m), 0, 0);

    for (const sched of schedules) {
      const schedStart = new Date(sched.start_time);
      const schedEnd = new Date(sched.end_time);

      // Use startOfDay for date comparison to ensure same timezone
      const slotDateStart = scheduleUtils.startOfDay(slotDate);
      const schedStartDate = scheduleUtils.startOfDay(schedStart);
      const schedEndDate = scheduleUtils.startOfDay(schedEnd);

      // Check if the slot date is the same as the schedule date
      if (slotDateStart.getTime() === schedStartDate.getTime()) {
        // Same date, check time overlap
        const slotTime = slotDate.getTime();
        const schedStartTime = schedStart.getTime();
        const schedEndTime = schedEnd.getTime();

        // Disable if this start time is within an existing schedule
        if (slotTime >= schedStartTime && slotTime < schedEndTime) return true;
      }
    }
    return false;
  },

  /**
   * Check if a time slot is disabled for end time selection
   * @param {string} time - Time in HH:MM format
   * @param {Date} date - The date to check
   * @param {string} selectedStartTime - Currently selected start time
   * @param {Array} schedules - Array of existing schedules
   * @returns {boolean} - True if time slot should be disabled
   */
  isEndTimeDisabled: (time, date, selectedStartTime, schedules = []) => {
    if (!selectedStartTime || !date) return true;

    const slotDate = new Date(date);
    const [h, m] = time.split(":");
    slotDate.setHours(Number(h), Number(m), 0, 0);

    const startSlotDate = new Date(date);
    const [startH, startM] = selectedStartTime.split(":");
    startSlotDate.setHours(Number(startH), Number(startM), 0, 0);

    // Must be after start time
    if (slotDate <= startSlotDate) return true;

    // If no schedules, all end times are available
    if (!schedules || schedules.length === 0) return false;

    for (const sched of schedules) {
      const schedStart = new Date(sched.start_time);
      const schedEnd = new Date(sched.end_time);

      // Use startOfDay for date comparison to ensure same timezone
      const slotDateStart = scheduleUtils.startOfDay(slotDate);
      const schedStartDate = scheduleUtils.startOfDay(schedStart);
      const schedEndDate = scheduleUtils.startOfDay(schedEnd);

      // Check if the slot date is the same as the schedule date
      if (slotDateStart.getTime() === schedStartDate.getTime()) {
        // Same date, check time overlap
        const slotTime = slotDate.getTime();
        const schedStartTime = schedStart.getTime();
        const schedEndTime = schedEnd.getTime();

        // For end times, use overlap logic: disable if the time is within an existing schedule
        // (not at the boundary, but within)
        if (slotTime > schedStartTime && slotTime < schedEndTime) return true;
      }
    }
    return false;
  },

  /**
   * Find the earliest available start time for a given date
   * @param {Date} date - The date to check
   * @param {Array} timeSlots - Available time slots
   * @param {Array} schedules - Array of existing schedules
   * @returns {string|null} - Earliest available time or null
   */
  findEarliestAvailableTime: (date, timeSlots = [], schedules = []) => {
    if (!date || !timeSlots || timeSlots.length === 0) return null;

    return timeSlots.find(
      (time) => !scheduleUtils.isStartTimeDisabled(time, date, schedules),
    );
  },

  /**
   * Get schedule information for a specific date
   * @param {Date} date - The date to get info for
   * @param {Array} schedules - Array of existing schedules
   * @param {string} timeFormat - Time format preference
   * @returns {string|null} - Schedule time range or null if no schedule
   */
  getScheduleInfo: (date, schedules = [], timeFormat = "12h") => {
    if (!schedules || schedules.length === 0) return null;

    const dateStr = date.toISOString().slice(0, 10);
    const schedule = schedules.find((s) => {
      const scheduleDate = new Date(s.start_time).toISOString().slice(0, 10);
      return scheduleDate === dateStr;
    });

    if (schedule) {
      const startTime = new Date(schedule.start_time).toLocaleTimeString(
        "en-US",
        {
          hour12: timeFormat === "12h",
          hour: "2-digit",
          minute: "2-digit",
        },
      );
      const endTime = new Date(schedule.end_time).toLocaleTimeString("en-US", {
        hour12: timeFormat === "12h",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${startTime} - ${endTime}`;
    }
    return null;
  },

  /**
   * Format a date for display
   * @param {Date} date - The date to format
   * @returns {string} - Formatted date string
   */
  formatDate: (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  },

  /**
   * Format a schedule for display
   * @param {Object} schedule - The schedule object
   * @param {string} timeFormat - Time format preference
   * @returns {Object} - Formatted schedule info
   */
  formatSchedule: (schedule, timeFormat = "12h") => {
    const date = new Date(schedule.start_time);
    const startTime = new Date(schedule.start_time).toLocaleTimeString(
      "en-US",
      {
        hour12: timeFormat === "12h",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
    const endTime = new Date(schedule.end_time).toLocaleTimeString("en-US", {
      hour12: timeFormat === "12h",
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "short",
      }),
      timeRange: `${startTime} - ${endTime}`,
      fullDate: date,
    };
  },
};
