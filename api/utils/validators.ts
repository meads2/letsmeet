/**
 * Validation Utilities
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone);
};

/**
 * Validate date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  return date > new Date();
};

/**
 * Validate meeting time range
 */
export const isValidMeetingTimeRange = (
  startTime: Date,
  endTime: Date
): boolean => {
  return endTime > startTime;
};
