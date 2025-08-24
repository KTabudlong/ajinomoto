import React from "react";
import ScheduleStepper from "./components/ScheduleStepper";
import MainLayout from "@/Layouts/MainLayout";

const CreateStepperPage = ({
  step = 1,
  errors,
  mode = "create",
  originalData = null,
  scheduleId = null,
  intent = null,
  ...props
}) => {
  return (
    <ScheduleStepper
      initialStep={parseInt(step, 10)}
      errors={errors}
      mode={mode}
      originalData={originalData}
      scheduleId={scheduleId}
      intent={intent}
      {...props}
    />
  );
};

/**
 * Persistent Layout (Inertia.js)
 *
 * [Learn more](https://inertiajs.com/pages#persistent-layouts)
 */
CreateStepperPage.layout = (page) => {
  const { mode } = page.props;
  const title = mode === "edit" ? "Edit Schedule" : "Create Schedule";
  return <MainLayout title={title} children={page} />;
};

export default CreateStepperPage;
