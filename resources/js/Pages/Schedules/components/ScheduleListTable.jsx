import React, { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { Edit, Trash2, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";

const ScheduleListTable = ({
  schedules = [],
  currentFilters = {},
  onEdit,
  onDelete,
  onRestore,
}) => {
  const [sortField, setSortField] = useState("start_time");
  const [sortOrder, setSortOrder] = useState("asc");

  // Sortable columns configuration
  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "start_time", label: "Start Time", sortable: true },
    { key: "end_time", label: "End Time", sortable: true },
    { key: "batch_id", label: "Batch ID", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Handle sorting
  const handleSort = (field) => {
    if (!columns.find(col => col.key === field)?.sortable) return;

    const newOrder = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);

    // Update URL with new sort parameters
    const newFilters = {
      ...currentFilters,
      sort_by: field,
      sort_order: newOrder,
    };

    router.get(route("admin.schedules"), newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Sort schedules
  const sortedSchedules = useMemo(() => {
    if (!schedules.length) return [];

    return [...schedules].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "date":
        case "start_time":
          aValue = new Date(a.start_time);
          bValue = new Date(b.start_time);
          break;
        case "end_time":
          aValue = new Date(a.end_time);
          bValue = new Date(b.end_time);
          break;
        case "batch_id":
          aValue = a.batch_id || "Single Session";
          bValue = b.batch_id || "Single Session";
          break;

        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [schedules, sortField, sortOrder]);

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (field !== sortField) return null;
    
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // Render table header
  const renderTableHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
              column.sortable
                ? "cursor-pointer hover:bg-gray-100 transition-colors"
                : ""
            }`}
            onClick={() => column.sortable && handleSort(column.key)}
          >
            <div className="flex items-center">
              {column.label}
              {column.sortable && renderSortIndicator(column.key)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  // Render table row
  const renderTableRow = (schedule) => {
    const scheduleDate = new Date(schedule.start_time);
    const endDate = new Date(schedule.end_time);

    return (
      <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
        {/* Date Column */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {scheduleDate.toLocaleDateString()}
        </td>

        {/* Start Time Column */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {scheduleDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>

        {/* End Time Column */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {endDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </td>

        {/* Batch ID Column */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {schedule.batch_id || "Single Session"}
          </span>
        </td>



        {/* Actions Column */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            {schedule.deleted_at ? (
              <button
                onClick={() => onRestore?.(schedule)}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                title="Restore schedule"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Restore
              </button>
            ) : (
              <>
                <button
                  onClick={() => onEdit?.(schedule)}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  title="Edit schedule"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(schedule)}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  title="Delete schedule"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <tr>
      <td
        colSpan={columns.length}
        className="px-6 py-12 text-center text-sm text-gray-500"
      >
        <div className="flex flex-col items-center">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            No schedules found
          </p>
          <p className="text-gray-500">
            Try adjusting your filters or create a new schedule.
          </p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {renderTableHeader()}
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedSchedules.length > 0 ? (
            sortedSchedules.map(renderTableRow)
          ) : (
            renderEmptyState()
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleListTable;
