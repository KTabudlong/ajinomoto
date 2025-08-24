import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  CalendarDays,
} from 'lucide-react';
import Breadcrumbs from '@/Components/Breadcrumbs/Breadcrumbs';
import ScheduleListFilters from './ScheduleListFilters';
import ScheduleListTable from './ScheduleListTable';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleWeeklyView from './ScheduleWeeklyView';
import ScheduleLegend from './ScheduleLegend';
import ConfirmationModal from '@/Components/Modal/ConfirmationModal';

const ScheduleIndexLayout = ({
  schedules = [],
  filters = {},
  loading = false,
  onEdit,
  onDelete,
  onRestore,
  settings = {}, // Add settings prop for day colors
  auth = null, // Add auth prop for user role
}) => {
  const user = auth?.user;
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar', 'weekly', or 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // Add selectedMonth state for weekly view

  const [restoreModal, setRestoreModal] = useState({
    isOpen: false,
    schedule: null,
  });

  // Handle ResourceCollection nested structure
  const data = schedules.data?.data || schedules.data || schedules;
  const links = schedules.data?.links || schedules.links || [];
  const tableData = Array.isArray(data) ? data : [];

  // Filter schedules for current month - include all schedules that fall within the month
  // Note: For calendar views, we don't apply search filters to show all schedules
  const currentMonthSchedules = useMemo(() => {
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return tableData.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth;
    });
  }, [tableData, currentMonth]);

  // Filter schedules for current week
  // Note: For weekly view, we don't apply search filters to show all schedules
  const currentWeekSchedules = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    // Start from Monday (getDay() returns 0-6, where 0 is Sunday)
    // Convert to Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const dayOffset = currentWeek.getDay() === 0 ? 6 : currentWeek.getDay() - 1;
    startOfWeek.setDate(currentWeek.getDate() - dayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return tableData.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
    });
  }, [tableData, currentWeek]);

  // For list view, apply enhanced filters
  const filteredTableData = useMemo(() => {
    if (viewMode !== 'list') return tableData;

    let filtered = tableData;



    // Apply year filter
    if (filters?.year) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.start_time);
        return scheduleDate.getFullYear().toString() === filters.year;
      });
    }

    // Apply month filter
    if (filters?.month) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.start_time);
        const month = (scheduleDate.getMonth() + 1).toString().padStart(2, '0');
        return month === filters.month;
      });
    }

    // Apply day filter
    if (filters?.day) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.start_time);
        const day = scheduleDate.getDate().toString().padStart(2, '0');
        return day === filters.day;
      });
    }



    // Apply batch ID filter
    if (filters?.batch_id) {
      filtered = filtered.filter(schedule => {
        const batchId = schedule.batch_id || '';
        return batchId.toLowerCase().includes(filters.batch_id.toLowerCase());
      });
    }

    // Apply start time filter
    if (filters?.start_time) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.start_time);
        const timeString = scheduleDate.toTimeString().slice(0, 5);
        return timeString === filters.start_time;
      });
    }

    // Apply end time filter
    if (filters?.end_time) {
      filtered = filtered.filter(schedule => {
        const scheduleDate = new Date(schedule.end_time);
        const timeString = scheduleDate.toTimeString().slice(0, 5);
        return timeString === filters.end_time;
      });
    }

    return filtered;
  }, [tableData, viewMode, filters]);

  // Handle month change for calendar view
  const handleMonthChange = newMonth => {
    setCurrentMonth(newMonth);
  };

  // Handle month change for weekly view (also resets currentWeek to first day of new month)
  const handleSelectedMonthChange = newMonth => {
    setSelectedMonth(newMonth);
    // Reset currentWeek to the first day of the newly selected month
    const firstDayOfMonth = new Date(
      newMonth.getFullYear(),
      newMonth.getMonth(),
      1
    );
    setCurrentWeek(firstDayOfMonth);
  };

  // Handle week selection from week pills
  const handleWeekSelect = week => {
    setCurrentWeek(week);
  };

  // Event handlers
  const handleEdit = schedule => {
    onEdit?.(schedule);
  };

  const handleDelete = schedule => {
    // Go to edit page with delete intent - component will automatically enter delete mode
    router.visit(
      route('admin.schedules.edit', {
        schedule: schedule.id,
        intent: 'delete',
      })
    );
  };

  const handleRestore = schedule => {
    setRestoreModal({ isOpen: true, schedule });
  };

  const handleRestoreConfirm = () => {
    if (restoreModal.schedule) {
      onRestore?.(restoreModal.schedule);
      setRestoreModal({ isOpen: false, schedule: null });
    }
  };

  const handleRestoreCancel = () => {
    setRestoreModal({ isOpen: false, schedule: null });
  };



  // Handle enhanced filters change
  const handleFiltersChange = newFilters => {
    const currentFilters = { ...filters, ...newFilters };
    router.get(route('admin.schedules'), currentFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Handle view mode change
  const handleViewModeChange = mode => {
    setViewMode(mode);
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { 
            label: user?.role_id === 1 ? "Admin Panel" : "Admin", 
            href: user?.role_id === 1 ? route("admin.super.dashboard") : route("admin.dashboard") 
          },
          { label: "Schedules", href: route("admin.schedules") },
        ]}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your tutoring schedules and sessions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href={route('admin.schedules.create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Schedule
          </Link>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => handleViewModeChange('calendar')}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
            viewMode === 'calendar'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Calendar
        </button>
        <button
          onClick={() => handleViewModeChange('weekly')}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
            viewMode === 'weekly'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Weekly
        </button>
        <button
          onClick={() => handleViewModeChange('list')}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
            viewMode === 'list'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <List className="w-4 h-4 mr-2" />
          List
        </button>
      </div>

      {/* Global Legend - Visible across all views */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <ScheduleLegend />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {viewMode === 'calendar' && (
          <ScheduleCalendar
            schedules={currentMonthSchedules}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMonthChange={handleMonthChange}
            currentMonth={currentMonth}
            loading={loading}
            dayColors={settings.dayColors}
          />
        )}

        {viewMode === 'weekly' && (
          <ScheduleWeeklyView
            schedules={currentWeekSchedules}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onWeekSelect={handleWeekSelect}
            currentWeek={currentWeek}
            loading={loading}
            dayColors={settings.dayColors}
            selectedMonth={selectedMonth}
            onMonthChange={handleSelectedMonthChange}
          />
        )}

        {viewMode === 'list' && (
          <>
            {/* Enhanced Filters */}
            <div className="p-4 border-b border-gray-200">
              <ScheduleListFilters
                currentFilters={filters}
                onFiltersChange={handleFiltersChange}
                routeName="admin.schedules"
              />
            </div>

            {/* Enhanced Sortable Table */}
            <ScheduleListTable
              schedules={filteredTableData}
              currentFilters={filters}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />

            {/* Pagination */}
            {links.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <nav className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    {links[0]?.url && (
                      <Link
                        href={links[0].url}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Previous
                      </Link>
                    )}
                    {links[links.length - 1]?.url && (
                      <Link
                        href={links[links.length - 1].url}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {tableData.length > 0 ? 1 : 0}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">{tableData.length}</span>{' '}
                        of{' '}
                        <span className="font-medium">{tableData.length}</span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        {links.map((link, index) => (
                          <Link
                            key={index}
                            href={link.url || '#'}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              link.active
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } ${
                              !link.url ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                            onClick={e => !link.url && e.preventDefault()}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </div>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      <ConfirmationModal
        isOpen={restoreModal.isOpen}
        onClose={handleRestoreCancel}
        onConfirm={handleRestoreConfirm}
        title="Restore Schedule"
        message="Are you sure you want to restore this schedule?"
        confirmText="Restore"
        confirmVariant="primary"
      />
    </div>
  );
};

export default ScheduleIndexLayout;
