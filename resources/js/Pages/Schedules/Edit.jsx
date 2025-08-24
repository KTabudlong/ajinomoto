import { useEffect, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Clock, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import CustomCalendar from "@/Components/CustomCalendar";

import MainLayout from "@/Layouts/MainLayout";
import Breadcrumbs from "@/Components/Breadcrumbs/Breadcrumbs";
import LoadingButton from "@/Components/Button/LoadingButton";
import LinkButton from "@/Components/LinkButton";
import {
  calculateTimeDiffSameDate,
  convert24HTo12HFormat,
  getDateTimeWithDayOfWeek,
} from "@/utils";

// Time slots in 1-hour intervals
const timeSlots = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const Edit = () => {
  const { schedule } = usePage().props;

  const { data, setData, errors, put, processing } = useForm({
    date: new Date(schedule.start_time),
    start_time: "",
    end_time: "",
    _method: "put",
  });

  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [duration, setDuration] = useState("");

  const handleDateChange = (dates) => {
    // CustomCalendar returns an array, but we need a single date for edit
    const date = Array.isArray(dates) ? dates[0] : dates;
    setData({ ...data, date });
  };

  const handleStartTimeSelect = (time) => {
    setSelectedStartTime(time);
    setData({ ...data, start_time: time });

    // Auto-select end time 1 hour later
    const timeIndex = timeSlots.indexOf(time);
    const endTimeIndex = Math.min(timeIndex + 1, timeSlots.length - 1);
    const endTime = timeSlots[endTimeIndex];
    setSelectedEndTime(endTime);
    setData({ ...data, start_time: time, end_time: endTime });

    calculateDuration(time, endTime);
  };

  const handleEndTimeSelect = (time) => {
    if (selectedStartTime && time > selectedStartTime) {
      setSelectedEndTime(time);
      setData({ ...data, end_time: time });
      calculateDuration(selectedStartTime, time);
    }
  };

  const calculateDuration = (start, end) => {
    const { hours, minutes } = calculateTimeDiffSameDate(data.date, [
      start,
      end,
    ]);
    setDuration(
      `${hours} hr${hours !== 1 ? "s" : ""}${minutes > 0 ? ` ${minutes} min` : ""}`,
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStartTime || !selectedEndTime) {
      alert("Please select both start and end times");
      return;
    }
    put(route("admin.schedules.update", schedule.id));
  };

  useEffect(() => {
    // Initialize with existing schedule data
    const startTime = new Date(schedule.start_time).toLocaleTimeString(
      "en-US",
      {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      },
    );
    const endTime = new Date(schedule.end_time).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setData({
      ...data,
      start_time: startTime,
      end_time: endTime,
    });
    calculateDuration(startTime, endTime);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    return convert24HTo12HFormat(time);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Schedules", href: route("admin.schedules") },
              { label: schedule.name, href: "#" },
            ]}
          />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Edit Schedule
          </h1>
          <p className="text-gray-600 mt-2">
            Update your schedule date and time
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Session Summary */}
          {selectedStartTime && selectedEndTime && (
            <div className="p-6 bg-green-50 border-b border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="text-lg font-semibold text-green-900">
                    Schedule Updated
                  </p>
                  <p className="text-green-700">
                    {formatDate(data.date)} • {formatTime(selectedStartTime)} -{" "}
                    {formatTime(selectedEndTime)} • {duration}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div>
                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Select Date
                  </h2>
                </div>
                <CustomCalendar
                  selectedDates={[data.date]}
                  onDateSelect={handleDateChange}
                  minDate={new Date()}
                  className="w-full border-0 shadow-none"
                  showTooltips={false}
                  showScheduleDots={false}
                  ariaLabel="Schedule Edit Calendar"
                />
                {data.date && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm font-medium text-indigo-900">
                      Selected: {formatDate(data.date)}
                    </p>
                  </div>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <div className="flex items-center mb-4">
                  <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Select Time
                  </h2>
                </div>

                {data.date ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Start Time */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Start Time
                        </h3>
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleStartTimeSelect(time)}
                              className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                                selectedStartTime === time
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {formatTime(time)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* End Time */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          End Time
                        </h3>
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleEndTimeSelect(time)}
                              disabled={
                                !selectedStartTime || time <= selectedStartTime
                              }
                              className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                                selectedEndTime === time
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : !selectedStartTime ||
                                      time <= selectedStartTime
                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {formatTime(time)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Please select a date first to choose your time</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-end gap-4">
              <LinkButton
                href={route("admin.schedules")}
                className="!px-6 !py-3 !text-sm !font-bold !tracking-normal"
                variant="gray"
              >
                Cancel
              </LinkButton>

              <LoadingButton
                loading={processing}
                type="submit"
                onClick={handleSubmit}
                disabled={!selectedStartTime || !selectedEndTime}
                className="btn-indigo"
              >
                Update Schedule
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 */
Edit.layout = (page) => <MainLayout title="Edit Schedule" children={page} />;

export default Edit;
