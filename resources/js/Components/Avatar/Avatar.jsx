import React from "react";
import { cn } from "@/utils";

function Avatar({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, src, alt = "", ...props }) {
  return (
    <img
      className={cn("aspect-square h-full w-full", className)}
      src={src}
      alt={alt}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
