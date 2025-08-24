import React from "react";

const StepReviewColorLegend = ({ mode = "create" }) => {
  if (mode === "create") {
    return (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Calendar Legend
        </h4>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-600">Selected dates</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Calendar Legend
      </h4>
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-600">Added dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-gray-600">Removed dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border-2 border-gray-300"
            style={{ backgroundColor: "#6B7280" }}
          ></div>
          <span className="text-gray-600">Unchanged dates</span>
        </div>
      </div>
    </div>
  );
};

export default StepReviewColorLegend;
