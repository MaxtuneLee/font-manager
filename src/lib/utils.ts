import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRealPath(path: string) {
  return __dirname.split('.next')[0].replaceAll('\\', '/') + path
}