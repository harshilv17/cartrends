import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely (used by all UI components). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number to a fixed number of decimals, dropping trailing zeros. */
export function round(n: number, decimals = 1) {
  return Number(n.toFixed(decimals));
}

/** Format an ISO date string to a short readable form e.g. "12 May 2026". */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
