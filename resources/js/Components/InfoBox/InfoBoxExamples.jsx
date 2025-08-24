import React from "react";
import { InfoBox } from "./index";

/**
 * Examples of how to use the InfoBox component
 * This demonstrates the SOLID principles in action
 */

// Example 1: Basic Info Box
export const BasicInfoExample = () => (
  <InfoBox
    type="info"
    title="Information"
    message="This is a basic information message."
  />
);

// Example 2: Success Message
export const SuccessExample = () => (
  <InfoBox
    type="success"
    title="Success!"
    message="Your action was completed successfully."
  />
);

// Example 3: Warning Message
export const WarningExample = () => (
  <InfoBox
    type="warning"
    title="Warning"
    message="Please review your input before proceeding."
  />
);

// Example 4: Error Message
export const ErrorExample = () => (
  <InfoBox
    type="error"
    title="Error"
    message="Something went wrong. Please try again."
  />
);

// Example 5: Custom Icon
export const CustomIconExample = () => (
  <InfoBox
    type="info"
    title="Custom Icon"
    message="This info box uses a custom icon."
    icon={
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
  />
);

// Example 6: With Children (Complex Content)
export const ComplexContentExample = () => (
  <InfoBox
    type="info"
    title="Complex Content"
    message="This info box contains additional content:"
  >
    <ul className="list-disc list-inside mt-2 space-y-1">
      <li>First item with additional details</li>
      <li>Second item with more information</li>
      <li>Third item with extended content</li>
    </ul>
  </InfoBox>
);

// Example 7: Template Usage (like in email blast create)
export const TemplateUsageExample = ({ templateName }) => (
  <InfoBox
    type="info"
    title={`Using saved template: ${templateName}`}
    message="The 'Save as Template' option is hidden because you're using an existing template."
  />
);

// Example 8: Form Validation Error
export const FormErrorExample = ({ errors }) => (
  <InfoBox type="error" title="Please fix the following errors:">
    <ul className="list-disc list-inside mt-2 space-y-1">
      {errors.map((error, index) => (
        <li key={index}>{error}</li>
      ))}
    </ul>
  </InfoBox>
);

// Example 9: Loading State
export const LoadingExample = () => (
  <InfoBox
    type="info"
    title="Processing..."
    message="Please wait while we process your request."
    icon={
      <svg
        className="h-5 w-5 animate-spin"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
          clipRule="evenodd"
        />
      </svg>
    }
  />
);

// Example 10: Responsive Usage
export const ResponsiveExample = () => (
  <div className="space-y-4">
    <InfoBox
      type="info"
      title="Responsive Design"
      message="This info box adapts to different screen sizes."
      className="sm:text-base text-sm"
    />
  </div>
);
