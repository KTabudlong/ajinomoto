import React from "react";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import TableEmptyState from "./TableEmptyState";

/**
 * Table Component - Single Responsibility: Orchestrates table rendering
 * Open/Closed Principle: Extensible through props without modification
 */
export default function Table({
  columns = [],
  rows = [],
  getRowDetailsUrl,
  emptyStateMessage = "No data found.",
  className = "overflow-x-auto bg-white rounded shadow",
}) {
  return (
    <div className={className}>
      <table className="w-full whitespace-nowrap">
        <TableHeader columns={columns} />
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
