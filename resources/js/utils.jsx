import {
  format as formatDateFns,
  differenceInMinutes,
  differenceInHours,
  parseISO,
} from "date-fns";

import classNames from "classnames";

export function fileSize(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    Number((size / Math.pow(1024, i)).toFixed(2)) +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

export function ucwords(str) {
  return str.toLowerCase().replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

export function getDateTimeWithDayOfWeek(dt, showTime = true) {
  // Always display in user's local time
  let date = typeof dt === "string" ? parseISO(dt) : new Date(dt);
  // If date is in UTC, convert to local time
  if (typeof dt === "string" && dt.endsWith("Z")) {
    // parseISO already returns local time, so nothing extra needed
  } else if (
    typeof dt === "string" &&
    dt.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  ) {
    // If it's an ISO string without Z, treat as local
  } else {
    // If it's a Date object or other string, ensure it's local
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }
  return formatDateFns(
    date,
    showTime ? "EEEE, MM/dd/yyyy HH:mm" : "EEEE, MM/dd/yyyy",
  );
}

export function convert24HTo12HFormat(time) {
  // time: "HH:mm" string
  const [h, m] = time.split(":");
  const date = new Date();
  date.setHours(Number(h));
  date.setMinutes(Number(m));
  return formatDateFns(date, "h:mm a");
}

/**
 * used prototype.split() on a 24hr format string eg: "01:30".split()
 * timeArr [timestart string, timeend string]
 */
export function calculateTimeDiffSameDate(date, timeArr) {
  // date: Date or string, timeArr: [start, end] in "HH:mm" format
  const base = typeof date === "string" ? parseISO(date) : new Date(date);
  const [startH, startM] = timeArr[0].split(":").map(Number);
  const [endH, endM] = timeArr[1].split(":").map(Number);
  const start = new Date(base);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(base);
  end.setHours(endH, endM, 0, 0);
  const minutes = differenceInMinutes(end, start);
  const hours = Math.floor(minutes / 60);
  return {
    milliseconds: end - start,
    days: 0,
    hours,
    minutes: minutes % 60,
    seconds: 0,
  };
}

/**
 * Utility function to combine class names with conditional logic
 * Uses classnames for conditional classes
 */
export function cn(...inputs) {
  return classNames(inputs);
}
