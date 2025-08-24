export default function SelectInput({
  name,
  error,
  className,
  options = [],
  children,
  ...props
}) {
  return (
    <select
      id={name}
      name={name}
      {...props}
      className={`form-select w-full focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 rounded ${
        error ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""
      }`}
    >
      {/* Support both options prop and children for flexibility */}
      {options && options.length > 0 ? (
        options.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))
      ) : (
        children
      )}
    </select>
  );
}
