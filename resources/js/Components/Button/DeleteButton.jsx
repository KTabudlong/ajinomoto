export default function DeleteButton({ onDelete, children }) {
  return (
    <button
      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
      type="button"
      onClick={onDelete}
    >
      {children}
    </button>
  );
}
