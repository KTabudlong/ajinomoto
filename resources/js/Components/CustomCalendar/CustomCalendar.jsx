import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import { format, isSameDay } from "date-fns";
import { scheduleUtils, colorUtils, getBufferInfo } from "@/Pages/Schedules/utils";
import "react-calendar/dist/Calendar.css";

const CustomCalendar = ({
  // Date selection
  selectedDates = [],
  onDateSelect = null,

  // Schedule data
  schedules = [],
  settings = {},

  // Calendar configuration
  minDate = new Date(),
  maxDate = null,
  className = "w-full",

  // Display options
  showTooltips = true,
  showScheduleDots = true,
  showDayColors = true,

  // Interaction handlers
  onMonthChange = null,
  onDateHover = null,

  // Custom styling
  tileContent = null,
  tileClassName = null,

  // Accessibility
  ariaLabel = "Calendar",

  // Mode-specific props
  mode = "create", // "create", "edit", "view"
  scheduleType = "single", // "single", "weekly", "monthly"
  originalDates = [],

  // Weekly-specific props
  weekDates = [],
  displayedMonth = null,
  displayedYear = null,

  // Ref forwarding
  calendarRef = null,
}) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  const internalCalendarRef = useRef(null);
  const finalCalendarRef = calendarRef || internalCalendarRef;

  // Extract settings with fallbacks
  const { dayColors = {}, timeFormat = "12h" } = settings;

  // Add CSS styles to override React Calendar's default styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .selected-date {
        background-color: #c7d2fe !important; /* Darker indigo background */
        border-color: #6366f1 !important;
        color: #1e293b !important;
      }
      .next-month-date {
        box-shadow: 0 0 0 2px #c084fc !important; /* Purple ring for dates from different month than displayed */
      }
      .disabled-date {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
      .added-date {
        background-color: #10b981 !important; /* green-500 */
        border-color: #059669 !important;
        color: white !important;
      }
      .removed-date {
        background-color: #ef4444 !important; /* red-500 */
        border-color: #dc2626 !important;
        color: white !important;
      }
      .unchanged-date {
        background-color: #6b7280 !important; /* gray-500 */
        border-color: #4b5563 !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any remaining state
    };
  }, []);

  // Update tooltip when hoveredDate changes
  useEffect(() => {
    if (hoveredDate && showTooltips && onDateHover) {
      const content = getTooltipContent();
      onDateHover(hoveredDate, content);
    } else if (!hoveredDate && onDateHover) {
      onDateHover(null, null);
    }
  }, [hoveredDate, showTooltips, onDateHover]);

  // Default calendar tile content to show red dots for dates with existing schedules
  const defaultTileContent = ({ date }) => {
    if (!showScheduleDots) return null;

    const matches = schedules.filter((sched) => {
      const schedStart = new Date(sched.start_time);
      const schedEnd = new Date(sched.end_time);
      return (
        scheduleUtils.startOfDay(date) >=
          scheduleUtils.startOfDay(schedStart) &&
        scheduleUtils.startOfDay(date) <= scheduleUtils.startOfDay(schedEnd)
      );
    });

    return (
      <div
        className="w-full h-full flex items-center justify-center cursor-pointer"
        onMouseEnter={() => matches.length > 0 && handleDateHover(date)}
        onMouseLeave={() => matches.length > 0 && handleDateHover(null)}
        onFocus={() => matches.length > 0 && handleDateHover(date)}
        onBlur={() => matches.length > 0 && handleDateHover(null)}
        onClick={() => matches.length > 0 && handleDateHover(date)}
        tabIndex={0}
        aria-label={matches.length > 0 ? "Scheduled" : undefined}
      >
        {matches.length > 0 && (
          <span className="block w-2 h-2 rounded-full bg-red-400" />
        )}
      </div>
    );
  };

  // Default date selection handler
  const handleDateSelect = (date) => {
    if (!onDateSelect) return;



    // Ensure we have a valid Date object
    let validDate = null;
    if (date instanceof Date) {
      validDate = date;
    } else if (Array.isArray(date) && date.length > 0) {
      // react-calendar sometimes passes an array
      validDate = date[0] instanceof Date ? date[0] : new Date(date[0]);
    } else if (typeof date === "string") {
      validDate = new Date(date);
    } else {
      console.warn('Invalid date received:', date);
      return;
    }

    // Validate the date
    if (!validDate || isNaN(validDate.getTime())) {
      console.warn('Invalid date after conversion:', date);
      return;
    }

    // Helper function to ensure we have Date objects
    const ensureDateObject = (d) => {
      if (d instanceof Date) return d;
      if (typeof d === "string") {
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    };

    // Check if today is blocked by buffer before allowing selection
    const today = new Date();
    const isToday = validDate.toDateString() === today.toDateString();
    
    // Only apply buffer restriction if the selected date is today
    if (isToday && settings.timeBuffer && settings.timeSlots && settings.slotDuration) {
      const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
      if (!bufferInfo.isTodayBookable) {
        // Don't allow selection of today when buffer blocks it
        return;
      }
    }

    if (scheduleType === "single") {
      onDateSelect([validDate]);
    } else if (scheduleType === "weekly") {
      // For weekly schedules, handle like legacy: select all available dates in the week
      onDateSelect(validDate);
    } else {
      // For other types, toggle selection
      const exists = selectedDates.some((d) => {
        const dateObj = ensureDateObject(d);
        return dateObj && dateObj.toDateString() === validDate.toDateString();
      });
      if (exists) {
        onDateSelect(
          selectedDates
            .filter((d) => {
              const dateObj = ensureDateObject(d);
              return !dateObj || dateObj.toDateString() !== validDate.toDateString();
            })
            .filter((d) => ensureDateObject(d) !== null), // Remove any null values
        );
      } else {
        onDateSelect([...selectedDates, validDate]);
      }
    }
  };

  // Handle calendar month navigation
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    if (onMonthChange && activeStartDate && activeStartDate instanceof Date && !isNaN(activeStartDate.getTime())) {
      onMonthChange({
        month: activeStartDate.getMonth(),
        year: activeStartDate.getFullYear(),
        date: activeStartDate,
      });
    }
  };

  // Check if date is selectable
  const isDateSelectable = (date) => {
    // Ensure we have a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    
    // Disable past dates
    if (date < new Date().setHours(0, 0, 0, 0)) return false;
    
    // Check if today is still bookable considering time buffer
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    // Only apply buffer restriction if the date is today
    if (isToday && settings.timeBuffer && settings.timeSlots && settings.slotDuration) {
      const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
      
      // If today is not bookable due to buffer, disable it
      if (!bufferInfo.isTodayBookable) {
        return false;
      }
    }
    
    return true;
  };

  // Default calendar tile className for styling
  const defaultTileClassName = ({ date }) => {
    let isSelected = false;
    let isNextMonth = false;
    let status = "none";

    // Helper function to ensure we have Date objects
    const ensureDateObject = (d) => {
      if (d instanceof Date) return d;
      if (typeof d === "string") {
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    };

    if (scheduleType === "weekly") {
      // For weekly schedules, use selectedDates (like legacy) - not selectedDays
      isSelected = selectedDates.some((d) => {
        const dateObj = ensureDateObject(d);
        return dateObj && isSameDay(dateObj, date);
      });

      // Check if this is a different month than the currently displayed month
      const dateMonth = date.getMonth();
      const dateYear = date.getFullYear();
      const currentDisplayedMonth = displayedMonth ?? new Date().getMonth();
      const currentDisplayedYear = displayedYear ?? new Date().getFullYear();

      // Date is from a different month if it's not the same as the displayed month
      isNextMonth =
        dateMonth !== currentDisplayedMonth ||
        dateYear !== currentDisplayedYear;
    } else {
      // For other schedule types, check selectedDates
      isSelected = selectedDates.some((d) => {
        const dateObj = ensureDateObject(d);
        return dateObj && dateObj.toDateString() === date.toDateString();
      });
    }

    // Determine status for edit mode
    if (mode === "edit") {
      const isOriginal = originalDates.some((d) => {
        const dateObj = ensureDateObject(d);
        return dateObj && isSameDay(dateObj, date);
      });
      if (isSelected && isOriginal) {
        status = "unchanged";
      } else if (isSelected && !isOriginal) {
        status = "added";
      } else if (!isSelected && isOriginal) {
        status = "removed";
      }
    }

    const isDisabled = !isDateSelectable(date);

    let className = "";
    if (isSelected && mode !== "edit") {
      className += " selected-date ";
      if (isNextMonth) {
        className += " next-month-date ";
      }
    }

    // Add status-based classes for edit mode
    if (mode === "edit") {
      if (status === "added") className += " added-date ";
      else if (status === "removed") className += " removed-date ";
      else if (status === "unchanged") className += " unchanged-date ";
      else if (isSelected) className += " selected-date ";
    }

    if (isDisabled) className += " disabled-date ";

    return className;
  };

  // Get tooltip content for hovered date
  const getTooltipContent = () => {
    if (!hoveredDate) return "";

    const daySchedules = schedules.filter((sched) => {
      const schedStart = new Date(sched.start_time);
      const schedEnd = new Date(sched.end_time);
      return (
        scheduleUtils.startOfDay(hoveredDate) >=
          scheduleUtils.startOfDay(schedStart) &&
        scheduleUtils.startOfDay(hoveredDate) <=
          scheduleUtils.startOfDay(schedEnd)
      );
    });

    if (daySchedules.length === 0) {
      return `No schedules on ${format(hoveredDate, "MMM d, yyyy")}`;
    }

    const scheduleInfo = daySchedules
      .map((sched, i) => {
        const startTime = new Date(sched.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: timeFormat === "12h",
        });
        const endTime = new Date(sched.end_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: timeFormat === "12h",
        });
        return `${startTime} - ${endTime}`;
      })
      .join(", ");

    return `${format(hoveredDate, "MMM d, yyyy")}: ${scheduleInfo}`;
  };

  // Handle custom schedule hover events
  const handleDateHover = (date, event) => {
    if (showTooltips && date && date instanceof Date && !isNaN(date.getTime())) {
      setHoveredDate(date);

      // Call parent's onDateHover with date and content
      if (onDateHover) {
        const content = getTooltipContent();
        onDateHover(date, content);
      }
    } else {
      setHoveredDate(null);

      // Call parent's onDateHover with null to hide tooltip
      if (onDateHover) {
        onDateHover(null, null);
      }
    }
  };

  // Handle mouse leave to hide tooltip
  const handleMouseLeave = () => {
    setHoveredDate(null);

    // Call parent's onDateHover with null to hide tooltip
    if (onDateHover) {
      onDateHover(null, null);
    }
  };

  // Determine calendar value based on schedule type
  const getCalendarValue = () => {
    // Helper function to ensure we have Date objects
    const ensureDateObject = (d) => {
      if (d instanceof Date) return d;
      if (typeof d === "string") {
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    };

    if (scheduleType === "single") {
      const firstDate = selectedDates[0];
      const dateObj = firstDate ? ensureDateObject(firstDate) : null;
      return dateObj;
    } else if (scheduleType === "weekly") {
      return null; // Weekly doesn't use value prop
    } else {
      return selectedDates
        .map((d) => ensureDateObject(d))
        .filter((d) => d !== null);
    }
  };

  // Custom tile content with mouse events
  const customTileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const baseContent = defaultTileContent({ date, view });

    return (
      <div
        className="w-full h-full flex items-center justify-center cursor-pointer"
        onMouseEnter={(e) => {
          if (showTooltips && isDateSelectable(date)) {
            handleDateHover(date, e);
          }
        }}
        onMouseLeave={() => {
          if (showTooltips) {
            handleMouseLeave();
          }
        }}
      >
        {baseContent}
      </div>
    );
  };

  return (
    <div className="relative">
      <Calendar
        onChange={handleDateSelect}
        value={getCalendarValue()}
        tileContent={tileContent || customTileContent}
        tileClassName={tileClassName || defaultTileClassName}
        minDate={minDate}
        maxDate={maxDate}
        className={className}
        onActiveStartDateChange={handleActiveStartDateChange}
        ref={finalCalendarRef}
        aria-label={ariaLabel}
      />
    </div>
  );
};

export default CustomCalendar;
