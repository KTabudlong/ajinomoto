import React, { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  isSameMonth,
  getWeek,
  isWithinInterval,
} from "date-fns";

const WeekSelector = ({
  selectedMonth,
  selectedWeek,
  onWeekSelect,
  className = "",
}) => {
  // Generate week pills for the selected month
  const weekPills = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);

    // Find the first week that contains any part of the month
    // Use Monday as start of week for consistency with ISO standard
    let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday

    // Don't skip the first week if it's in the previous month - include it if it overlaps
    // This ensures week 31 (July 28 - Aug 3) is included for August

    const weeks = [];

    // Generate weeks until we're past the month
    while (currentWeekStart <= monthEnd) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 }); // Monday start

      // Calculate ISO week number using Monday start for consistency
      const isoWeekNumber = getWeek(currentWeekStart, { weekStartsOn: 1 }); // Monday start for ISO

      // Include weeks that have any overlap with the selected month
      // A week overlaps if it contains any day from the selected month
      const weekOverlapsMonth =
        (currentWeekStart <= monthEnd && weekEnd >= monthStart) ||
        (currentWeekStart >= monthStart && currentWeekStart <= monthEnd) ||
        (weekEnd >= monthStart && weekEnd <= monthEnd);

      if (weekOverlapsMonth) {
        const isCurrent =
          selectedWeek &&
          isWithinInterval(selectedWeek, {
            start: currentWeekStart,
            end: weekEnd,
          });

        weeks.push({
          id: `week-${isoWeekNumber}`,
          start: currentWeekStart,
          end: weekEnd,
          weekNumber: isoWeekNumber,
          label: `Week ${isoWeekNumber}: ${format(
            currentWeekStart,
            "MMM d",
          )} - ${format(weekEnd, "MMM d")}`,
          isCurrentWeek: isCurrent,
        });
      }

      currentWeekStart = addWeeks(currentWeekStart, 1);
    }

    return weeks;
  }, [selectedMonth, selectedWeek]);

  const handleWeekClick = (week) => {
    // Set the selected week to the start of the week for more reliable boundary detection
    onWeekSelect(week.start);
  };

  if (weekPills.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {weekPills.map((week) => (
        <button
          key={week.id}
          onClick={() => handleWeekClick(week)}
          className={`px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
            week.isCurrentWeek
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
          }`}
          aria-label={`Select ${week.label}`}
        >
          {week.label}
        </button>
      ))}
    </div>
  );
};

export default WeekSelector;
