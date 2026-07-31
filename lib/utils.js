import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional Tailwind classes without style-order conflicts.
 * Usage: cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
