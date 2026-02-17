/**
 * Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence handling
 *
 * Combines clsx for conditional class names with tailwind-merge to ensure
 * later classes override earlier ones (e.g., "p-4 p-6" becomes "p-6")
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary-500', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
