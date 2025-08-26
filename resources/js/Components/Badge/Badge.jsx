import React from "react";
import { cn } from "@/utils";

const badgeVariants = {
  default: "bg-blue-100 text-blue-800 border-blue-200",
  secondary: "bg-gray-100 text-gray-800 border-gray-200",
  destructive: "bg-red-100 text-red-800 border-red-200",
  outline: "border border-gray-200 text-gray-700",
};

const Badge = ({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
