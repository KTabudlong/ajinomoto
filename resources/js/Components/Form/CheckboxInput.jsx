export function CheckboxInput({
  label,
  name,
  variant = "indigo", // Default to indigo theme
  size = "md", // Size variants
  disabled = false,
  className = "",
  labelClassName = "",
  ...props
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case "blue":
        return "text-blue-600 focus:ring-blue-600";
      case "green":
        return "text-green-600 focus:ring-green-600";
      case "red":
        return "text-red-600 focus:ring-red-600";
      case "yellow":
        return "text-yellow-600 focus:ring-yellow-600";
      case "purple":
        return "text-purple-600 focus:ring-purple-600";
      case "gray":
        return "text-gray-600 focus:ring-gray-600";
      case "indigo":
      default:
        return "text-indigo-600 focus:ring-indigo-600";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-3 h-3 mr-2";
      case "lg":
        return "w-5 h-5 mr-3";
      case "md":
      default:
        return "w-4 h-4 mr-2";
    }
  };

  const getLabelSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-base";
      case "md":
      default:
        return "text-sm";
    }
  };

  return (
    <label
      className={`flex items-center select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      htmlFor={name}
    >
      <input
        id={name}
        name={name}
        type="checkbox"
        disabled={disabled}
        className={`form-checkbox rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${getVariantClasses()} ${getSizeClasses()}`}
        {...props}
      />
      <span className={`${getLabelSizeClasses()} ${labelClassName}`}>
        {label}
      </span>
    </label>
  );
}
