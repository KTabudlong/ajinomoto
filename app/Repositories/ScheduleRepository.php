<?php

namespace App\Repositories;

use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ScheduleRepository
{
    protected $model;

    public function __construct(Schedule $model)
    {
        $this->model = $model;
    }

    /**
     * Create a single schedule
     */
    public function create(array $data): Schedule
    {
        return $this->model->create($data);
    }

    /**
     * Create multiple schedules in batch
     */
    public function createBatch(array $schedules): Collection
    {
        $createdSchedules = [];
        
        foreach ($schedules as $scheduleData) {
            $createdSchedules[] = $this->model->create($scheduleData);
        }
        
        return $this->model->newCollection($createdSchedules);
    }

    /**
     * Find schedules for a specific date range
     */
    public function findByDateRange(int $userId, Carbon $startDate, Carbon $endDate): Collection
    {
        return $this->model
            ->where('user_id', $userId)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_time', [$startDate, $endDate])
                    ->orWhereBetween('end_time', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_time', '<', $startDate)
                            ->where('end_time', '>', $endDate);
                    });
            })
            ->get();
    }

    /**
     * Find schedules for a specific date
     */
    public function findByDate(int $userId, Carbon $date): Collection
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();
        
        return $this->model
            ->where('user_id', $userId)
            ->where('start_time', '>=', $startOfDay)
            ->where('start_time', '<=', $endOfDay)
            ->get();
    }

    /**
     * Check for schedule conflicts
     */
    public function hasConflict(int $userId, Carbon $startTime, Carbon $endTime, ?int $excludeId = null): bool
    {
        $query = $this->model
            ->where('user_id', $userId)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where(function ($q2) use ($startTime, $endTime) {
                    $q2->where('start_time', '<', $endTime)
                        ->where('end_time', '>', $startTime);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Get all schedules for a user
     */
    public function getAllForUser(int $userId): Collection
    {
        return $this->model->where('user_id', $userId)->get();
    }

    /**
     * Update a schedule
     */
    public function update(Schedule $schedule, array $data): bool
    {
        return $schedule->update($data);
    }

    /**
     * Delete a schedule
     */
    public function delete(Schedule $schedule): bool
    {
        return $schedule->delete();
    }

    /**
     * Restore a soft-deleted schedule
     */
    public function restore(Schedule $schedule): bool
    {
        return $schedule->restore();
    }

    /**
     * Get filtered schedules for a user
     */
    public function getFilteredSchedules(int $userId, array $filters): Collection
    {
        $query = $this->model->where('user_id', $userId);
        
        // Apply year filter (only if not empty)
        if (isset($filters['year']) && $filters['year'] !== '') {
            $query->whereYear('start_time', $filters['year']);
        }
        
        // Apply month filter (only if not empty)
        if (isset($filters['month']) && $filters['month'] !== '') {
            $query->whereMonth('start_time', $filters['month']);
        }
        
        // Apply day filter (only if not empty)
        if (isset($filters['day']) && $filters['day'] !== '') {
            $query->whereDay('start_time', $filters['day']);
        }
        
        // Apply batch_id filter (only if not empty)
        if (isset($filters['batch_id']) && $filters['batch_id'] !== '') {
            $query->where('batch_id', 'like', '%' . $filters['batch_id'] . '%');
        }
        
        return $query->orderBy('start_time', 'asc')->get();
    }
} 