/**
 * Time Buffer Utility Functions
 * Handles time buffer calculations for schedule creation
 */

/**
 * Calculate the earliest allowed start time based on current time and buffer
 * @param {number} bufferHours - Buffer hours required in advance
 * @param {Date} currentTime - Current time (defaults to now)
 * @returns {Date} - Earliest allowed start time
 */
export const calculateEarliestStartTime = (bufferHours = 3, currentTime = new Date()) => {
  const earliestTime = new Date(currentTime);
  earliestTime.setHours(earliestTime.getHours() + bufferHours);
  
  // Round up to the next hour since we use hourly time slots
  earliestTime.setMinutes(0, 0, 0); // Set to XX:00:00.000
  
  return earliestTime;
};

/**
 * Check if a specific time is within the allowed buffer period
 * @param {Date} targetTime - The time to check
 * @param {number} bufferHours - Buffer hours required in advance
 * @param {Date} currentTime - Current time (defaults to now)
 * @returns {boolean} - True if time is allowed, false if blocked by buffer
 */
export const isTimeAllowedByBuffer = (targetTime, bufferHours = 3, currentTime = new Date()) => {
  const earliestAllowed = calculateEarliestStartTime(bufferHours, currentTime);
  

  
  return targetTime >= earliestAllowed;
};

/**
 * Calculate the latest possible start time based on user's time slots and slot duration
 * @param {Array} userTimeSlots - Array of available time slots (e.g., ['09:00', '10:00', ...])
 * @param {number} slotDurationMinutes - Duration of each slot in minutes
 * @returns {Date} - Latest possible start time for today
 */
export const calculateLatestPossibleStartTime = (userTimeSlots = [], slotDurationMinutes = 60) => {
  if (!userTimeSlots.length) return null;
  
  const today = new Date();
  const latestSlot = userTimeSlots[userTimeSlots.length - 1];
  
  if (!latestSlot) return null;
  
  // Parse the latest time slot
  const [hours, minutes] = latestSlot.split(':').map(Number);
  const latestTime = new Date(today);
  latestTime.setHours(hours, minutes, 0, 0);
  
  // The latest time slot IS the latest start time
  // (e.g., if last slot is 8:00 PM, you can start at 8:00 PM and end at 9:00 PM)
  return latestTime;
};

/**
 * Check if a specific date/time combination is bookable
 * @param {Date} targetDateTime - The date and time to check
 * @param {Array} userTimeSlots - Array of available time slots
 * @param {number} slotDurationMinutes - Duration of each slot in minutes
 * @param {number} bufferHours - Buffer hours required in advance
 * @param {Date} currentTime - Current time (defaults to now)
 * @returns {Object} - Result object with isBookable flag and reason
 */
export const isDateTimeBookable = (
  targetDateTime,
  userTimeSlots = [],
  slotDurationMinutes = 60,
  bufferHours = 3,
  currentTime = new Date()
) => {


  // Check if target time is in the past
  if (targetDateTime <= currentTime) {

    return {
      isBookable: false,
      reason: 'Time is in the past',
      code: 'PAST_TIME'
    };
  }

  // Check buffer restriction
  if (!isTimeAllowedByBuffer(targetDateTime, bufferHours, currentTime)) {
    const earliestAllowed = calculateEarliestStartTime(bufferHours, currentTime);

    return {
      isBookable: false,
      reason: `Must be booked at least ${bufferHours} hours in advance`,
      code: 'BUFFER_RESTRICTION',
      earliestAllowed
    };
  }

  // Check if time falls within user's available slots
  const isWithinTimeSlots = userTimeSlots.some(slot => {
    const slotTime = new Date();
    const [hours, minutes] = slot.split(':').map(Number);
    slotTime.setHours(hours, minutes, 0, 0);
    
    const slotEndTime = new Date(slotTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDurationMinutes);
    
    return targetDateTime >= slotTime && targetDateTime < slotEndTime;
  });

  if (!isWithinTimeSlots) {
    return {
      isBookable: false,
      reason: 'Time is outside available time slots',
      code: 'OUTSIDE_TIME_SLOTS'
    };
  }

  return {
    isBookable: true,
    reason: 'Time is available for booking',
    code: 'AVAILABLE'
  };
};

/**
 * Get buffer information for display purposes
 * @param {number} bufferHours - Buffer hours required in advance
 * @param {Array} userTimeSlots - Array of available time slots
 * @param {number} slotDurationMinutes - Duration of each slot in minutes
 * @returns {Object} - Buffer information for UI display
 */
export const getBufferInfo = (bufferHours = 3, userTimeSlots = [], slotDurationMinutes = 60) => {
  const currentTime = new Date();
  const earliestAllowed = calculateEarliestStartTime(bufferHours, currentTime);
  
  // Calculate the latest possible start time for today
  const latestPossibleStart = calculateLatestPossibleStartTime(userTimeSlots, slotDurationMinutes);
  
  // Check if today is still bookable
  const isTodayBookable = latestPossibleStart && latestPossibleStart > earliestAllowed;
  
  // Get the actual latest time the user can start today (considering buffer)
  const latestAllowedStartToday = isTodayBookable ? latestPossibleStart : null;
  
  return {
    bufferHours,
    currentTime,
    earliestAllowed,
    latestPossibleStart,
    isTodayBookable,
    latestAllowedStartToday,
    message: `Schedules must be created at least ${bufferHours} hours in advance`,
    nextAvailableTime: earliestAllowed.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    todayStatus: isTodayBookable 
      ? `Latest start time today: ${latestAllowedStartToday?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
      : 'Today is no longer bookable due to time buffer'
  };
};
