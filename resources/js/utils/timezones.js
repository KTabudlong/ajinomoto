/**
 * Timezone utility service following SOLID principles
 * Single Responsibility: Only handles timezone data and formatting
 * Open/Closed: Easy to extend with new timezones without modifying existing code
 * Interface Segregation: Clean, focused API
 */

// Common US timezones with user-friendly labels
export const TIMEZONES = [
  { value: 'America/Chicago', label: 'Central Time (Chicago)', offset: 'UTC-6' },
  { value: 'America/New_York', label: 'Eastern Time', offset: 'UTC-5' },
  { value: 'America/Denver', label: 'Mountain Time', offset: 'UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time', offset: 'UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska Time', offset: 'UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time', offset: 'UTC-10' },
  { value: 'America/Phoenix', label: 'Arizona Time', offset: 'UTC-7' },
  { value: 'America/Indiana/Indianapolis', label: 'Indiana Time', offset: 'UTC-5' },
  { value: 'America/Detroit', label: 'Michigan Time', offset: 'UTC-5' },
  { value: 'America/Boise', label: 'Idaho Time', offset: 'UTC-7' },
];

// Default timezone (Chicago)
export const DEFAULT_TIMEZONE = 'America/Chicago';

/**
 * Get timezone by value
 * @param {string} value - Timezone value
 * @returns {Object|null} Timezone object or null if not found
 */
export const getTimezoneByValue = (value) => {
  return TIMEZONES.find(tz => tz.value === value) || null;
};

/**
 * Get timezone label by value
 * @param {string} value - Timezone value
 * @returns {string} Timezone label or empty string if not found
 */
export const getTimezoneLabel = (value) => {
  const timezone = getTimezoneByValue(value);
  return timezone ? timezone.label : '';
};

/**
 * Check if timezone is valid
 * @param {string} value - Timezone value to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidTimezone = (value) => {
  return TIMEZONES.some(tz => tz.value === value);
};

/**
 * Get timezone options for select components
 * @returns {Array} Array of timezone objects with value and label
 */
export const getTimezoneOptions = () => {
  return TIMEZONES.map(tz => ({
    value: tz.value,
    label: `${tz.label} (${tz.offset})`
  }));
};

/**
 * Get timezone options with offset information
 * @returns {Array} Array of timezone objects with value, label, and offset
 */
export const getTimezoneOptionsWithOffset = () => {
  return TIMEZONES.map(tz => ({
    value: tz.value,
    label: `${tz.label} (${tz.offset})`
  }));
};

/**
 * Format current time in specified timezone
 * @param {string} timezone - Timezone value
 * @param {Date} date - Date to format (defaults to current date)
 * @returns {string} Formatted time string
 */
export const formatTimeInTimezone = (timezone, date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.warn(`Invalid timezone: ${timezone}`);
    return 'Invalid timezone';
  }
};
