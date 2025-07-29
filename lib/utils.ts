import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const today = () => {
  return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
}