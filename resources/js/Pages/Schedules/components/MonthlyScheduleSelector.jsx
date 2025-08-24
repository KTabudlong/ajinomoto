import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  format,
  getYear,
  getMonth,
  setYear,
  setMonth,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWeekend,
  getDay,
  startOfDay,
} from "date-fns";
import InfoBox from "@/Components/InfoBox/InfoBox";
import { colorUtils, getBufferInfo } from "@/Pages/Schedules/utils";

const yearsRange = (centerYear, range = 2) => {
  // Only allow current year to current year +2
  const years = [];
  for (let y = centerYear; y <= centerYear + range; y++) years.push(y);
  return years;
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MonthlyScheduleSelector = ({
  existingSchedules = [],
  onMonthSelect,
  onDateSelectionChange,
  selectedYear = new Date().getFullYear(),
  selectedMonth = new Date().getMonth(),
  selectedDaysOfWeek = [1, 2, 3, 4, 5],
  dayColors = {},
  settings = {},
  // Edit mode props
  mode = "create",
  originalData = null,
  scheduleId = null,
}) => {
  const today = new Date();
  const [year, setYearState] = useState(selectedYear || getYear(today));
  const [month, setMonthState] = useState(selectedMonth || getMonth(today));
  const [daysOfWeek, setDaysOfWeek] = useState(selectedDaysOfWeek);
  // SSOT: Track selected dates for edit mode
  const [selectedDates, setSelectedDates] = useState([]);

  // Update internal state when props change
  useEffect(() => {
    setYearState(selectedYear);
    setMonthState(selectedMonth);
  }, [selectedYear, selectedMonth]);

  // All months for the year - disable past months
  const months = useMemo(() => {
    const currentYear = getYear(today);
    const currentMonth = getMonth(today);

    return Array.from({ length: 12 }, (_, i) => ({
      month: i,
      disabled:
        year < currentYear || (year === currentYear && i < currentMonth),
    }));
  }, [year, today]);

  // Follow legacy pattern: filter and map schedules correctly
  const scheduledDates = useMemo(() => {
    // In edit mode, exclude the current batch from conflict checking
    let filteredSchedules = existingSchedules;
    if (mode === "edit" && originalData && originalData.batchId) {
      filteredSchedules = existingSchedules.filter(
        (s) => s.batch_id !== originalData.batchId,
      );
    }

    return filteredSchedules
      .map((s) => {
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}/;
        if (
          !s.date ||
          typeof s.date !== "string" ||
          !isoDateRegex.test(s.date)
        ) {
          return null;
        }
        // Fix timezone issue: parse date and normalize to start of day
        const d = startOfDay(new Date(s.date + "T00:00:00"));
        if (isNaN(d)) {
          return null;
        }
        return d;
      })
      .filter(Boolean)
      .filter((d) => getYear(d) === year && getMonth(d) === month);
  }, [existingSchedules, year, mode, originalData]);

  // For red dot: which months have any scheduled date
  const monthsWithSchedules = useMemo(() => {
    return new Set(scheduledDates
      .filter(d => getYear(d) === year)
      .map((d) => getMonth(d))
    );
  }, [scheduledDates, year]);

  // All dates in selected month/year
  const allDatesInMonth = useMemo(() => {
    const start = startOfMonth(setYear(setMonth(new Date(), month), year));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end }).map((d) => startOfDay(d));
  }, [year, month]);

  // Exclude past dates - follow legacy pattern exactly
  const allFutureDatesInMonth = useMemo(
    () => allDatesInMonth.filter((d) => d >= startOfDay(today)),
    [allDatesInMonth, today],
  );

  // Scheduled dates in selected month - follow legacy pattern exactly
  const scheduledDatesInMonth = useMemo(() => {
    let filteredScheduledDates = scheduledDates.filter(
      (d) => getMonth(d) === month,
    );

    // In edit mode, exclude current batch dates from "scheduled" status
    if (mode === "edit" && originalData && originalData.selectedDates) {
      const currentBatchDates = originalData.selectedDates.map((date) =>
        startOfDay(new Date(date)),
      );
      filteredScheduledDates = filteredScheduledDates.filter(
        (scheduledDate) =>
          !currentBatchDates.some((batchDate) =>
            isSameDay(scheduledDate, batchDate),
          ),
      );
    }

    return filteredScheduledDates;
  }, [scheduledDates, month, mode, originalData]);

  // Available dates
  const availableDates = useMemo(() => {
    return allFutureDatesInMonth.filter(
      (d) => !scheduledDatesInMonth.some((s) => isSameDay(s, d)),
    );
  }, [allFutureDatesInMonth, scheduledDatesInMonth]);

  // Filter by selected days of week
  const filteredAvailableDates = useMemo(() => {
    return availableDates.filter((d) => 
      daysOfWeek.includes(getDay(d)) && 
      getMonth(d) === month && 
      getYear(d) === year
    );
  }, [availableDates, daysOfWeek, month, year]);

  // Initialize selectedDates from originalData in edit mode or from filteredAvailableDates in create mode
  useEffect(() => {
    if (mode === "edit" && originalData && originalData.selectedDates) {
      const initialDates = originalData.selectedDates.map((date) =>
        startOfDay(new Date(date)),
      );
      // Safety check: ensure all dates are from current month/year
      const filteredInitialDates = initialDates.filter(date => 
        getMonth(date) === month && getYear(date) === year
      );
      setSelectedDates(filteredInitialDates);
    } else if (
      mode === "create" &&
      selectedDates.length === 0 &&
      filteredAvailableDates.length > 0
    ) {
      // In create mode, initialize selectedDates with filteredAvailableDates to avoid the switch
      // BUT filter out dates that are blocked by buffer
      let datesToSelect = [...filteredAvailableDates];
      
      // Filter out today if it's blocked by buffer
      if (settings?.timeBuffer && settings?.timeSlots && settings?.slotDuration) {
        const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
        if (!bufferInfo.isTodayBookable) {
          datesToSelect = datesToSelect.filter(date => !isSameDay(date, startOfDay(today)));
        }
      }
      
      setSelectedDates(datesToSelect);
    }
  }, [mode, originalData, selectedDates.length, filteredAvailableDates, month, year, settings, today]);

  // SSOT: Get final selected dates - use selectedDates as SSOT for both modes
  const finalSelectedDates = useMemo(() => {
    // Safety check: ensure all dates are from current month/year
    return selectedDates.filter(date => 
      getMonth(date) === month && getYear(date) === year
    );
  }, [selectedDates, month, year]);

  // Check if a day of week has any available dates - follow legacy pattern exactly
  const isDayAvailable = useCallback(
    (dayIdx) => {
      return availableDates.some((d) => 
        getDay(d) === dayIdx && 
        getMonth(d) === month && 
        getYear(d) === year
      );
    },
    [availableDates, month, year],
  );

  const handleMonthSelect = (selectedYear, selectedMonth) => {
    setYearState(selectedYear);
    setMonthState(selectedMonth);
    
    // Clear selected dates when month changes to prevent mixing dates from different months
    if (year !== selectedYear || month !== selectedMonth) {
      setSelectedDates([]);
    }
    
    if (onMonthSelect) {
      onMonthSelect(selectedYear, selectedMonth);
    }
  };

  const handleDayOfWeekToggle = useCallback(
    (d) => {
      let newDays;
      if (daysOfWeek.includes(d)) newDays = daysOfWeek.filter((x) => x !== d);
      else newDays = [...daysOfWeek, d];
      setDaysOfWeek(newDays);

      if (mode === "edit") {
        // In edit mode, use SSOT approach
        if (!daysOfWeek.includes(d)) {
          // Toggled ON: add all available dates for this day to selectedDates
          // BUT only from the CURRENT selected month AND respect buffer restrictions
          let toAdd = availableDates.filter((date) => 
            getDay(date) === d && 
            getMonth(date) === month && 
            getYear(date) === year
          );
          
          // Filter out today if it's blocked by buffer
          if (settings?.timeBuffer && settings?.timeSlots && settings?.slotDuration) {
            const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
            if (!bufferInfo.isTodayBookable) {
              toAdd = toAdd.filter(date => !isSameDay(date, startOfDay(today)));
            }
          }
          
          const newSelectedDates = [
            ...selectedDates,
            ...toAdd.filter(
              (date) => !selectedDates.some((x) => isSameDay(x, date)),
            ),
          ];
          // Additional safety check: ensure all dates are from current month/year
          const filteredSelectedDates = newSelectedDates.filter(date => 
            getMonth(date) === month && getYear(date) === year
          );
          setSelectedDates(filteredSelectedDates);
        } else {
          // Toggled OFF: remove all dates for this day from selectedDates
          const newSelectedDates = selectedDates.filter(
            (date) => getDay(date) !== d,
          );
          setSelectedDates(newSelectedDates);
        }
      } else {
        // In create mode, also update selectedDates for individual date selection
        if (!daysOfWeek.includes(d)) {
          // Toggled ON: add all available dates for this day to selectedDates
          // BUT only from the CURRENT selected month AND respect buffer restrictions
          let toAdd = availableDates.filter((date) => 
            getDay(date) === d && 
            getMonth(date) === month && 
            getYear(date) === year
          );
          
          // Filter out today if it's blocked by buffer
          if (settings?.timeBuffer && settings?.timeSlots && settings?.slotDuration) {
            const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
            if (!bufferInfo.isTodayBookable) {
              toAdd = toAdd.filter(date => !isSameDay(date, startOfDay(today)));
            }
          }
          
          const newSelectedDates = [
            ...selectedDates,
            ...toAdd.filter(
              (date) => !selectedDates.some((x) => isSameDay(x, date)),
            ),
          ];
          // Additional safety check: ensure all dates are from current month/year
          const filteredSelectedDates = newSelectedDates.filter(date => 
            getMonth(date) === month && getYear(date) === year
          );
          setSelectedDates(filteredSelectedDates);
        } else {
          // Toggled OFF: remove all dates for this day from selectedDates
          const newSelectedDates = selectedDates.filter(
            (date) => getDay(date) !== d,
          );
          setSelectedDates(newSelectedDates);
        }

        // Don't call the legacy callback here - let the useEffect handle it
      }
    },
    [daysOfWeek, availableDates, selectedDates, mode, year, month],
  );

  const handleDateToggle = useCallback(
    (d) => {
      // Use SSOT approach for both edit and create modes
      const exists = selectedDates.some((x) => isSameDay(x, d));
      let newSelectedDates;

      if (exists) {
        // Remove from selectedDates
        newSelectedDates = selectedDates.filter((x) => !isSameDay(x, d));
      } else {
        // Add to selectedDates
        newSelectedDates = [...selectedDates, d];
      }

      // Safety check: ensure all dates are from current month/year
      const filteredSelectedDates = newSelectedDates.filter(date => 
        getMonth(date) === month && getYear(date) === year
      );
      setSelectedDates(filteredSelectedDates);

      // Don't call the legacy callback for individual date toggles in create mode
      // The useEffect will handle the callback with the correct data
    },
    [selectedDates, mode, year, month, daysOfWeek],
  );

  // Preload months for this year
  const getPreloadMonths = useCallback(() => {
    const monthsArr = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(year, month + i, 1);
      monthsArr.push(format(d, "MMM"));
    }
    return monthsArr;
  }, [year, month]);

  const lastSent = useRef({
    year: null,
    month: null,
    daysOfWeek: null,
    finalSelectedDates: null,
  });

  useEffect(() => {
    const last = lastSent.current;
    const isSame =
      last.year === year &&
      last.month === month &&
      JSON.stringify(last.daysOfWeek) === JSON.stringify(daysOfWeek) &&
      JSON.stringify(last.finalSelectedDates) ===
        JSON.stringify(finalSelectedDates);
    if (!isSame) {
      if (onDateSelectionChange) {
        onDateSelectionChange(year, month, daysOfWeek, finalSelectedDates);
      }
      lastSent.current = {
        year,
        month,
        daysOfWeek: [...daysOfWeek],
        finalSelectedDates: [...finalSelectedDates],
      };
    }
  }, [finalSelectedDates, year, month, daysOfWeek]);

  return (
    <div className="space-y-4">
      {/* Year Dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="year-select" className="text-sm font-medium">
          Year
        </label>
        <select
          id="year-select"
          className="border rounded px-2 py-1 w-28 min-w-[6rem]"
          value={year}
          onChange={(e) => handleMonthSelect(parseInt(e.target.value), month)}
        >
          {yearsRange(today.getFullYear()).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {/* Month Pills */}
      <div className="grid grid-cols-3 gap-2">
        {months.map(({ month: m, disabled }) => (
          <button
            key={m}
            type="button"
            className={`relative px-4 py-2 rounded-full font-medium text-sm focus:outline-none transition
              ${month === m ? "bg-indigo-600 text-white" : disabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-800 hover:bg-indigo-100"}
            `}
            onClick={() => !disabled && handleMonthSelect(year, m)}
            disabled={disabled}
            aria-label={
              format(setMonth(setYear(new Date(), m), year), "MMMM yyyy") +
              (monthsWithSchedules.has(m) ? " (has schedule)" : "") +
              (disabled ? " (disabled)" : "")
            }
          >
            {format(setMonth(new Date(), m), "MMM")}
            {/* Red dot if any scheduled date in this month/year */}
            {scheduledDates
              .filter(d => getYear(d) === year)
              .some((d) => getMonth(d) === m) && (
              <span
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                aria-label="Has schedule"
              ></span>
            )}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Calendar View
        </h3>
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {dayLabels.map((label, idx) => {
              const disabled = !isDayAvailable(idx);
              const dayColorMap = colorUtils.getDayColors(dayColors);
              const dayColor = dayColorMap[idx] || "#6B7280";

              return (
                <button
                  key={label}
                  type="button"
                  className={`px-2 py-3 text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150 sm:px-3 sm:text-sm ${
                    daysOfWeek.includes(idx)
                      ? "text-white"
                      : disabled
                        ? "text-white cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={{
                    backgroundColor: disabled
                      ? "#9ca3af" // gray-400 - darker for better contrast
                      : daysOfWeek.includes(idx)
                        ? dayColor
                        : "#f9fafb", // gray-50
                  }}
                  onClick={() => !disabled && handleDayOfWeekToggle(idx)}
                  disabled={disabled}
                  aria-pressed={daysOfWeek.includes(idx)}
                  title={
                    disabled
                      ? "No available dates for this day in this month"
                      : daysOfWeek.includes(idx)
                        ? `Click to deselect all ${label} dates`
                        : `Click to select all ${label} dates`
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7">
            {(() => {
              // Get all dates for the month
              const start = startOfMonth(
                setYear(setMonth(new Date(), month), year),
              );
              const end = endOfMonth(start);
              const allDates = eachDayOfInterval({ start, end });

              // Get the day of week for the first date (0 = Sunday, 1 = Monday, etc.)
              const firstDayOfWeek = start.getDay();

              // Create calendar grid with empty cells for days before the month starts
              const calendarDays = [];

              // Add empty cells for days before the month starts
              for (let i = 0; i < firstDayOfWeek; i++) {
                calendarDays.push(null);
              }

              // Add all dates in the month
              calendarDays.push(...allDates);

              return calendarDays.map((date, index) => {
                if (!date) {
                  // Empty cell
                  return (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square border-r border-b border-gray-100"
                    ></div>
                  );
                }

                const isPast = date < startOfDay(today);
                const isScheduled = scheduledDatesInMonth.some((d) =>
                  isSameDay(d, date),
                );
                const isAvailable = availableDates.some((d) =>
                  isSameDay(d, date),
                );
                const isCurrentBatchDate =
                  mode === "edit" &&
                  originalData &&
                  originalData.selectedDates &&
                  originalData.selectedDates.some((batchDate) =>
                    isSameDay(startOfDay(new Date(batchDate)), date),
                  );
                const isSelected = finalSelectedDates.some((d) =>
                  isSameDay(d, date),
                );

                const isInSelectedDayOfWeek = daysOfWeek.includes(getDay(date));

                // Check if today is blocked by buffer
                const isToday = isSameDay(date, startOfDay(today));
                const isBlockedByBuffer = isToday && settings?.timeBuffer && settings?.timeSlots && settings?.slotDuration;
                
                let bufferBlocked = false;
                if (isBlockedByBuffer) {
                  const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
                  bufferBlocked = !bufferInfo.isTodayBookable;
                }

                // Determine if this date should be clickable
                const isClickable =
                  !isPast &&
                  !bufferBlocked &&
                  (isAvailable || isCurrentBatchDate) &&
                  (mode === "edit" || isInSelectedDayOfWeek);

                // Get day color for selected dates
                const dayColorMap = colorUtils.getDayColors(dayColors);
                const dayColor = dayColorMap[getDay(date)] || "#6B7280";

                return (
                  <div
                    key={date.toISOString()}
                    className={`aspect-square border-r border-b border-gray-100 p-1 ${
                      isPast ? "bg-gray-50" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-full h-full rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150 ${
                        isPast
                          ? "text-gray-400 cursor-not-allowed"
                          : isScheduled
                            ? "text-gray-500 cursor-not-allowed bg-gray-200"
                            : isClickable
                              ? isSelected
                                ? "text-white border-2 border-blue-500 shadow-sm"
                                : "text-gray-700 border border-transparent active:bg-gray-100"
                              : "text-gray-400 cursor-not-allowed"
                      }`}
                      style={isSelected ? { backgroundColor: dayColor } : {}}
                      onClick={() => isClickable && handleDateToggle(date)}
                      disabled={!isClickable}
                      aria-label={
                        isPast
                          ? `${format(date, "MMMM d, yyyy")} - Past date`
                          : isScheduled
                            ? `${format(date, "MMMM d, yyyy")} - Date has existing schedule`
                            : isClickable
                              ? isSelected
                                ? `${format(date, "MMMM d, yyyy")} - Click to deselect`
                                : `${format(date, "MMMM d, yyyy")} - Click to select`
                              : `${format(date, "MMMM d, yyyy")} - Not available`
                      }
                      title={
                        isPast
                          ? "Past date"
                          : isScheduled
                            ? "Date has existing schedule"
                            : isClickable
                              ? isSelected
                                ? "Click to deselect"
                                : "Click to select"
                              : "Not available"
                      }
                    >
                      <span className="block text-center leading-none">
                        {format(date, "d")}
                      </span>
                    </button>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyScheduleSelector;
