<?php

namespace App\Services;

use App\Contracts\Repositories\ActivityRepositoryInterface;
use App\Models\Activity;
use App\Models\ActivityType;
use App\Models\Site;
use App\Models\Topic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;

class ActivityService
{
    public function __construct(
        private ActivityRepositoryInterface $activityRepository
    ) {}

    /**
     * Create a new activity with validation and business logic
     */
    public function createActivity(array $data): Activity
    {
        // Validate input data
        $this->validateActivityData($data);

        // Apply business rules
        $this->applyBusinessRules($data);

        // Create activity
        return DB::transaction(function () use ($data) {
            return $this->activityRepository->create($data);
        });
    }

    /**
     * Update an existing activity
     */
    public function updateActivity(int $id, array $data): Activity
    {
        // Validate input data
        $this->validateActivityData($data, $id);

        // Apply business rules
        $this->applyBusinessRules($data);

        // Update activity
        return DB::transaction(function () use ($id, $data) {
            return $this->activityRepository->update($id, $data);
        });
    }

    /**
     * Delete an activity
     */
    public function deleteActivity(int $id): bool
    {
        $activity = $this->activityRepository->findById($id);
        
        if (!$activity) {
            throw new InvalidArgumentException("Activity with ID {$id} not found");
        }

        // Check if user can delete this activity
        if ($activity->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            throw new InvalidArgumentException("You don't have permission to delete this activity");
        }

        return $this->activityRepository->delete($id);
    }

    /**
     * Restore a soft-deleted activity
     */
    public function restoreActivity(int $id): bool
    {
        $activity = $this->activityRepository->findByIdWithRelations($id);
        
        if (!$activity) {
            throw new InvalidArgumentException("Activity with ID {$id} not found");
        }

        // Check if user can restore this activity
        if ($activity->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            throw new InvalidArgumentException("You don't have permission to restore this activity");
        }

        return $this->activityRepository->restore($id);
    }

    /**
     * Get paginated activities with filters
     */
    public function getPaginatedActivities(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        // Apply user-based filtering if not admin
        if (!Auth::user()->isAdmin()) {
            $filters['user_id'] = Auth::id();
        }

        return $this->activityRepository->getPaginated($filters, $perPage);
    }

    /**
     * Get activities by date range
     */
    public function getActivitiesByDateRange(Carbon $startDate, Carbon $endDate): Collection
    {
        return $this->activityRepository->getByDateRange($startDate, $endDate);
    }

    /**
     * Get activities for calendar view
     */
    public function getActivitiesForCalendar(Carbon $startDate, Carbon $endDate): Collection
    {
        return $this->activityRepository->getByDateRange($startDate, $endDate);
    }

    /**
     * Search activities
     */
    public function searchActivities(string $query): Collection
    {
        if (strlen($query) < 2) {
            throw new InvalidArgumentException("Search query must be at least 2 characters long");
        }

        return $this->activityRepository->search($query);
    }

    /**
     * Get activity statistics
     */
    public function getActivityStatistics(): array
    {
        $userId = Auth::id();
        
        return [
            'total' => $this->activityRepository->getByUserId($userId)->count(),
                              'active' => $this->activityRepository->getByUserId($userId)->whereHas('status', function ($q) {
                      $q->where('slug', 'active');
                  })->count(),
                  'completed' => $this->activityRepository->getByUserId($userId)->whereHas('status', function ($q) {
                      $q->where('slug', 'completed');
                  })->count(),
                  'cancelled' => $this->activityRepository->getByUserId($userId)->whereHas('status', function ($q) {
                      $q->where('slug', 'cancelled');
                  })->count(),
        ];
    }

    /**
     * Validate activity data
     */
    private function validateActivityData(array $data, ?int $activityId = null): void
    {
        $rules = [
            'title' => 'required|string|max:255',
            'activity_type_id' => 'required|exists:activity_types,id',
            'site_id' => 'required|exists:sites,id',
            'topic_id' => 'required|exists:topics,id',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'frequency_config' => 'nullable|array',
                              'activity_status_id' => 'nullable|exists:activity_statuses,id',
        ];

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new InvalidArgumentException($validator->errors()->first());
        }

        // Additional business validation
        $this->validateBusinessRules($data);
    }

    /**
     * Validate business-specific rules
     */
    private function validateBusinessRules(array $data): void
    {
        // Check if activity type exists and is active
        $activityType = ActivityType::find($data['activity_type_id']);
        if (!$activityType || !$activityType->is_active) {
            throw new InvalidArgumentException("Selected activity type is not available");
        }

        // Check if site exists and is active
        $site = Site::find($data['site_id']);
        if (!$site || !$site->is_active) {
            throw new InvalidArgumentException("Selected site is not available");
        }

        // Check if topic exists and is active
        $topic = Topic::find($data['topic_id']);
        if (!$topic || !$topic->is_active) {
            throw new InvalidArgumentException("Selected topic is not available");
        }

        // Validate frequency configuration based on activity type
        $this->validateFrequencyConfig($data['activity_type_id'], $data['frequency_config'] ?? []);
    }

    /**
     * Validate frequency configuration
     */
    private function validateFrequencyConfig(int $activityTypeId, array $frequencyConfig): void
    {
        $activityType = ActivityType::find($activityTypeId);
        
        if (!$activityType) {
            return;
        }

        $config = $activityType->config ?? [];

        // Validate based on activity type
        switch ($activityType->slug) {
            case 'every_x_months':
            case 'every_x_years':
            case 'every_x_days':
                if (!isset($frequencyConfig['interval']) || $frequencyConfig['interval'] < 1) {
                    throw new InvalidArgumentException("Interval must be at least 1");
                }
                break;

            case 'specific_dates':
                if (!isset($frequencyConfig['specificDates']) || empty($frequencyConfig['specificDates'])) {
                    throw new InvalidArgumentException("Specific dates must be provided");
                }
                break;
        }
    }

    /**
     * Apply business rules to data
     */
    private function applyBusinessRules(array &$data): void
    {
        // Set user ID if not provided
        if (!isset($data['user_id'])) {
            $data['user_id'] = Auth::id();
        }

                          // Set default status if not provided
                  if (!isset($data['activity_status_id'])) {
                      // Get the default 'active' status ID
                      $activeStatus = \App\Models\ActivityStatus::where('slug', 'active')->first();
                      if ($activeStatus) {
                          $data['activity_status_id'] = $activeStatus->id;
                      }
                  }

        // Set end date for single events if not provided
        if (!isset($data['end_date']) && isset($data['activity_type_id'])) {
            $activityType = ActivityType::find($data['activity_type_id']);
            if ($activityType && $activityType->slug === 'single') {
                $data['end_date'] = $data['start_date'];
            }
        }

        // Ensure dates are Carbon instances
        if (isset($data['start_date']) && !($data['start_date'] instanceof Carbon)) {
            $data['start_date'] = Carbon::parse($data['start_date']);
        }

        if (isset($data['end_date']) && !($data['end_date'] instanceof Carbon)) {
            $data['end_date'] = Carbon::parse($data['end_date']);
        }
    }

    /**
     * Check if user can access activity
     */
    public function canUserAccessActivity(int $activityId): bool
    {
        $activity = $this->activityRepository->findById($activityId);
        
        if (!$activity) {
            return false;
        }

        return $activity->user_id === Auth::id() || Auth::user()->isAdmin();
    }
}
