import React, { useState } from "react";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";
import InfoBox from "@/Components/InfoBox/InfoBox";
import { SCHEDULE_TYPE_DESCRIPTIONS } from "../utils";

const StepTypeSelector = ({
  scheduleType,
  onChange,
  settings = {},
  selectedDates = [],
  selectedTime = {},
  loading = false,
  mode = "create",
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingType, setPendingType] = useState(null);

  // Check if there's progress (if we have dates or times selected)
  const hasProgress = () => {
    // Check if there are any selected dates (for any schedule type)
    const hasSelectedDates = selectedDates && selectedDates.length > 0;

    // Check if there are any selected times
    const hasSelectedTimes =
      selectedTime && selectedTime.start && selectedTime.end;

    // Return true only if there's actual meaningful progress
    return hasSelectedDates || hasSelectedTimes;
  };

  const handleTypeClick = (type) => {
    if (type === scheduleType) return;
    if (hasProgress()) {
      setPendingType(type);
      setShowConfirm(true);
    } else {
      onChange(type);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onChange(pendingType);
    setPendingType(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingType(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select Schedule Type</h2>

      <div className="mb-4">
        <InfoBox
          type="info"
          title="Schedule Types"
          message="Choose the type of schedule you want to create. Each type has different options for date and time selection."
        />
      </div>

      <div className="mb-6">
        <div
          className="bg-blue-50 border border-blue-300 text-blue-900 rounded px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
        >
          <strong>Schedule Types:</strong>
          <ul className="list-disc ml-6 mt-1">
            <li>
              <span className="font-semibold">Single:</span>{" "}
              {SCHEDULE_TYPE_DESCRIPTIONS.single}
            </li>
            <li>
              <span className="font-semibold">Weekly:</span>{" "}
              {SCHEDULE_TYPE_DESCRIPTIONS.weekly}
            </li>
            <li>
              <span className="font-semibold">Monthly:</span>{" "}
              {SCHEDULE_TYPE_DESCRIPTIONS.monthly}
            </li>
          </ul>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        {["single", "weekly", "monthly"].map((type) => {
          // In edit mode, disable changing schedule type
          const isDisabled =
            loading || (mode === "edit" && type !== scheduleType);

          return (
            <button
              key={type}
              type="button"
              disabled={isDisabled}
              className={`px-4 py-2 rounded-full border font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                isDisabled
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : scheduleType === type
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => handleTypeClick(type)}
              aria-pressed={scheduleType === type}
              aria-disabled={isDisabled}
              title={
                isDisabled && mode === "edit" && type !== scheduleType
                  ? "Cannot change schedule type in edit mode"
                  : undefined
              }
            >
              {loading
                ? "Loading..."
                : type === "single"
                  ? "Single"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          );
        })}
      </div>

      <div
        className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 border border-gray-200"
        aria-live="polite"
      >
        <span className="font-semibold">
          {scheduleType === "single"
            ? "Single"
            : scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)}
          :
        </span>{" "}
        {SCHEDULE_TYPE_DESCRIPTIONS[scheduleType]}
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Change Schedule Type?"
        message="Changing the schedule type will reset all your current selections (dates, times, etc.). Are you sure you want to continue?"
        confirmText="Yes, reset and change type"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};

export default StepTypeSelector;
