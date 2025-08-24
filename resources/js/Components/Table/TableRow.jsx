import React from "react";
import TableCell from "./TableCell";
import TableActionCell from "./TableActionCell";

/**
 * TableRow Component - Single Responsibility: Renders a single table row
 * Open/Closed Principle: Extensible through cell rendering strategies
 */
export default function TableRow({ row, columns = [], getRowDetailsUrl }) {
  return (
    <tr className="hover:bg-gray-100 focus-within:bg-gray-100">
      {columns.map((column) => (
        <TableCell
          key={column.name}
          column={column}
          row={row}
          getRowDetailsUrl={getRowDetailsUrl}
        />
      ))}
      {getRowDetailsUrl && (
        <TableActionCell row={row} getRowDetailsUrl={getRowDetailsUrl} />
      )}
    </tr>
  );
}
