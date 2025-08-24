import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * TooltipPortal renders its children in a portal positioned at the given coordinates.
 * Usage:
 * <TooltipPortal x={number} y={number} visible={boolean}>{children}</TooltipPortal>
 */
export default function TooltipPortal({ x, y, visible, children }) {
  const [container] = useState(() => document.createElement("div"));
  const portalRoot = useRef(document.getElementById("tooltip-root"));

  useEffect(() => {
    if (!portalRoot.current) {
      const root = document.createElement("div");
      root.id = "tooltip-root";
      document.body.appendChild(root);
      portalRoot.current = root;
    }
    portalRoot.current.appendChild(container);
    return () => {
      if (portalRoot.current.contains(container)) {
        portalRoot.current.removeChild(container);
      }
    };
  }, [container]);

  useEffect(() => {
    if (container) {
      container.style.position = "fixed";
      container.style.left = `${x}px`;
      container.style.top = `${y}px`;
      container.style.zIndex = 99999;
      container.style.pointerEvents = visible ? "auto" : "none";
      container.style.display = visible ? "block" : "none";
    }
  }, [x, y, visible, container]);

  return createPortal(children, container);
}
