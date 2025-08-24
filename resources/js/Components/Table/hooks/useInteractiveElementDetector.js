import React from "react";
import { Link } from "@inertiajs/react";

/**
 * Custom Hook - Single Responsibility: Detects interactive elements
 * Dependency Inversion: Abstracted logic for element detection
 */
export function useInteractiveElementDetector(element) {
  const detectInteractiveElements = (element) => {
    if (!React.isValidElement(element)) {
      return false;
    }

    // Check if the element itself is interactive
    if (element.type === "button" || element.type === Link) {
      return true;
    }

    // Check if the element has interactive children
    if (element.props && element.props.children) {
      const children = React.Children.toArray(element.props.children);
      return children.some((child) => {
        if (React.isValidElement(child)) {
          return (
            child.type === "button" ||
            child.type === Link ||
            detectInteractiveElements(child)
          );
        }
        return false;
      });
    }

    return false;
  };

  return detectInteractiveElements(element);
}
