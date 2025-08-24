import React from "react";
import TableRow from "./TableRow";
import TableEmptyState from "./TableEmptyState";

/**
 * TableBody Component - Single Responsibility: Manages table body rendering
 * Dependency Inversion: Depends on abstractions (TableRow, TableEmptyState)
 */
export default function TableBody({
  columns = [],
  rows = [],
  getRowDetailsUrl,
  emptyStateMessage = "No data found.",
}) {
  return (
    <tbody>
      {rows?.length === 0 ? (
        <TableEmptyState columns={columns} message={emptyStateMessage} />
      ) : (
        rows?.map((row, index) => (
          <TableRow
            key={row.id || row.uuid || `row-${index}`}
            row={row}
            columns={columns}
            getRowDetailsUrl={getRowDetailsUrl}
          />
        ))
      )}
    </tbody>
  );
}
