/**
 * Reusable TextArea component following SOLID principles
 *
 * Single Responsibility: Only handles textarea rendering and styling
 * Open/Closed: Extensible through props without modification
 * Liskov Substitution: Can be used anywhere a textarea is expected
 * Interface Segregation: Accepts only necessary props
 * Dependency Inversion: Depends on abstractions (props) not concrete implementations
 */
export default function TextArea({
  name,
  className = "",
  error = null,
  rows = 4,
  placeholder = "",
  value = "",
  onChange,
  disabled = false,
  required = false,
  ...props
}) {
  // Base styles that are always applied
  const baseStyles =
    "form-textarea w-full min-h-[100px] focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 rounded resize-vertical transition-colors duration-200";

  // Error state styles
  const errorStyles = error
    ? "border-red-400 focus:border-red-400 focus:ring-red-400"
    : "";

  // Disabled state styles
  const disabledStyles = disabled
    ? "bg-gray-100 cursor-not-allowed opacity-60"
    : "";

  // Combine all styles
  const combinedStyles =
    `${baseStyles} ${errorStyles} ${disabledStyles} ${className}`.trim();

  return (
    <textarea
      id={name}
      name={name}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      {...props}
      className={combinedStyles}
    />
  );
}
