import React, { useState, useEffect } from "react";
import { colorUtils, scheduleUtils, timeUtils, getBufferInfo, isDateTimeBookable } from "../utils";
import InfoBox from "@/Components/InfoBox/InfoBox";
import ColorLegend from "@/Components/ColorLegend/ColorLegend";
import StepReviewCalendar from "./StepReviewCalendar";

const StepTimeSelector = ({
  selectedDates = [],
  selectedTime,
  onTimeChange,
  schedules = [],
  settings = {},
  loading,
  error,
  scheduleType = "single",
  mode = "create",
  scheduleId = null,
}) => {
  // Extract settings with fallbacks
  const {
    dayColors = {},
    timeFormat = "12h",
    timeSlots = [],
    slotDuration = 60,
  } = settings; // Changed from '24h' to '12h'
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");

  // Use visibleSchedules like legacy code, but filter out current schedule in edit mode
  const visibleSchedules = React.useMemo(() => {
    if (mode === "edit" && scheduleId) {
      // In edit mode, filter out the current schedule being edited
      const filtered = (schedules || []).filter((schedule) => {
        // For monthly schedules, we need to filter by batch_id instead of scheduleId
        if (schedule.batch_id && schedule.batch_id.startsWith("m_")) {
          // Get the batch_id from the current schedule being edited
          const currentSchedule = schedules.find((s) => s.id === scheduleId);
          if (currentSchedule && currentSchedule.batch_id) {
            return schedule.batch_id !== currentSchedule.batch_id;
          }
          // If current schedule doesn't have batch_id, filter out all monthly schedules
          // This is a safer fallback for when batch_id is not available
          return !(schedule.batch_id && schedule.batch_id.startsWith("m_"));
        }

        // For single/weekly schedules, filter by scheduleId
        return schedule.id !== scheduleId;
      });

      return filtered;
    }
    return schedules || [];
  }, [schedules, mode, scheduleId]);

  // Helper function to ensure we have Date objects
  const ensureDateObject = (d) => {
    if (d instanceof Date) return d;
    if (typeof d === "string") {
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (Array.isArray(d) && d.length > 0) {
      // Handle nested array case - take the first element
      return ensureDateObject(d[0]);
    }
    return null;
  };

  // Helper function to get the first valid date from selectedDates
  const getFirstSelectedDate = () => {
    if (selectedDates.length === 0) return null;
    return ensureDateObject(selectedDates[0]);
  };

  // Get tooltip message for disabled time slots
  const getDisabledTimeTooltip = (time) => {
    if (selectedDates.length === 0) return "No date selected";

    if (scheduleType === "single") {
      const dateToCheck = getFirstSelectedDate();
      if (!dateToCheck) return "Invalid date";

      // Check if time conflicts with existing schedules
      const hasConflict = scheduleUtils.isStartTimeDisabled(
        time,
        dateToCheck,
        visibleSchedules,
      );

      if (hasConflict) {
        return "This time conflicts with an existing schedule";
      }

      // Check time buffer restriction
      if (settings.timeBuffer) {
        const targetDateTime = new Date(dateToCheck);
        const [hours, minutes] = time.split(':').map(Number);
        targetDateTime.setHours(hours, minutes, 0, 0);
        
        // Only apply buffer restriction if the selected date is today
        const today = new Date();
        const isToday = dateToCheck.toDateString() === today.toDateString();
        
        if (isToday) {
          const bufferCheck = isDateTimeBookable(
            targetDateTime,
            timeSlots,
            slotDuration,
            settings.timeBuffer
          );
          
          if (!bufferCheck.isBookable && bufferCheck.code === 'BUFFER_RESTRICTION') {
            return `Must be booked at least ${settings.timeBuffer} hours in advance`;
          }
        }
      }

      // Check slot duration constraint
      if (timeSlots.length === 0) return "No time slots available";

      const lastTimeSlot = timeSlots[timeSlots.length - 1];
      if (time > lastTimeSlot) {
        return "Time is after the latest available slot";
      }

      return "Time is not available";
    }

    // For monthly/weekly schedules, check the first selected date for tooltip
    const firstDate = ensureDateObject(selectedDates[0]);
    if (!firstDate) return "Invalid date";

    const hasConflict = scheduleUtils.isStartTimeDisabled(
      time,
      firstDate,
      visibleSchedules,
    );

    if (hasConflict) {
      return "This time conflicts with an existing schedule";
    }

    // Check time buffer restriction
    if (settings.timeBuffer) {
      const targetDateTime = new Date(firstDate);
      const [hours, minutes] = time.split(':').map(Number);
      targetDateTime.setHours(hours, minutes, 0, 0);
      
      // Only apply buffer restriction if the selected date is today
      const today = new Date();
      const isToday = firstDate.toDateString() === today.toDateString();
      
      if (isToday) {
        const bufferCheck = isDateTimeBookable(
          targetDateTime,
          timeSlots,
          slotDuration,
          settings.timeBuffer
        );
        
        if (!bufferCheck.isBookable && bufferCheck.code === 'BUFFER_RESTRICTION') {
          return `Must be booked at least ${settings.timeBuffer} hours in advance`;
        }
      }
    }

    return "Time is not available";
  };

  // Get tooltip message for disabled end time slots
  const getDisabledEndTimeTooltip = (time) => {
    if (!selectedStartTime) return "Please select a start time first";
    
    if (time <= selectedStartTime) {
      return "End time must be after start time";
    }

    if (selectedDates.length === 0) return "No date selected";

    if (scheduleType === "single") {
      const dateToCheck = getFirstSelectedDate();
      if (!dateToCheck) return "Invalid date";

      // Check if time conflicts with existing schedules
      const hasConflict = scheduleUtils.isEndTimeDisabled(
        time,
        dateToCheck,
        visibleSchedules,
        selectedStartTime
      );

      if (hasConflict) {
        return "This time conflicts with an existing schedule";
      }

      // Check time buffer restriction
      if (settings.timeBuffer) {
        const targetDateTime = new Date(dateToCheck);
        const [hours, minutes] = time.split(':').map(Number);
        targetDateTime.setHours(hours, minutes, 0, 0);
        
        // Only apply buffer restriction if the selected date is today
        const today = new Date();
        const isToday = dateToCheck.toDateString() === today.toDateString();
        
        if (isToday) {
          const bufferCheck = isDateTimeBookable(
            targetDateTime,
            timeSlots,
            slotDuration,
            settings.timeBuffer
          );
          
          if (!bufferCheck.isBookable && bufferCheck.code === 'BUFFER_RESTRICTION') {
            return `Must be booked at least ${settings.timeBuffer} hours in advance`;
          }
        }
      }

      return "Time is not available";
    }

    // For monthly/weekly schedules, check the first selected date for tooltip
    const firstDate = ensureDateObject(selectedDates[0]);
    if (!firstDate) return "Invalid date";

    const hasConflict = scheduleUtils.isEndTimeDisabled(
      time,
      firstDate,
      visibleSchedules,
      selectedStartTime
    );

    if (hasConflict) {
      return "This time conflicts with an existing schedule";
    }

    // Check time buffer restriction
    if (settings.timeBuffer) {
      const targetDateTime = new Date(firstDate);
      const [hours, minutes] = time.split(':').map(Number);
      targetDateTime.setHours(hours, minutes, 0, 0);
      
      // Only apply buffer restriction if the selected date is today
      const today = new Date();
      const isToday = firstDate.toDateString() === today.toDateString();
      
      if (isToday) {
        const bufferCheck = isDateTimeBookable(
          targetDateTime,
          timeSlots,
          slotDuration,
          settings.timeBuffer
        );
        
        if (!bufferCheck.isBookable && bufferCheck.code === 'BUFFER_RESTRICTION') {
          return `Must be booked at least ${settings.timeBuffer} hours in advance`;
        }
      }
    }

    return "Time is not available";
  };

  // Check if a time slot is disabled for start time (using utils)
  const isStartTimeDisabled = React.useCallback((time) => {
    if (selectedDates.length === 0) return false;

    if (scheduleType === "single") {
      // For single schedules, check slot duration constraint
      const dateToCheck = getFirstSelectedDate();
      if (!dateToCheck) return false;
      


      // First check if time conflicts with existing schedules
      const hasConflict = scheduleUtils.isStartTimeDisabled(
        time,
        dateToCheck,
        visibleSchedules,
      );

      if (hasConflict) {
        return true; // Disabled - conflicts with existing schedules
      }

      // Check time buffer restriction
      if (settings.timeBuffer) {
        const targetDateTime = new Date(dateToCheck);
        const [hours, minutes] = time.split(':').map(Number);
        targetDateTime.setHours(hours, minutes, 0, 0);
        
        // Only apply buffer restriction if the selected date is today
        const today = new Date();
        const isToday = dateToCheck.toDateString() === today.toDateString();
        

        
        if (isToday) {
          // First check if the time is in the past (before current time)
          const now = new Date();
          if (targetDateTime <= now) {
            return true; // Disabled - time is in the past
          }
          
          const bufferCheck = isDateTimeBookable(
            targetDateTime,
            timeSlots,
            slotDuration,
            settings.timeBuffer
          );
          

          
          if (!bufferCheck.isBookable && bufferCheck.code === 'BUFFER_RESTRICTION') {
            return true; // Disabled - blocked by time buffer
          }
        }
      }

      // Then check slot duration constraint based on database time slots
      if (timeSlots.length === 0) return true;

      // Find the last time slot in the database
      const lastTimeSlot = timeSlots[timeSlots.length - 1]; // e.g., "18:00" (6pm)

      // For start time, the latest allowed start time is the last time slot start time
      // because if the last slot is 18:00-19:00, you can start at 18:00 and end at 19:00
      const latestStartSlot = lastTimeSlot; // e.g., "18:00" (6pm)

      // If the time is after the latest allowed start time, disable it
      if (time > latestStartSlot) {
        return true; // Disabled - can't start after latest allowed time
      }

      return false; // Available
    } else {
      // For monthly/weekly schedules in edit mode, include current batch times as available
      if (mode === "edit" && scheduleId) {
        // Get the current schedule being edited
        const currentSchedule = schedules.find((s) => s.id === scheduleId);
        if (currentSchedule) {
          // Check if this time is within the current schedule's time range
          const currentStartTime = new Date(currentSchedule.start_time)
            .toTimeString()
            .slice(0, 5);
          const currentEndTime = new Date(currentSchedule.end_time)
            .toTimeString()
            .slice(0, 5);

          // If the time is within the current schedule's time range, it's available
          if (time >= currentStartTime && time < currentEndTime) {
            return false; // Available - this is within the current schedule's time range
          }
        }
      }

      // For monthly/weekly schedules, check ALL selected dates
      // The time must be available on ALL selected dates
      for (const date of selectedDates) {
        const dateObj = ensureDateObject(date);
        if (!dateObj) continue;

        const hasConflict = scheduleUtils.isStartTimeDisabled(
          time,
          dateObj,
          visibleSchedules,
        );

        if (hasConflict) {
          return true; // Disabled - conflicts with at least one selected date
        }

        // Check time buffer restriction for each date
        if (settings.timeBuffer) {
          const targetDateTime = new Date(dateObj);
          const [hours, minutes] = time.split(':').map(Number);
          targetDateTime.setHours(hours, minutes, 0, 0);
          
          // Only apply buffer restriction if the selected date is today
          const today = new Date();
          const isToday = dateObj.toDateString() === today.toDateString();
          
          if (isToday) {
            // First check if the time is in the past (before current time)
            const now = new Date();
            if (targetDateTime <= now) {
              return true; // Disabled - time is in the past
            }
            
            const bufferCheck = isDateTimeBookable(
              targetDateTime,
              timeSlots,
              slotDuration,
              settings.timeBuffer
            );
            
            if (!bufferCheck.isBookable && bufferCheck.code === 'BUFFER_RESTRICTION') {
              return true; // Disabled - blocked by time buffer
            }
          }
        }
      }
      return false; // Available on all selected dates
    }
  }, [selectedDates, visibleSchedules, settings.timeBuffer, timeSlots, slotDuration, scheduleType, mode, scheduleId, schedules]);

  // Check if a time slot is disabled for end time (using utils)
  const isEndTimeDisabled = React.useCallback((time) => {
    if (selectedDates.length === 0) return true;

    if (scheduleType === "single") {
      // For single schedules, check end time constraints
      if (!selectedStartTime) {
        return true;
      }

      // End time must be after start time
      if (time <= selectedStartTime) {
        return true;
      }

      // End time must be at least slotDuration after start time
      const slotDurationHours = Math.floor(slotDuration / 60);
      const slotDurationMinutes = slotDuration % 60;

      // Calculate the earliest allowed end time
      const firstDate = getFirstSelectedDate();
      if (!firstDate) return true;

      const startDate = new Date(firstDate);
      const [startH, startM] = selectedStartTime.split(":");
      startDate.setHours(Number(startH), Number(startM), 0, 0);

      const earliestEndDate = new Date(startDate);
      earliestEndDate.setHours(
        startDate.getHours() + slotDurationHours,
        startDate.getMinutes() + slotDurationMinutes,
        0,
        0,
      );

      const earliestEndTime = `${String(earliestEndDate.getHours()).padStart(
        2,
        "0",
      )}:${String(earliestEndDate.getMinutes()).padStart(2, "0")}`;

      // If the time is before the earliest allowed end time, disable it
      if (time < earliestEndTime) {
        return true; // Disabled - too early
      }

      // End time must be within the user's available time slots from database
      // OR be the end time of any slot
      if (!timeSlots.includes(time)) {
        // Check if this is the end time of any slot
        const isEndTimeOfAnySlot = timeSlots.some(
          (slot) => getEndTimeOfSlot(slot) === time,
        );

        if (!isEndTimeOfAnySlot) {
          return true; // Disabled - not in available time slots
        }
      }

      // Check for overlap with existing schedules
      if (selectedDates.length > 0) {
        const firstDate = getFirstSelectedDate();
        if (!firstDate) return true;

        const startDate = new Date(firstDate);
        const [startH, startM] = selectedStartTime.split(":");
        startDate.setHours(Number(startH), Number(startM), 0, 0);

        const endDate = new Date(firstDate);
        const [endH, endM] = time.split(":");
        endDate.setHours(Number(endH), Number(endM), 0, 0);

        // Check for overlap with existing schedules
        for (const sched of visibleSchedules) {
          const schedStart = new Date(sched.start_time);
          const schedEnd = new Date(sched.end_time);

          // Overlap if: start < schedEnd && end > schedStart
          if (startDate < schedEnd && endDate > schedStart) {
            return true; // Disabled - overlaps with existing schedule
          }
        }
      }

      return false; // Available if no conflicts
    } else {
      // For monthly/weekly schedules in edit mode, include current batch times as available
      if (mode === "edit" && scheduleId) {
        // Get the current schedule being edited
        const currentSchedule = schedules.find((s) => s.id === scheduleId);
        if (currentSchedule) {
          // Check if this time is within the current schedule's time range
          const currentStartTime = new Date(currentSchedule.start_time)
            .toTimeString()
            .slice(0, 5);
          const currentEndTime = new Date(currentSchedule.end_time)
            .toTimeString()
            .slice(0, 5);

          // If the time is within the current schedule's time range, it's available
          if (time >= currentStartTime && time <= currentEndTime) {
            return false; // Available - this is within the current schedule's time range
          }
        }
      }

      // For monthly/weekly schedules, check ALL selected dates
      // The time must be available on ALL selected dates
      for (const date of selectedDates) {
        const dateObj = ensureDateObject(date);
        if (!dateObj) continue;

        const hasConflict = scheduleUtils.isEndTimeDisabled(
          time,
          dateObj,
          selectedStartTime,
          visibleSchedules,
        );

        if (hasConflict) {
          return true; // Disabled - conflicts with at least one selected date
        }
      }
      return false; // Available on all selected dates
    }
  }, [selectedDates, selectedStartTime, visibleSchedules, scheduleType, mode, scheduleId, schedules, timeSlots, slotDuration]);

  // Helper to get the end time of a slot (e.g., "18:00" -> "19:00")
  const getEndTimeOfSlot = (slot) => {
    const [hour, minute] = slot.split(":");
    const endHour = Number(hour) + Math.floor(slotDuration / 60);
    const endMinute = Number(minute) + (slotDuration % 60);

    let adjustedHour = endHour;
    let adjustedMinute = endMinute;
    if (adjustedMinute >= 60) {
      adjustedHour += 1;
      adjustedMinute -= 60;
    }

    return `${String(adjustedHour).padStart(2, "0")}:${String(
      adjustedMinute,
    ).padStart(2, "0")}`;
  };

  // Handle start time selection
  const handleStartTimeSelect = (time) => {
    setSelectedStartTime(time);

    // For single schedules, preserve end time if it's still valid
    if (scheduleType === "single") {
      // In edit mode, try to preserve the original end time if it's still valid
      if (
        mode === "edit" &&
        selectedTime.end &&
        !isEndTimeDisabled(selectedTime.end)
      ) {
        setSelectedEndTime(selectedTime.end);
        onTimeChange({ start: time, end: selectedTime.end });
      } else {
        setSelectedEndTime("");
        onTimeChange({ start: time, end: "" });
      }
      return;
    }

    // For other schedule types, auto-select end time based on slotDuration (like legacy)
    const timeIndex = timeSlots.indexOf(time);
    const slotDurationHours = Math.floor(slotDuration / 60);
    const endTimeIndex = Math.min(
      timeIndex + slotDurationHours,
      timeSlots.length - 1,
    );
    const endTime = timeSlots[endTimeIndex];

    // Check if the auto-selected end time is valid
    if (!isEndTimeDisabled(endTime)) {
      setSelectedEndTime(endTime);
      onTimeChange({ start: time, end: endTime });
    } else {
      // Find the next available end time
      const nextAvailableEndTime = timeSlots.find(
        (t) => !isEndTimeDisabled(t) && t > time,
      );

      if (nextAvailableEndTime) {
        setSelectedEndTime(nextAvailableEndTime);
        onTimeChange({ start: time, end: nextAvailableEndTime });
      } else {
        setSelectedEndTime("");
        onTimeChange({ start: time, end: "" });
      }
    }
  };

  // Handle end time selection
  const handleEndTimeSelect = (time) => {
    if (
      selectedStartTime &&
      time > selectedStartTime &&
      !isEndTimeDisabled(time)
    ) {
      setSelectedEndTime(time);
      onTimeChange({ start: selectedStartTime, end: time });
    }
  };

  // Auto-preselect earliest available time when dates change (like legacy)
  useEffect(() => {
    if (selectedDates.length > 0 && !selectedStartTime) {
      if (scheduleType === "single") {
        // For single schedules, find earliest time that respects slot duration constraint
        const dateToCheck = getFirstSelectedDate();
        if (!dateToCheck) return;

        // Find all available time slots (including past time and buffer checks)
        const availableTimeSlots = timeSlots.filter(
          (t) => !isStartTimeDisabled(t),
        );

        if (availableTimeSlots.length > 0) {
          // Find the last available time slot
          const lastAvailableSlot =
            availableTimeSlots[availableTimeSlots.length - 1];

          // Calculate the latest allowed start time (slotDuration before last available slot)
          const [lastH, lastM] = lastAvailableSlot.split(":");
          const latestStartHour = Number(lastH) - Math.floor(slotDuration / 60);
          const latestStartMinute = Number(lastM) - (slotDuration % 60);

          // Handle minute overflow
          let adjustedHour = latestStartHour;
          let adjustedMinute = latestStartMinute;
          if (adjustedMinute < 0) {
            adjustedHour -= 1;
            adjustedMinute += 60;
          }

          const latestStartSlot = `${String(adjustedHour).padStart(
            2,
            "0",
          )}:${String(adjustedMinute).padStart(2, "0")}`;

          // Find the earliest time that's within the allowed range
          const earliestAllowedTime = availableTimeSlots.find(
            (t) => t <= latestStartSlot,
          );

          if (earliestAllowedTime) {
            handleStartTimeSelect(earliestAllowedTime);
          }
        }
      } else {
        // For other schedule types, use first selected date
        const dateToCheck = selectedDates[0];

        // Find the earliest available start time (including past time and buffer checks)
        const availableTimeSlots = timeSlots.filter(
          (t) => !isStartTimeDisabled(t),
        );
        const earliestAvailableTime = availableTimeSlots[0];

        if (earliestAvailableTime) {
          handleStartTimeSelect(earliestAvailableTime);
        }
      }
    }
  }, [selectedDates, timeSlots, visibleSchedules, scheduleType, slotDuration]);

  // Update local state when selectedTime prop changes
  useEffect(() => {
    if (selectedTime.start !== selectedStartTime) {
      setSelectedStartTime(selectedTime.start);
    }
    if (selectedTime.end !== selectedEndTime) {
      setSelectedEndTime(selectedTime.end);
    }
  }, [selectedTime]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Select Time
        <span className="text-sm font-normal text-gray-600 ml-2">
          ({scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)}{" "}
          Schedule)
        </span>
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Unified Info Box - Time Selection, Buffer, and Constraints */}
      <div className="mb-4 p-4 bg-blue-50 rounded border">
        <h3 className="text-sm font-medium text-blue-900 mb-3">⏰ Time Selection</h3>
        
        {/* Time Selection Info */}
        <div className="mb-3 pl-0">
          <p className="text-sm text-blue-800">
            Select start and end times for your schedule. Times that conflict with existing schedules are disabled.
          </p>
        </div>

        {/* Custom Schedule Info */}
        {scheduleType === "custom" && selectedDates.length > 1 && (
          <div className="mb-3 pl-0">
            <p className="text-sm text-blue-800">
              💡 <strong>Custom Schedule Constraint:</strong> The selected time must be available on ALL selected dates. 
              Times that conflict with any of the selected dates are disabled.
            </p>
          </div>
        )}

        {/* Time Buffer Information */}
        {settings.timeBuffer && (() => {
          const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
          return (
            <div className="pt-3 border-t border-blue-200 pl-0">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 text-sm">⏰</span>
                <div className="text-sm text-blue-700">
                  <p className="text-sm font-medium mb-1">Time Buffer Restriction</p>
                  <p>Schedules must be created at least <strong>{settings.timeBuffer} hours</strong> in advance.</p>
                  <p className="text-blue-600 mt-1">
                    {bufferInfo.todayStatus}
                  </p>
                  {bufferInfo.isTodayBookable && (
                    <p className="text-blue-500 mt-1">
                      Earliest allowed time: <strong>{bufferInfo.nextAvailableTime}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Color Legend */}
      <ColorLegend dayColors={dayColors} className="mb-4" />

      {/* Selected Dates Calendar View */}
      {selectedDates.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Selected Dates:
          </h3>
          <StepReviewCalendar
            selectedDates={selectedDates}
            originalDates={[]} // No original dates in time selection step
            dayColors={dayColors}
            scheduleType={scheduleType}
            mode="create" // Always "create" mode for time selection step
          />
          {/* Color Legend for Calendar */}
          <div className="mt-3 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: "#10B981" }}
                ></div>
                <span>Selected dates</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Time Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Start Time</h3>
        <div className="grid grid-cols-5 gap-1">
          {timeSlots.map((time) => {
            // Memoize the disabled state to prevent multiple calculations
            const isDisabled = React.useMemo(() => isStartTimeDisabled(time), [time, selectedDates, visibleSchedules, settings.timeBuffer]);
            const isSelected = selectedStartTime === time;
            


            return (
              <button
                key={time}
                type="button"
                onClick={() => !isDisabled && handleStartTimeSelect(time)}
                disabled={isDisabled}
                className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : isDisabled
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                title={
                  isDisabled
                    ? getDisabledTimeTooltip(time)
                    : ""
                }
              >
                {timeUtils.formatTime(time, timeFormat)}
              </button>
            );
          })}
        </div>
      </div>

      {/* End Time Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">End Time</h3>
        <div className="grid grid-cols-5 gap-1">
          {(() => {
            // Create end time options: all time slots + end time of all slots
            const endTimeOptions = [...timeSlots];
            timeSlots.forEach((slot) => {
              const slotEnd = getEndTimeOfSlot(slot);
              if (!endTimeOptions.includes(slotEnd)) {
                endTimeOptions.push(slotEnd);
              }
            });

            return endTimeOptions.map((time) => {
              // Memoize the disabled state to prevent multiple calculations
              const isDisabled = React.useMemo(() => isEndTimeDisabled(time), [time, selectedStartTime, selectedDates, visibleSchedules]);
              const isSelected = selectedEndTime === time;

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => !isDisabled && handleEndTimeSelect(time)}
                  disabled={isDisabled}
                  className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : isDisabled
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  title={
                    isDisabled
                      ? getDisabledEndTimeTooltip(time)
                      : ""
                  }
                >
                  {timeUtils.formatTime(time, timeFormat)}
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Selected Time Summary */}
      {selectedStartTime && selectedEndTime && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-sm text-green-800">
            <strong>Selected Time:</strong>{" "}
            {timeUtils.formatTime(selectedStartTime, timeFormat)} -{" "}
            {timeUtils.formatTime(selectedEndTime, timeFormat)}
          </div>
        </div>
      )}

      {/* Existing Schedules Preview */}
      {visibleSchedules.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Recent Schedules:
          </h3>
          <div className="space-y-2">
            {visibleSchedules.slice(0, 5).map((schedule, idx) => {
              const scheduleDate = new Date(schedule.start_time);
              const dayOfWeek = scheduleDate.getDay();
              const dayColor = colorUtils.getDayColors(dayColors)[dayOfWeek];

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-white rounded border"
                  style={{ borderLeftColor: dayColor, borderLeftWidth: "4px" }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dayColor }}
                  ></div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">
                      {scheduleUtils.formatSchedule(schedule, timeFormat).date}
                    </span>
                    <span className="text-gray-500"> • </span>
                    <span>
                      {
                        scheduleUtils.formatSchedule(schedule, timeFormat)
                          .timeRange
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepTimeSelector;
