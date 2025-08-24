import React, { useState, useEffect, useMemo, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Alert, Stepper } from "@/Components";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import DeleteButton from "@/Components/Button/DeleteButton";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";
import StepTypeSelector from "./StepTypeSelector";
import StepDateSelector from "./StepDateSelector";
import StepTimeSelector from "./StepTimeSelector";
import StepReviewConfirm from "./StepReviewConfirm";
import { scheduleUtils, weeklyUtils, getBufferInfo } from "../utils";
import { useScheduleData, useScheduleSettings } from "../hooks";

const ScheduleStepper = ({
  initialStep = 1,
  errors: pageErrors,
  mode = "create", // "create" or "edit"
  originalData = null, // For edit mode
  scheduleId = null, // For edit mode
  intent = null, // For delete intent from index page
  ...props
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [highestStepReached, setHighestStepReached] = useState(initialStep);
  const [stepData, setStepData] = useState({});
  const [showLoadingSnackbar, setShowLoadingSnackbar] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // SSOT: Centralized state management
  const [scheduleType, setScheduleType] = useState("single");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTime, setSelectedTime] = useState({ start: "", end: "" });

  // State for weekly schedule management
  const [selectedDays, setSelectedDays] = useState([]);
  const [weekBaseDate, setWeekBaseDate] = useState(null);
  const [weekDates, setWeekDates] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // State for monthly schedule management
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth());
  const [monthlyDaysOfWeek, setMonthlyDaysOfWeek] = useState([1, 2, 3, 4, 5]);

  // State for loaded schedules by month (for weekly schedule logic)
  const [loadedMonths, setLoadedMonths] = useState({});

  // Track if time has been modified by user
  const timeModifiedRef = useRef(false);
  // Track if dates have been modified by user
  const datesModifiedRef = useRef(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    action: null,
  });

  // Delete mode state
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // Handle initial step (normal navigation, not delete mode)
  useEffect(() => {
    if (initialStep && initialStep !== currentStep) {
      setCurrentStep(initialStep);
      setHighestStepReached(initialStep);
    }
  }, [initialStep]);

  // Automatically enter delete mode when coming from index page delete action
  useEffect(() => {
    // Check if we should automatically enter delete mode
    // This simulates the same behavior as clicking "Delete Schedule" button
    if (intent === "delete" && originalData && selectedDates.length > 0) {
      // Automatically enter delete mode when coming from index with delete intent
      setIsDeleteMode(true);
      setCurrentStep(4);
      setHighestStepReached(Math.max(highestStepReached, 4));
    }
  }, [intent, originalData, selectedDates, highestStepReached]);

  // Custom hooks for data fetching
  const {
    schedules,
    loading: schedulesLoading,
    error: schedulesError,
  } = useScheduleData();
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
  } = useScheduleSettings();

  // Populate loadedMonths from schedules data
  useEffect(() => {
    if (schedules && schedules.length > 0) {
      const monthsData = {};
      schedules.forEach((schedule) => {
        const scheduleDate = new Date(schedule.start_time);
        const monthStr = `${scheduleDate.getFullYear()}-${String(
          scheduleDate.getMonth() + 1,
        ).padStart(2, "0")}`;
        if (!monthsData[monthStr]) {
          monthsData[monthStr] = [];
        }
        monthsData[monthStr].push(schedule);
      });
      setLoadedMonths(monthsData);
    }
  }, [schedules]);

  // Combined loading and error states for components
  const loading = schedulesLoading || settingsLoading;
  const error = schedulesError || settingsError || submissionError;

  // SSOT: Get current state object for utils functions
  const getCurrentState = () => {
    const state = {
      data: {
        date: selectedDates.length > 0 ? selectedDates[0] : null,
      },
      selectedDays,
      weekDates,
      selectedDates,
      loadedMonths,
    };

    return state;
  };

  // SSOT: Get current selected dates using centralized logic
  const getCurrentSelectedDates = () => {
    return scheduleUtils.getCurrentSelectedDates(
      scheduleType,
      getCurrentState(),
    );
  };

  // Detect changes for edit mode
  const changes = useMemo(() => {
    if (mode === "edit" && originalData) {
      const currentData = {
        scheduleType,
        selectedDates: getCurrentSelectedDates(),
        selectedTime,
        selectedDays,
        weekDates,
        monthlyYear,
        monthlyMonth,
        monthlyDaysOfWeek,
      };

      return {
        dates: {
          added: currentData.selectedDates.filter(
            (date) =>
              !originalData.selectedDates.some((origDate) => {
                const origDateStr = new Date(origDate)
                  .toISOString()
                  .slice(0, 10);
                const currentDateStr = date.toISOString().slice(0, 10);
                return origDateStr === currentDateStr;
              }),
          ),
          removed: originalData.selectedDates.filter(
            (origDate) =>
              !currentData.selectedDates.some((date) => {
                const origDateStr = new Date(origDate)
                  .toISOString()
                  .slice(0, 10);
                const currentDateStr = date.toISOString().slice(0, 10);
                return origDateStr === currentDateStr;
              }),
          ),
        },
        time: {
          changed:
            JSON.stringify(originalData.selectedTime) !==
            JSON.stringify(selectedTime),
        },
        scheduleType: {
          changed: originalData.scheduleType !== scheduleType,
        },
      };
    }
    return null;
  }, [
    mode,
    originalData,
    scheduleType,
    selectedDates,
    selectedTime,
    selectedDays,
    weekDates,
    monthlyYear,
    monthlyMonth,
    monthlyDaysOfWeek,
  ]);

  // Initialize state based on mode
  useEffect(() => {
    if (mode === "edit" && originalData) {
      // Pre-fill data for edit mode
      setScheduleType(originalData.scheduleType || "single");
      // Convert date strings to Date objects for frontend compatibility, but only if not modified
      if (!datesModifiedRef.current) {
        const newSelectedDates = originalData.selectedDates
          ? originalData.selectedDates.map((dateStr) => new Date(dateStr))
          : [];
        setSelectedDates(newSelectedDates);
      }

      // Pre-fill weekly/monthly specific data
      if (originalData.scheduleType === "weekly") {
        // For weekly schedules, reconstruct weekDates from selectedDates if not available
        let weekDatesArray = [];
        let weekBaseDateValue = null;

        if (originalData.weekDates && originalData.weekDates.length > 0) {
          // Use existing weekDates if available
          weekDatesArray = originalData.weekDates.map((d) => new Date(d));
          weekBaseDateValue = originalData.weekBaseDate
            ? new Date(originalData.weekBaseDate)
            : null;
        } else if (
          originalData.selectedDates &&
          originalData.selectedDates.length > 0
        ) {
          // Reconstruct weekDates from selectedDates
          const selectedDateObjects = originalData.selectedDates.map(
            (dateStr) => new Date(dateStr),
          );
          // Find the earliest date to use as the base date for the week
          const earliestDate = new Date(
            Math.min(...selectedDateObjects.map((d) => d.getTime())),
          );
          // Get the start of the week (Monday) for the earliest selected date
          const weekStart = new Date(earliestDate);
          const dayOfWeek = weekStart.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-first
          weekStart.setDate(weekStart.getDate() - daysToMonday);

          // Generate the full week (Monday to Sunday)
          weekDatesArray = [];
          for (let i = 0; i < 7; i++) {
            const weekDate = new Date(weekStart);
            weekDate.setDate(weekDate.getDate() + i);
            weekDatesArray.push(weekDate);
          }
          weekBaseDateValue = weekStart;
        }

        // Calculate selectedDays from selectedDates if not available
        let selectedDaysArray = originalData.selectedDays || [];
        if (
          selectedDaysArray.length === 0 &&
          originalData.selectedDates &&
          originalData.selectedDates.length > 0
        ) {
          // Extract day-of-week from selected dates
          selectedDaysArray = [
            ...new Set(
              originalData.selectedDates.map((dateStr) =>
                new Date(dateStr).getDay(),
              ),
            ),
          ].sort();
        }

        setSelectedDays(selectedDaysArray);
        setWeekBaseDate(weekBaseDateValue);
        setWeekDates(weekDatesArray);
        setSelectedWeek(originalData.selectedWeek || null);
      } else if (originalData.scheduleType === "monthly") {
        // For monthly schedules, calculate the year/month from the first selected date
        // For monthly schedules, calculate the year/month from the first selected date
        if (
          originalData.selectedDates &&
          originalData.selectedDates.length > 0
        ) {
          const firstDate = new Date(originalData.selectedDates[0]);
          setMonthlyYear(firstDate.getFullYear());
          setMonthlyMonth(firstDate.getMonth());
        } else if (
          originalData.monthlyYear !== undefined &&
          originalData.monthlyMonth !== undefined
        ) {
          setMonthlyYear(originalData.monthlyYear);
          setMonthlyMonth(originalData.monthlyMonth);
        } else {
          setMonthlyYear(new Date().getFullYear());
          setMonthlyMonth(new Date().getMonth());
        }
        // Calculate days of week from selected dates
        const daysOfWeek = originalData.selectedDates
          ? [
              ...new Set(
                originalData.selectedDates.map((dateStr) =>
                  new Date(dateStr).getDay(),
                ),
              ),
            ].sort()
          : [1, 2, 3, 4, 5];
        setMonthlyDaysOfWeek(daysOfWeek);
      }
    } else if (mode === "create") {
      // Only reset to defaults for create mode, not when originalData is temporarily null
      setCurrentStep(1);
      setHighestStepReached(1);
      setStepData({});
      setSelectedDates([]);
      setSelectedTime({ start: "", end: "" });
      setScheduleType("single");
      setSelectedDays([]);
      setWeekBaseDate(null);
      setWeekDates([]);
      setSelectedWeek(null);
      setMonthlyYear(new Date().getFullYear());
      setMonthlyMonth(new Date().getMonth());
      setMonthlyDaysOfWeek([1, 2, 3, 4, 5]);
    }
    // Don't reset anything if mode is "edit" but originalData is temporarily null
  }, [mode, originalData?.scheduleType, originalData?.selectedDates]); // Only run when these specific properties change

  // Initialize time only once in edit mode
  useEffect(() => {
    if (mode === "edit" && originalData && !timeModifiedRef.current) {
      setSelectedTime(originalData.selectedTime || { start: "", end: "" });
    }
  }, [mode, originalData?.selectedTime]); // Only run when originalData.selectedTime changes

  // Validate dates only when navigating to step 3
  const validateDatesForStep3 = () => {
    const hasValidDates = (() => {
      switch (scheduleType) {
        case "single":
          return selectedDates.length > 0;
        case "weekly":
          return selectedDates.length > 0;
        case "monthly":
          return selectedDates.length > 0;
        default:
          return false;
      }
    })();

    if (!hasValidDates) {
      // User is on step 3 but has no dates selected (missing step 2 data)
      // Reset to step 1
      setCurrentStep(1);
      setHighestStepReached(1);
      // Only reset dates if not in edit mode or if dates are not already set
      if (mode !== "edit" || !selectedDates.length) {
        setSelectedDates([]);
      }
      // Only reset time if not in edit mode or if time is not already set
      if (mode !== "edit" || (!selectedTime.start && !selectedTime.end)) {
        setSelectedTime({ start: "", end: "" });
      }
      // Only reset schedule type if not in edit mode
      if (mode !== "edit") {
        setScheduleType("single");
      }
      return false;
    }
    return true;
  };

  // Initialize weekly schedule when component mounts with weekly type
  useEffect(() => {
    if (scheduleType === "weekly" && weekDates.length === 0) {
      const now = new Date();
      const week = weeklyUtils.getWeekDates(now);
      setWeekBaseDate(week[0]);
      setWeekDates(week);

      // Only select weekdays (Monday-Friday) that are available
      let remainingWeekdays = weeklyUtils.getRemainingWeekdays(now);
      
      // Filter out today if it's blocked by buffer
      if (settings?.timeBuffer && settings?.timeSlots && settings?.slotDuration) {
        const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
        if (!bufferInfo.isTodayBookable) {
          // Remove today from remaining weekdays if buffer blocks it
          remainingWeekdays = remainingWeekdays.filter(weekday => 
            !scheduleUtils.startOfDay(weekday).getTime() === scheduleUtils.startOfDay(now).getTime()
          );
        }
      }
      
      setSelectedWeek({
        baseDate: week[0],
        days: remainingWeekdays.map((d) => d.getDay()),
      });
      setSelectedDays(remainingWeekdays.map((d) => d.getDay()));
    }
  }, [scheduleType, settings]); // Run when scheduleType or settings change

  // Handle loading snackbar visibility
  useEffect(() => {
    if (schedulesLoading || settingsLoading) {
      setShowLoadingSnackbar(true);
    } else {
      // Hide loading snackbar after a short delay to show completion
      const timer = setTimeout(() => setShowLoadingSnackbar(false), 500);
      return () => clearTimeout(timer);
    }
  }, [schedulesLoading, settingsLoading]);

  // SSOT: Check if we have valid selected dates
  const hasValidSelectedDates = () => {
    return scheduleUtils.hasValidSelectedDates(scheduleType, getCurrentState());
  };

  // SSOT: Get primary selected date
  const getPrimarySelectedDate = () => {
    return scheduleUtils.getPrimarySelectedDate(
      scheduleType,
      getCurrentState(),
    );
  };

  // Update step data when state changes
  useEffect(() => {
    setStepData((prev) => ({
      ...prev,
      1: { scheduleType },
      2: { selectedDates: getCurrentSelectedDates() },
      3: { selectedTime },
    }));
  }, [scheduleType, selectedDates, selectedTime]);

  // Clear stepData when starting fresh (no data in any step)
  useEffect(() => {
    const hasAnyData =
      scheduleType !== "single" ||
      selectedDates.length > 0 ||
      selectedTime.start ||
      selectedTime.end;
    if (!hasAnyData) {
      setStepData({});
    }
  }, [scheduleType, selectedDates, selectedTime]);

  // Update highest step reached
  useEffect(() => {
    if (currentStep > highestStepReached) {
      setHighestStepReached(currentStep);
    }
  }, [currentStep]);

  // Check if a step is completed
  const isStepCompleted = (stepIndex) => {
    switch (stepIndex) {
      case 1:
        return !!scheduleType;
      case 2:
        return hasValidSelectedDates();
      case 3:
        return selectedTime.start && selectedTime.end;
      case 4:
        // For delete mode, only need valid dates
        if (isDeleteMode) {
          return hasValidSelectedDates();
        }
        return (
          hasValidSelectedDates() && selectedTime.start && selectedTime.end
        );
      default:
        return false;
    }
  };

  // Check if step data has changed
  const hasStepDataChanged = (stepIndex) => {
    const currentData = stepData[stepIndex];
    if (!currentData) return false;

    if (stepIndex === 1) {
      return currentData.scheduleType !== scheduleType;
    } else if (stepIndex === 2) {
      const currentSelectedDates = getCurrentSelectedDates();
      // Only show change if there are actually selected dates
      if (
        currentSelectedDates.length === 0 &&
        (!currentData.selectedDates || currentData.selectedDates.length === 0)
      ) {
        return false;
      }
      return (
        JSON.stringify(currentData.selectedDates) !==
        JSON.stringify(currentSelectedDates)
      );
    } else if (stepIndex === 3) {
      // Only show change if there are actually selected times
      if (
        !selectedTime.start &&
        !selectedTime.end &&
        !currentData.selectedTime?.start &&
        !currentData.selectedTime?.end
      ) {
        return false;
      }
      return (
        JSON.stringify(currentData.selectedTime) !==
        JSON.stringify(selectedTime)
      );
    }
    return false;
  };

  // Check if can navigate to step
  const canNavigateToStep = (targetStep) => {
    // Cannot navigate when loading
    if (loading) return false;

    // Can always go back
    if (targetStep <= currentStep) return true;

    // Can go to immediate next step if current step is complete
    if (targetStep === currentStep + 1) {
      switch (currentStep) {
        case 1:
          return scheduleType; // Step 1 complete if schedule type selected
        case 2:
          return hasValidSelectedDates(); // Step 2 complete if valid dates selected
        case 3:
          // For delete mode, we don't need time selection
          if (isDeleteMode) {
            return hasValidSelectedDates();
          }
          return selectedTime.start && selectedTime.end; // Step 3 complete if times selected
        default:
          return false;
      }
    }

    // Can go to any step that has been completed (has data)
    if (targetStep <= highestStepReached) {
      switch (targetStep) {
        case 2:
          return hasValidSelectedDates(); // Can go to step 2 if it has valid data
        case 3:
          // For delete mode, we don't need time selection
          if (isDeleteMode) {
            return hasValidSelectedDates();
          }
          return (
            hasValidSelectedDates() && selectedTime.start && selectedTime.end
          ); // Can go to step 3 if both dates and times are set
        case 4:
          // For delete mode, only need valid dates
          if (isDeleteMode) {
            return hasValidSelectedDates();
          }
          return (
            hasValidSelectedDates() && selectedTime.start && selectedTime.end
          ); // Can go to step 4 if all previous steps complete
        default:
          return true;
      }
    }

    return false;
  };

  // Reset dependent steps when earlier step changes
  const resetDependentSteps = (changedStep) => {
    if (changedStep === 1) {
      // Schedule type changed - reset dates and times
      setSelectedDates([]);
      setSelectedTime({ start: "", end: "" });

      setMonthlyYear(new Date().getFullYear());
      setMonthlyMonth(new Date().getMonth());
      setMonthlyDaysOfWeek([1, 2, 3, 4, 5]);
    } else if (changedStep === 2) {
      // Dates changed - reset times, but preserve in edit mode if already set
      if (mode !== "edit" || (!selectedTime.start && !selectedTime.end)) {
        setSelectedTime({ start: "", end: "" });
      }
    }
    // Step 3 and 4 don't need to reset anything when going back
  };

  // Navigate to a specific step
  const goToStep = (step) => {
    if (step >= 1 && step <= 4 && canNavigateToStep(step)) {
      // Only reset dependent steps if going forward, not backward
      if (step > currentStep) {
        resetDependentSteps(currentStep);
      }

      // Validate dates only when navigating TO step 3 (not when coming FROM step 3)
      // Skip validation in delete mode since we don't need time selection
      if (
        step === 3 &&
        currentStep !== 3 &&
        step > currentStep &&
        !isDeleteMode
      ) {
        const isValid = validateDatesForStep3();
        if (!isValid) {
          return; // Don't proceed if validation fails
        }
      }

      // Reset delete mode when going back from step 4
      if (currentStep === 4 && step < 4 && isDeleteMode) {
        setIsDeleteMode(false);
      }

      setCurrentStep(step);

      // Update URL without triggering Inertia's loading modal
      const targetRoute =
        mode === "edit"
          ? route("admin.schedules.edit", scheduleId)
          : route("admin.schedules.create");

      const queryParams = { step };

      router.get(targetRoute, queryParams, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      });
    }
  };

  // Handle schedule type change
  const handleScheduleTypeChange = (newType) => {
    if (newType !== scheduleType) {
      setScheduleType(newType);
      resetDependentSteps(1);

      // Initialize weekly schedule with current week and remaining weekdays only
      if (newType === "weekly") {
        const now = new Date();
        const week = weeklyUtils.getWeekDates(now);
        setWeekBaseDate(week[0]);
        setWeekDates(week);

        // Only select weekdays (Monday-Friday) that are available
        let remainingWeekdays = weeklyUtils.getRemainingWeekdays(now);
        
        // Filter out today if it's blocked by buffer
        if (settings?.timeBuffer && settings?.timeSlots && settings?.slotDuration) {
          const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
          if (!bufferInfo.isTodayBookable) {
            // Remove today from remaining weekdays if buffer blocks it
            const today = new Date();
            remainingWeekdays = remainingWeekdays.filter(weekday => 
              !scheduleUtils.startOfDay(weekday).getTime() === scheduleUtils.startOfDay(today).getTime()
            );
          }
        }
        
        setSelectedWeek({
          baseDate: week[0],
          days: remainingWeekdays.map((d) => d.getDay()),
        });
        setSelectedDays(remainingWeekdays.map((d) => d.getDay()));
      }
    }
  };

  // Handle date selection - Maintain SSOT with flat Date objects
  const handleDateSelect = (dates) => {
    // Ensure we always have flat Date objects in selectedDates (SSOT)
    const flatDates = dates
      .flat()
      .filter((date) => {
        if (date instanceof Date && !isNaN(date.getTime())) {
          return true;
        } else if (typeof date === "string") {
          const parsedDate = new Date(date);
          return !isNaN(parsedDate.getTime());
        }
        return false;
      })
      .map((date) => {
        return date instanceof Date ? date : new Date(date);
      });

    setSelectedDates(flatDates);
    datesModifiedRef.current = true; // Mark that user has modified the dates
  };

  // Weekly-specific handlers (like legacy)
  const handleWeeklyDateSelect = async (date) => {
    const week = weeklyUtils.getWeekDates(date);
    setWeekBaseDate(week[0]);
    setWeekDates(week);

    const now = scheduleUtils.startOfDay(new Date());

    // Exclude days with schedules or in the past
    const allSchedules = week.flatMap((d) => {
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
      const monthSchedules = loadedMonths[monthStr] || [];

      return monthSchedules.filter((sched) => {
        const schedStart = new Date(sched.start_time);
        const schedEnd = new Date(sched.end_time);
        return (
          scheduleUtils.startOfDay(d) >= scheduleUtils.startOfDay(schedStart) &&
          scheduleUtils.startOfDay(d) <= scheduleUtils.startOfDay(schedEnd)
        );
      });
    });

    // In edit mode, include existing batch dates + available days
    let availableDays;
    if (mode === "edit" && originalData && originalData.batchId) {
      // Get existing batch dates that fall within this week
      const existingBatchDates = week.filter((d) => {
        const dateStr = d.toISOString().slice(0, 10);
        return originalData.selectedDates.some((originalDate) => {
          const originalDateStr = new Date(originalDate)
            .toISOString()
            .slice(0, 10);
          return dateStr === originalDateStr;
        });
      });

      // Get available days (future days without conflicts)
      const futureAvailableDays = week.filter((d) => {
        const isFuture =
          scheduleUtils.startOfDay(d) >= now ||
          scheduleUtils.startOfDay(d).getTime() === now.getTime();
        const hasConflict = allSchedules.some((sched) => {
          const schedStart = new Date(sched.start_time);
          const schedEnd = new Date(sched.end_time);
          return (
            scheduleUtils.startOfDay(d) >=
              scheduleUtils.startOfDay(schedStart) &&
            scheduleUtils.startOfDay(d) <= scheduleUtils.startOfDay(schedEnd)
          );
        });

        // Check if today is blocked by buffer
        const isToday = scheduleUtils.startOfDay(d).getTime() === scheduleUtils.startOfDay(now).getTime();
        let isBlockedByBuffer = false;
        
        if (isToday && settings.timeBuffer && settings.timeSlots && settings.slotDuration) {
          const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
          isBlockedByBuffer = !bufferInfo.isTodayBookable;
        }

        return isFuture && !hasConflict && !isBlockedByBuffer;
      });

      // Combine existing batch dates with available days
      availableDays = [
        ...new Set([...existingBatchDates, ...futureAvailableDays]),
      ];
    } else {
      // Create mode: Select ALL days (including weekends) that are available and don't have conflicts
      availableDays = week.filter((d) => {
        const isFuture =
          scheduleUtils.startOfDay(d) >= now ||
          scheduleUtils.startOfDay(d).getTime() === now.getTime();
        const hasConflict = allSchedules.some((sched) => {
          const schedStart = new Date(sched.start_time);
          const schedEnd = new Date(sched.end_time);
          return (
            scheduleUtils.startOfDay(d) >=
              scheduleUtils.startOfDay(schedStart) &&
            scheduleUtils.startOfDay(d) <= scheduleUtils.startOfDay(schedEnd)
          );
        });

        // Check if today is blocked by buffer
        const isToday = scheduleUtils.startOfDay(d).getTime() === scheduleUtils.startOfDay(now).getTime();
        let isBlockedByBuffer = false;
        
        if (isToday && settings.timeBuffer && settings.timeSlots && settings.slotDuration) {
          const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
          isBlockedByBuffer = !bufferInfo.isTodayBookable;
        }

        return isFuture && !hasConflict && !isBlockedByBuffer;
      });
    }

    const newSelectedDays = availableDays.map((d) => d.getDay());

    setSelectedWeek({ baseDate: week[0], days: newSelectedDays });
    setSelectedDays(newSelectedDays);

    // CRITICAL FIX: Also set selectedDates with the actual date objects
    // This is what React Calendar uses for the value prop and --active class
    setSelectedDates(availableDays);
    datesModifiedRef.current = true; // Mark that user has modified the dates
  };

  const handleWeeklyDayToggle = (day) => {
    // Only allow toggling to today or future days
    const dayDate = weekDates.find((d) => d.getDay() === day);
    const now = scheduleUtils.startOfDay(new Date());
    if (!dayDate || scheduleUtils.startOfDay(dayDate) < now) return; // Don't allow toggling past days

    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    setSelectedDays(newSelectedDays);
    setSelectedWeek((prev) => {
      if (!prev) return prev;
      const newDays = prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });

    // CRITICAL FIX: Update selectedDates to match the new selectedDays
    const newSelectedDates = weekDates.filter((d) => {
      const isFuture = scheduleUtils.startOfDay(d) >= now;

      // In edit mode, exclude current batch from conflict checking
      let hasConflict = false;
      if (mode === "edit" && originalData && originalData.batchId) {
        // Check if this date is part of the current batch being edited
        const isCurrentBatchDate = originalData.selectedDates.some(
          (originalDate) => {
            const originalDateStr = new Date(originalDate)
              .toISOString()
              .slice(0, 10);
            const currentDateStr = d.toISOString().slice(0, 10);
            return originalDateStr === currentDateStr;
          },
        );

        if (isCurrentBatchDate) {
          // This date is part of the current batch, so no conflict
          hasConflict = false;
        } else {
          // Check for conflicts with other schedules (excluding current batch)
          const monthStr = `${d.getFullYear()}-${String(
            d.getMonth() + 1,
          ).padStart(2, "0")}`;
          const monthSchedules = loadedMonths[monthStr] || [];
          hasConflict = monthSchedules.some((sched) => {
            const schedStart = new Date(sched.start_time);
            const schedEnd = new Date(sched.end_time);
            return (
              scheduleUtils.startOfDay(d) >=
                scheduleUtils.startOfDay(schedStart) &&
              scheduleUtils.startOfDay(d) <= scheduleUtils.startOfDay(schedEnd)
            );
          });
        }
      } else {
        // Create mode: Check for conflicts with all schedules
        const monthStr = `${d.getFullYear()}-${String(
          d.getMonth() + 1,
        ).padStart(2, "0")}`;
        const monthSchedules = loadedMonths[monthStr] || [];
        hasConflict = monthSchedules.some((sched) => {
          const schedStart = new Date(sched.start_time);
          const schedEnd = new Date(sched.end_time);
          return (
            scheduleUtils.startOfDay(d) >=
              scheduleUtils.startOfDay(schedStart) &&
            scheduleUtils.startOfDay(d) <= scheduleUtils.startOfDay(schedEnd)
          );
        });
      }

      // Check if today is blocked by buffer
      const isToday = scheduleUtils.startOfDay(d).getTime() === scheduleUtils.startOfDay(now).getTime();
      let isBlockedByBuffer = false;
      
      if (isToday && settings.timeBuffer && settings.timeSlots && settings.slotDuration) {
        const bufferInfo = getBufferInfo(settings.timeBuffer, settings.timeSlots, settings.slotDuration);
        isBlockedByBuffer = !bufferInfo.isTodayBookable;
      }

      return isFuture && !hasConflict && !isBlockedByBuffer && newSelectedDays.includes(d.getDay());
    });

    setSelectedDates(newSelectedDates);
    datesModifiedRef.current = true; // Mark that user has modified the dates
  };

  // Monthly schedule handlers
  const handleMonthlyMonthSelect = (year, month) => {
    setMonthlyYear(year);
    setMonthlyMonth(month);
  };

  const handleMonthlyDateSelectionChange = (
    year,
    month,
    daysOfWeek,
    selectedDates,
  ) => {
    setMonthlyYear(year);
    setMonthlyMonth(month);
    setMonthlyDaysOfWeek(daysOfWeek);

    // SSOT approach: selectedDates is the single source of truth
    const newSelectedDates = (selectedDates || []).filter(
      (d) => d && !isNaN(d),
    );

    // Always update selectedDates (SSOT)
    setSelectedDates(newSelectedDates);

    datesModifiedRef.current = true; // Mark that user has modified the dates
  };

  // Handle time selection
  const handleTimeChange = (time) => {
    setSelectedTime(time);
    timeModifiedRef.current = true; // Mark that user has modified the time
  };

  // Check if can proceed to next step
  const canProceedToNext = () => {
    const canProceed = (() => {
      switch (currentStep) {
        case 1:
          return scheduleType;
        case 2:
          const hasValid = hasValidSelectedDates();
          return hasValid;
        case 3:
          return selectedTime.start && selectedTime.end;
        case 4:
          // For delete mode, only need valid dates
          if (isDeleteMode) {
            return hasValidSelectedDates();
          }
          return (
            hasValidSelectedDates() && selectedTime.start && selectedTime.end
          );
        default:
          return false;
      }
    })();

    return canProceed;
  };

  // Handle delete functionality - new flow: go to Step 4 for preview
  const handleDeleteClick = () => {
    // Set delete mode and go to Step 4 for preview
    setIsDeleteMode(true);
    setCurrentStep(4);
    setHighestStepReached(Math.max(highestStepReached, 4));
  };

  const handleDeleteConfirm = () => {
    router.delete(route("admin.schedules.destroy", scheduleId), {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, action: null });
        setIsDeleteMode(false);
        // Backend will handle the redirect to index page
      },
      onError: (errors) => {
        setDeleteModal({ isOpen: false, action: null });
        setIsDeleteMode(false);
        setSubmissionError("Failed to delete schedule. Please try again.");
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, action: null });
    setIsDeleteMode(false);
  };

  // Handle final confirmation
  const handleConfirm = () => {
    // Handle delete mode
    if (isDeleteMode) {
      setDeleteModal({ isOpen: true, action: "delete" });
      return;
    }

    if (!canProceedToNext()) return;

    setShowLoadingSnackbar(true);
    setSubmissionError(null);

    // Generate the schedule data based on type
    let scheduleData;
    let routeName;

    if (scheduleType === "single") {
      // For single schedules, use the dates array format for consistency
      const primaryDate = getCurrentSelectedDates()[0];

      // With SSOT maintained, primaryDate should always be a valid Date object
      if (
        !primaryDate ||
        !(primaryDate instanceof Date) ||
        isNaN(primaryDate.getTime())
      ) {
        setShowLoadingSnackbar(false);
        setSubmissionError("Invalid date selected. Please try again.");
        return;
      }

      scheduleData = {
        scheduleType: scheduleType,
        dates: [
          {
            date: primaryDate.toISOString().slice(0, 10),
            start_time: selectedTime.start,
            end_time: selectedTime.end,
          },
        ],
      };
    } else {
      // For batch schedules (weekly/monthly), use the batch format
      const currentDates = getCurrentSelectedDates();

      // With SSOT maintained, all dates should be valid Date objects
      if (currentDates.length === 0) {
        setShowLoadingSnackbar(false);
        setSubmissionError("No dates selected. Please try again.");
        return;
      }

      scheduleData = {
        scheduleType: scheduleType,
        dates: currentDates.map((date) => ({
          date: date.toISOString().slice(0, 10),
          start_time: selectedTime.start,
          end_time: selectedTime.end,
        })),
      };

      // Add type-specific data
      if (scheduleType === "weekly") {
        scheduleData.selected_days = selectedDays;
        scheduleData.week_base_date = weekBaseDate?.toISOString().slice(0, 10);
      } else if (scheduleType === "monthly") {
        scheduleData.monthly_year = monthlyYear;
        scheduleData.monthly_month = monthlyMonth;
        scheduleData.monthly_days_of_week = monthlyDaysOfWeek;
        scheduleData.monthly_selected_dates = selectedDates.map((date) =>
          date.toISOString().slice(0, 10),
        );
      }
    }

    // Add edit mode data
    if (mode === "edit") {
      scheduleData.mode = "edit";
      scheduleData.scheduleId = scheduleId;
      scheduleData.originalData = originalData;
      routeName = "admin.schedules.update";
    } else {
      routeName = "admin.schedules.store";
    }

    const method = mode === "edit" ? "put" : "post";
    const url =
      mode === "edit" ? route(routeName, scheduleId) : route(routeName);

    router[method](url, scheduleData, {
      onSuccess: () => {
        setShowLoadingSnackbar(false);
      },
      onError: (errors) => {
        setShowLoadingSnackbar(false);
        // Convert errors object to string message
        const errorMessage =
          errors.start_time ||
          errors.end_time ||
          errors.date ||
          errors.dates ||
          "An error occurred while saving the schedule.";
        setSubmissionError(errorMessage);
      },
    });
  };

  // Handle Inertia validation errors from page props
  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      const errorMessage =
        pageErrors.dates ||
        pageErrors.start_time ||
        pageErrors.end_time ||
        "Validation error occurred.";
      setSubmissionError(errorMessage);
    }
  }, [pageErrors]);

  // Clear submission error when user navigates or makes changes
  useEffect(() => {
    if (submissionError) {
      setSubmissionError(null);
    }
  }, [currentStep, scheduleType, selectedDates, selectedTime]);

  const steps = [
    {
      step: 1,
      label: "Schedule Type",
      description: "Choose your schedule type",
    },
    { step: 2, label: "Select Dates", description: "Pick your dates" },
    { step: 3, label: "Select Time", description: "Choose time slots" },
    { step: 4, label: "Review & Confirm", description: "Review and create" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Loading and Error Snackbars */}
      {showLoadingSnackbar && (
        <div className="fixed bottom-4 left-4 z-50 w-full max-w-sm">
          <Alert variant="loading" message="Loading schedule data..." />
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 left-4 z-50 w-full max-w-sm">
          <Alert
            variant="error"
            message={typeof error === "string" ? error : "An error occurred"}
            onClose={() => {
              if (submissionError) {
                setSubmissionError(null);
              }
              // Clear page errors by refreshing without errors
              if (pageErrors && Object.keys(pageErrors).length > 0) {
                router.reload({ only: ["errors"] });
              }
            }}
          />
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Schedules", href: route("admin.schedules") },
            {
              label: mode === "edit" ? "Edit" : "Create",
              href:
                mode === "edit"
                  ? route("admin.schedules.edit", scheduleId)
                  : route("admin.schedules.create"),
            },
            { label: `Step ${currentStep}` },
          ]}
        />
      </div>

      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "edit" ? "Edit Schedule" : "Create Schedule"}
          </h1>
          <div className="flex items-center gap-2">
            {mode === "edit" && scheduleId && (
              <DeleteButton onDelete={handleDeleteClick}>
                Delete Schedule
              </DeleteButton>
            )}
            <button
              onClick={() => router.visit(route("admin.schedules"))}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Stepper UI */}
        <Stepper
          steps={steps.map(({ step, label, description }) => ({
            id: step,
            title: label,
            description: description
          }))}
          currentStep={currentStep}
          onStepClick={(stepId) => {
            if (canNavigateToStep(stepId)) {
              goToStep(stepId);
            }
          }}
          variant="default"
          disabled={false}
        />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 1 && (
          <StepTypeSelector
            scheduleType={scheduleType}
            onChange={handleScheduleTypeChange}
            settings={settings}
            selectedDates={getCurrentSelectedDates()}
            selectedTime={selectedTime}
            loading={loading}
            mode={mode}
          />
        )}

        {currentStep === 2 && (
          <StepDateSelector
            selectedDates={getCurrentSelectedDates()}
            onSelectDate={handleDateSelect}
            schedules={schedules}
            settings={settings}
            loading={loading}
            error={error}
            scheduleType={scheduleType}
            // Weekly-specific props
            selectedDays={selectedDays}
            weekDates={weekDates}
            onWeekDateSelect={handleWeeklyDateSelect}
            onDayToggle={handleWeeklyDayToggle}
            loadedMonths={loadedMonths}
            // Monthly-specific props
            monthlyYear={monthlyYear}
            monthlyMonth={monthlyMonth}
            monthlyDaysOfWeek={monthlyDaysOfWeek}
            onMonthlyMonthSelect={handleMonthlyMonthSelect}
            onDateSelectionChange={handleMonthlyDateSelectionChange}
            // Edit mode props
            mode={mode}
            originalData={originalData}
            scheduleId={scheduleId}
          />
        )}

        {currentStep === 3 && (
          <StepTimeSelector
            selectedDates={getCurrentSelectedDates()}
            selectedTime={selectedTime}
            onTimeChange={handleTimeChange}
            schedules={schedules}
            settings={settings}
            loading={loading}
            error={error}
            scheduleType={scheduleType}
            mode={mode}
            scheduleId={scheduleId}
          />
        )}

        {currentStep === 4 && (
          <StepReviewConfirm
            scheduleType={scheduleType}
            selectedDates={getCurrentSelectedDates()}
            selectedTime={selectedTime}
            settings={settings}
            onConfirm={handleConfirm}
            processing={loading}
            mode={isDeleteMode ? "delete" : mode}
            originalData={originalData}
            changes={changes}
            scheduleId={scheduleId}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        <div className="flex gap-2">
          {currentStep < 4 ? (
            <button
              onClick={() => goToStep(currentStep + 1)}
              disabled={!canProceedToNext() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Next"}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!canProceedToNext() || loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                isDeleteMode
                  ? "bg-red-600 hover:bg-red-700"
                  : mode === "edit"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? isDeleteMode
                  ? "Processing..."
                  : mode === "edit"
                    ? "Updating..."
                    : "Creating..."
                : isDeleteMode
                  ? "Delete Schedule"
                  : mode === "edit"
                    ? "Update Schedule"
                    : "Create Schedule"}
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Schedule"
        message={
          scheduleType === "single"
            ? "Are you sure you want to delete this schedule? This action cannot be undone."
            : scheduleType === "weekly"
              ? `Are you sure you want to delete all ${getCurrentSelectedDates().length} weekly schedules? This action cannot be undone.`
              : `Are you sure you want to delete all ${getCurrentSelectedDates().length} monthly schedules? This action cannot be undone.`
        }
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default ScheduleStepper;
