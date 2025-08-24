import React from "react";
import SortableTableHeader from "./SortableTableHeader";
import TableBody from "./TableBody";
import TableEmptyState from "./TableEmptyState";

/**
 * SortableTable Component - Single Responsibility: Orchestrates sortable table rendering
 * Open/Closed Principle: Extensible through props without modification
 */
export default function SortableTable({
  columns = [],
  rows = [],
  getRowDetailsUrl,
  emptyStateMessage = "No data found.",
  className = "overflow-x-auto bg-white rounded shadow",
  currentSortBy = "created_at",
  currentSortOrder = "desc",
  onSort,
}) {
  return (
    <div className={className}>
      <table className="w-full whitespace-nowrap">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <SortableTableHeader
                key={column.name}
                column={column.name}
                label={column.label}
                currentSortBy={currentSortBy}
                currentSortOrder={currentSortOrder}
                onSort={onSort}
                sortable={column.sortable}
              />
            ))}
          </tr>
        </thead>
        <TableBody
          columns={columns}
          rows={rows}
          getRowDetailsUrl={getRowDetailsUrl}
          emptyStateMessage={emptyStateMessage}
        />
      </table>
    </div>
  );
}
