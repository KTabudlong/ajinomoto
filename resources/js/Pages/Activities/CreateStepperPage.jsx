import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Alert, Stepper } from "@/Components";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import StepActivityTypeSelector from "./components/StepActivityTypeSelector";
import StepDateSelector from "./components/StepDateSelector";
import StepDetailsInput from "./components/StepDetailsInput";
import StepReviewConfirm from "./components/StepReviewConfirm";

const CreateStepperPage = ({ errors: pageErrors, ...props }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStepReached, setHighestStepReached] = useState(1);
  const [stepData, setStepData] = useState({});
  const [showLoadingSnackbar, setShowLoadingSnackbar] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // SSOT: Centralized state management
  const [activityType, setActivityType] = useState("");
  const [activityTitle, setActivityTitle] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [frequencyConfig, setFrequencyConfig] = useState({});
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [activityDescription, setActivityDescription] = useState("");

  // Check if a step is completed
  const isStepCompleted = (stepIndex) => {
    switch (stepIndex) {
      case 1:
        return !!activityType;
      case 2:
        return startDate && (activityType === "single" || endDate);
      case 3:
        return activityTitle.trim() && selectedSite && selectedTopic && activityDescription.trim();
      case 4:
        return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3);
      default:
        return false;
    }
  };

  // Check if step data has changed
  const hasStepDataChanged = (stepIndex) => {
    const currentData = stepData[stepIndex];
    if (!currentData) return false;

    if (stepIndex === 1) {
      return currentData.activityType !== activityType;
    } else if (stepIndex === 2) {
      return (
        currentData.startDate !== startDate ||
        currentData.endDate !== endDate ||
        JSON.stringify(currentData.frequencyConfig) !== JSON.stringify(frequencyConfig)
      );
    } else if (stepIndex === 3) {
      return (
        currentData.selectedSite !== selectedSite ||
        currentData.selectedTopic !== selectedTopic ||
        currentData.activityDescription !== activityDescription
      );
    }
    return false;
  };

  // Check if can navigate to step
  const canNavigateToStep = (targetStep) => {
    // Can always go back
    if (targetStep <= currentStep) return true;

    // Can go to immediate next step if current step is complete
    if (targetStep === currentStep + 1) {
      return isStepCompleted(currentStep);
    }

    // Can go to any step that has been completed (has data)
    if (targetStep <= highestStepReached) {
      return isStepCompleted(targetStep);
    }

    return false;
  };

  // Reset dependent steps when earlier step changes
  const resetDependentSteps = (changedStep) => {
    if (changedStep === 1) {
      // Activity type changed - reset dates and details
      setStartDate(null);
      setEndDate(null);
      setFrequencyConfig({});
      setActivityTitle("");
      setSelectedSite("");
      setSelectedTopic("");
      setActivityDescription("");
    } else if (changedStep === 2) {
      // Dates changed - reset details
      setActivityTitle("");
      setSelectedSite("");
      setSelectedTopic("");
      setActivityDescription("");
    }
  };

  // Navigate to a specific step
  const goToStep = (step) => {
    if (step >= 1 && step <= 4 && canNavigateToStep(step)) {
      // Only reset dependent steps if going forward, not backward
      if (step > currentStep) {
        resetDependentSteps(currentStep);
      }

      setCurrentStep(step);

      // Update URL without triggering Inertia's loading modal
      const queryParams = { step };
      router.get(route("admin.activities.create"), queryParams, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      });
    }
  };

  // Update step data when state changes
  useEffect(() => {
    setStepData((prev) => ({
      ...prev,
      1: { activityType },
      2: { startDate, endDate, frequencyConfig },
      3: { activityTitle, selectedSite, selectedTopic, activityDescription },
    }));
  }, [activityType, activityTitle, startDate, endDate, frequencyConfig, selectedSite, selectedTopic, activityDescription]);

  // Update highest step reached
  useEffect(() => {
    if (currentStep > highestStepReached) {
      setHighestStepReached(currentStep);
    }
  }, [currentStep]);

  // Check if can proceed to next step
  const canProceedToNext = () => {
    return isStepCompleted(currentStep);
  };

      // Handle final confirmation
    const handleConfirm = () => {
      if (!canProceedToNext()) return;

      setShowLoadingSnackbar(true);
      setSubmissionError(null);

      const activityData = {
        title: activityTitle,
        activity_type_id: activityType,
        start_date: startDate,
        end_date: endDate,
        frequency_config: frequencyConfig,
        site_id: selectedSite,
        topic_id: selectedTopic,
        description: activityDescription,
      };

      router.post(route("activities.store"), activityData, {
        onSuccess: () => {
          setShowLoadingSnackbar(false);
        },
        onError: (errors) => {
          setShowLoadingSnackbar(false);
          const errorMessage = Object.values(errors)[0] || "An error occurred while saving the activity.";
          setSubmissionError(errorMessage);
        },
      });
    };

  // Handle Inertia validation errors from page props
  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      const errorMessage = Object.values(pageErrors)[0] || "Validation error occurred.";
      setSubmissionError(errorMessage);
    }
  }, [pageErrors]);

  // Clear submission error when user navigates or makes changes
  useEffect(() => {
    if (submissionError) {
      setSubmissionError(null);
    }
  }, [currentStep, activityType, activityTitle, startDate, endDate, selectedSite, selectedTopic, activityDescription]);

  const steps = [
    {
      step: 1,
      label: "Activity Type",
      description: "Choose your activity frequency",
    },
    {
      step: 2,
      label: "Select Dates",
      description: "Pick start and end dates",
    },
    {
      step: 3,
      label: "Input Details",
      description: "Title, site, topic, and description",
    },
    {
      step: 4,
      label: "Review & Confirm",
      description: "Review and create",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Loading and Error Snackbars */}
      {showLoadingSnackbar && (
        <div className="fixed bottom-4 left-4 z-50 w-full max-w-sm">
          <Alert variant="loading" message="Loading activity data..." />
        </div>
      )}

      {submissionError && (
        <div className="fixed bottom-4 left-4 z-50 w-full max-w-sm">
          <Alert
            variant="error"
            message={submissionError}
            onClose={() => setSubmissionError(null)}
          />
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="mb-6">
                 <Breadcrumbs
           items={[
             { label: "Activities", href: route("activities.index") },
             { label: "Create", href: route("activities.create") },
             { label: `Step ${currentStep}` },
           ]}
         />
      </div>

      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Activity</h1>
                     <button
             onClick={() => router.visit(route("activities.index"))}
             className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
           >
             Cancel
           </button>
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
          <StepActivityTypeSelector
            activityType={activityType}
            onChange={setActivityType}
          />
        )}

        {currentStep === 2 && (
          <StepDateSelector
            activityType={activityType}
            startDate={startDate}
            endDate={endDate}
            frequencyConfig={frequencyConfig}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onFrequencyConfigChange={setFrequencyConfig}
          />
        )}

        {currentStep === 3 && (
          <StepDetailsInput
            activityTitle={activityTitle}
            selectedSite={selectedSite}
            selectedTopic={selectedTopic}
            activityDescription={activityDescription}
            onTitleChange={setActivityTitle}
            onSiteChange={setSelectedSite}
            onTopicChange={setSelectedTopic}
            onDescriptionChange={setActivityDescription}
          />
        )}

        {currentStep === 4 && (
          <StepReviewConfirm
            activityType={activityType}
            activityTitle={activityTitle}
            startDate={startDate}
            endDate={endDate}
            frequencyConfig={frequencyConfig}
            selectedSite={selectedSite}
            selectedTopic={selectedTopic}
            activityDescription={activityDescription}
            onConfirm={handleConfirm}
            processing={showLoadingSnackbar}
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
              disabled={!canProceedToNext()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!canProceedToNext() || showLoadingSnackbar}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showLoadingSnackbar ? "Creating..." : "Create Activity"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStepperPage;
