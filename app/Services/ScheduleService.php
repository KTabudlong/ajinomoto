<?php

namespace App\Services;

use App\Repositories\ScheduleRepository;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ScheduleService
{
    protected $scheduleRepository;

    public function __construct(ScheduleRepository $scheduleRepository)
    {
        $this->scheduleRepository = $scheduleRepository;
    }

    /**
     * Create a single schedule
     */
    public function createSingleSchedule(array $data, int $userId, string $userTimezone): array
    {
        // Convert local time to UTC
        $startTime = Carbon::parse($data['date'] . ' ' . $data['start_time'], $userTimezone)->setTimezone('UTC');
        $endTime = Carbon::parse($data['date'] . ' ' . $data['end_time'], $userTimezone)->setTimezone('UTC');

        // Check for conflicts
        if ($this->scheduleRepository->hasConflict($userId, $startTime, $endTime)) {
            throw new \Exception('This schedule conflicts with an existing schedule.');
        }

        // Check time buffer restriction
        $this->validateTimeBuffer($startTime);

        // Generate batch ID for single schedule (for consistency)
        $batchId = 's_' . Str::ulid();
        
        // Create schedule
        $scheduleData = [
            'user_id' => $userId,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'batch_id' => $batchId,
        ];

        $schedule = $this->scheduleRepository->create($scheduleData);

        return [
            'success' => true,
            'message' => 'Schedule created successfully.',
            'schedule' => $schedule
        ];
    }

    /**
     * Create multiple schedules in batch
     */
    public function createBatchSchedules(array $dates, int $userId, string $userTimezone, string $scheduleType = 'single'): array
    {
        // Generate batch ID with schedule type prefix
        $prefix = match($scheduleType) {
            'single' => 's_',
            'weekly' => 'w_',
            'monthly' => 'm_',
            default => 's_'
        };
        $batchId = $prefix . Str::ulid();
        $schedules = [];
        $conflicts = [];

        // Validate and prepare schedules
        foreach ($dates as $index => $dateInfo) {
            $startTime = Carbon::parse($dateInfo['date'] . ' ' . $dateInfo['start_time'], $userTimezone)->setTimezone('UTC');
            $endTime = Carbon::parse($dateInfo['date'] . ' ' . $dateInfo['end_time'], $userTimezone)->setTimezone('UTC');

            // Check for conflicts
            if ($this->scheduleRepository->hasConflict($userId, $startTime, $endTime)) {
                $conflicts[] = [
                    'index' => $index,
                    'date' => $dateInfo['date'],
                    'time' => $dateInfo['start_time'] . ' - ' . $dateInfo['end_time']
                ];
            }

            // Check time buffer restriction
            try {
                $this->validateTimeBuffer($startTime);
            } catch (\Exception $e) {
                $conflicts[] = [
                    'index' => $index,
                    'date' => $dateInfo['date'],
                    'time' => $dateInfo['start_time'] . ' - ' . $dateInfo['end_time'],
                    'reason' => $e->getMessage()
                ];
            }

            $schedules[] = [
                'user_id' => $userId,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'batch_id' => $batchId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // If there are conflicts, throw exception
        if (!empty($conflicts)) {
            throw new \Exception('One or more schedules in this batch conflict with existing schedules.');
        }

        // Create all schedules
        $createdSchedules = $this->scheduleRepository->createBatch($schedules);

        $count = $createdSchedules->count();
        $message = $count > 1 ? "Batch schedules created successfully." : "Schedule created successfully.";

        return [
            'success' => true,
            'message' => $message,
            'count' => $count,
            'schedules' => $createdSchedules
        ];
    }

    /**
     * Get schedules for a specific date range
     */
    public function getSchedulesForDateRange(int $userId, string $startDate, string $endDate, string $userTimezone): Collection
    {
        $start = Carbon::parse($startDate . ' 00:00:00', $userTimezone)->setTimezone('UTC');
        $end = Carbon::parse($endDate . ' 23:59:59', $userTimezone)->setTimezone('UTC');

        return $this->scheduleRepository->findByDateRange($userId, $start, $end);
    }

    /**
     * Get schedules for a specific date
     */
    public function getSchedulesForDate(int $userId, string $date, string $userTimezone): Collection
    {
        $dateCarbon = Carbon::parse($date, $userTimezone)->setTimezone('UTC');
        
        return $this->scheduleRepository->findByDate($userId, $dateCarbon);
    }

    /**
     * Check if a time slot is available
     */
    public function isTimeSlotAvailable(int $userId, Carbon $startTime, Carbon $endTime, ?int $excludeScheduleId = null): bool
    {
        return !$this->scheduleRepository->hasConflict($userId, $startTime, $endTime, $excludeScheduleId);
    }

    /**
     * Update a schedule (legacy method for single schedule updates)
     */
    public function updateSchedule(int $scheduleId, array $data, int $userId, string $userTimezone): array
    {
        $schedule = Schedule::findOrFail($scheduleId);

        // If updating time, check for conflicts
        if (isset($data['start_time']) || isset($data['end_time'])) {
            $startTime = isset($data['start_time']) 
                ? Carbon::parse($data['date'] . ' ' . $data['start_time'], $userTimezone)->setTimezone('UTC')
                : $schedule->start_time;
            
            $endTime = isset($data['end_time'])
                ? Carbon::parse($data['date'] . ' ' . $data['end_time'], $userTimezone)->setTimezone('UTC')
                : $schedule->end_time;

            if ($this->scheduleRepository->hasConflict($userId, $startTime, $endTime, $scheduleId)) {
                throw new \Exception('This schedule conflicts with an existing schedule.');
            }
        }

        $updated = $this->scheduleRepository->update($schedule, $data);

        return [
            'success' => $updated,
            'message' => $updated ? 'Schedule updated successfully.' : 'Failed to update schedule.',
            'schedule' => $schedule->fresh()
        ];
    }

    /**
     * Update schedule from stepper (handles single and batch schedules)
     */
    public function updateScheduleFromStepper(int $scheduleId, array $data, int $userId, string $userTimezone): array
    {
        $schedule = Schedule::findOrFail($scheduleId);
        $originalData = $data['originalData'] ?? null;
        
        if (!$originalData) {
            throw new \Exception('Original data is required for stepper updates.');
        }

        // Handle single schedule updates
        if ($originalData['scheduleType'] === 'single') {
            return $this->updateSingleScheduleFromStepper($schedule, $data, $userId, $userTimezone);
        }
        
        // Handle batch schedule updates (weekly/monthly)
        return $this->updateBatchScheduleFromStepper($schedule, $data, $userId, $userTimezone);
    }

    /**
     * Update single schedule from stepper
     */
    private function updateSingleScheduleFromStepper(Schedule $schedule, array $data, int $userId, string $userTimezone): array
    {
        $dates = $data['dates'] ?? [];
        if (empty($dates)) {
            throw new \Exception('No dates provided for update.');
        }

        $dateInfo = $dates[0];
        $startTime = Carbon::parse($dateInfo['date'] . ' ' . $dateInfo['start_time'], $userTimezone)->setTimezone('UTC');
        $endTime = Carbon::parse($dateInfo['date'] . ' ' . $dateInfo['end_time'], $userTimezone)->setTimezone('UTC');

        // Check for conflicts (excluding current schedule)
        if ($this->scheduleRepository->hasConflict($userId, $startTime, $endTime, $schedule->id)) {
            throw new \Exception('This schedule conflicts with an existing schedule.');
        }

        // Update the schedule
        $updateData = [
            'start_time' => $startTime,
            'end_time' => $endTime,
        ];

        $updated = $this->scheduleRepository->update($schedule, $updateData);

        return [
            'success' => $updated,
            'message' => $updated ? 'Schedule updated successfully.' : 'Failed to update schedule.',
            'schedule' => $schedule->fresh()
        ];
    }

    /**
     * Update batch schedule from stepper
     */
    private function updateBatchScheduleFromStepper(Schedule $schedule, array $data, int $userId, string $userTimezone): array
    {
        $originalData = $data['originalData'];
        $dates = $data['dates'] ?? [];
        
        if (empty($dates)) {
            throw new \Exception('No dates provided for update.');
        }

        // Get all schedules in the batch
        $batchSchedules = Schedule::where('batch_id', $schedule->batch_id)->get();
        
        // Check for conflicts with new dates/times
        foreach ($dates as $dateInfo) {
            $startTime = Carbon::parse($dateInfo['date'] . ' ' . $dateInfo['start_time'], $userTimezone)->setTimezone('UTC');
            $endTime = Carbon::parse($dateInfo['date'] . ' ' . $dateInfo['end_time'], $userTimezone)->setTimezone('UTC');
            
            // Check if this date conflicts with any existing schedule (excluding batch schedules)
            $conflictingSchedule = Schedule::where('user_id', $userId)
                ->where('id', '!=', $schedule->id)
                ->where('batch_id', '!=', $schedule->batch_id)
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->where(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<', $endTime)
                          ->where('end_time', '>', $startTime);
                    });
                })
                ->first();
                
            if ($conflictingSchedule) {
                throw new \Exception("Schedule conflicts with existing schedule on {$dateInfo['date']}.");
            }
        }

        // Update all schedules in the batch with new times
        $updateData = [
            'start_time' => Carbon::parse($dates[0]['date'] . ' ' . $dates[0]['start_time'], $userTimezone)->setTimezone('UTC'),
            'end_time' => Carbon::parse($dates[0]['date'] . ' ' . $dates[0]['end_time'], $userTimezone)->setTimezone('UTC'),
        ];

        $updatedCount = 0;
        foreach ($batchSchedules as $batchSchedule) {
            $newStartTime = Carbon::parse($batchSchedule->start_time)->format('Y-m-d') . ' ' . $dates[0]['start_time'];
            $newEndTime = Carbon::parse($batchSchedule->start_time)->format('Y-m-d') . ' ' . $dates[0]['end_time'];
            
            $batchUpdateData = [
                'start_time' => Carbon::parse($newStartTime, $userTimezone)->setTimezone('UTC'),
                'end_time' => Carbon::parse($newEndTime, $userTimezone)->setTimezone('UTC'),
            ];
            
            if ($this->scheduleRepository->update($batchSchedule, $batchUpdateData)) {
                $updatedCount++;
            }
        }

        // Handle date changes (add/remove dates)
        $this->handleBatchDateChanges($schedule, $originalData, $dates, $userId, $userTimezone);

        return [
            'success' => $updatedCount > 0,
            'message' => "Batch schedule updated successfully. {$updatedCount} schedules updated.",
            'updatedCount' => $updatedCount
        ];
    }

    /**
     * Handle adding/removing dates from batch schedules
     */
    private function handleBatchDateChanges(Schedule $schedule, array $originalData, array $newDates, int $userId, string $userTimezone): void
    {
        $originalDates = collect($originalData['selectedDates'])->map(fn($date) => Carbon::parse($date)->format('Y-m-d'))->toArray();
        $newDateStrings = collect($newDates)->pluck('date')->toArray();
        
        // Find dates to remove (in original but not in new)
        $datesToRemove = array_diff($originalDates, $newDateStrings);
        
        // Find dates to add (in new but not in original)
        $datesToAdd = array_diff($newDateStrings, $originalDates);
        
        // Remove dates (soft delete)
        if (!empty($datesToRemove)) {
            Schedule::where('batch_id', $schedule->batch_id)
                ->whereIn(DB::raw('DATE(start_time)'), $datesToRemove)
                ->update(['deleted_at' => now()]);
        }
        
        // Add new dates
        if (!empty($datesToAdd)) {
            $newSchedules = [];
            foreach ($datesToAdd as $date) {
                $startTime = Carbon::parse($date . ' ' . $newDates[0]['start_time'], $userTimezone)->setTimezone('UTC');
                $endTime = Carbon::parse($date . ' ' . $newDates[0]['end_time'], $userTimezone)->setTimezone('UTC');
                
                $newSchedules[] = [
                    'user_id' => $userId,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'batch_id' => $schedule->batch_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($newSchedules)) {
                DB::table('schedules')->insert($newSchedules);
            }
        }
    }

    /**
     * Delete a schedule
     */
    public function deleteSchedule(int $scheduleId): array
    {
        $schedule = Schedule::findOrFail($scheduleId);
        $deleted = $this->scheduleRepository->delete($schedule);

        return [
            'success' => $deleted,
            'message' => $deleted ? 'Schedule deleted successfully.' : 'Failed to delete schedule.'
        ];
    }

    /**
     * Get filtered schedules for a user
     */
    public function getFilteredSchedules(int $userId, array $filters): Collection
    {
        return $this->scheduleRepository->getFilteredSchedules($userId, $filters);
    }

    /**
     * Validate time buffer restriction
     * Ensures schedules are created at least the configured buffer hours in advance
     */
    private function validateTimeBuffer(Carbon $startTime): void
    {
        // Get buffer hours from admin settings (default to 3 hours)
        $bufferHours = (int) app(\App\Services\AdminSettingsService::class)->getValue('time_buffer_hours', '3');
        
        $now = Carbon::now();
        $earliestAllowed = $now->copy()->addHours($bufferHours);
        
        if ($startTime->lt($earliestAllowed)) {
            throw new \Exception("Schedules must be created at least {$bufferHours} hours in advance. Earliest allowed time: {$earliestAllowed->format('g:i A')}.");
        }
    }
} 