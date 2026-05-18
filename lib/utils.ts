import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toCsvLine(value: string[]) {
  return value.join(", ");
}

export function fromCsvLine(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
