import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { cn } from "@/utils";

const DropdownMenuContext = createContext();

function DropdownMenu({ children, ...props }) {
  return (
    <DropdownMenuContext.Provider value={{ ...props }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({ asChild = false, children, ...props }) {
  const [open, setOpen] = useState(false);
  
  if (asChild) {
    return React.cloneElement(children, {
      ...props,
      onClick: () => setOpen(!open),
    });
  }
  
  return (
    <button
      {...props}
      onClick={() => setOpen(!open)}
      className={cn("inline-flex items-center justify-center", props.className)}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({ 
  children, 
  className, 
  align = "center", 
  forceMount = false,
  ...props 
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: align === "end" ? rect.right - 200 : rect.left,
      });
    }
  }, [align]);

  if (!forceMount && !open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md animate-in fade-in-0 zoom-in-95",
        align === "end" && "right-0",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ 
  children, 
  className, 
  asChild = false,
  ...props 
}) {
  const Comp = asChild ? "div" : "button";
  
  return (
    <Comp
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

function DropdownMenuLabel({ 
  children, 
  className, 
  ...props 
}) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ 
  className, 
  ...props 
}) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
