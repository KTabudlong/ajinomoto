<?php

namespace App\Repositories;

use App\Contracts\Repositories\ActivityRepositoryInterface;
use App\Models\Activity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ActivityRepository implements ActivityRepositoryInterface
{
    public function __construct(
        private Activity $model
    ) {}

    public function create(array $data): Activity
    {
        return $this->model->create($data);
    }

    public function findById(int $id): ?Activity
    {
        return $this->model->find($id);
    }

    public function findByIdWithRelations(int $id, array $relations = []): ?Activity
    {
        $query = $this->model->newQuery();
        
        if (!empty($relations)) {
            $query->with($relations);
        }
        
        return $query->find($id);
    }

    public function update(int $id, array $data): Activity
    {
        $activity = $this->findById($id);
        
        if (!$activity) {
            throw new \InvalidArgumentException("Activity with ID {$id} not found");
        }
        
        $activity->update($data);
        return $activity->fresh();
    }

    public function delete(int $id): bool
    {
        $activity = $this->findById($id);
        
        if (!$activity) {
            return false;
        }
        
        return $activity->delete();
    }

    public function softDelete(int $id): bool
    {
        $activity = $this->findById($id);
        
        if (!$activity) {
            return false;
        }
        
        return $activity->delete();
    }

    public function restore(int $id): bool
    {
        $activity = $this->model->withTrashed()->find($id);
        
        if (!$activity) {
            return false;
        }
        
        return $activity->restore();
    }

    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
                          $query = $this->model->newQuery()
                      ->with(['user', 'activityType', 'site', 'topic', 'status'])
                      ->orderBy('start_date', 'desc');

        // Apply filters
        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function getByDateRange(Carbon $startDate, Carbon $endDate): Collection
    {
                          return $this->model->newQuery()
                      ->with(['user', 'activityType', 'site', 'topic', 'status'])
                      ->whereBetween('start_date', [$startDate, $endDate])
                      ->orderBy('start_date')
                      ->get();
    }

    public function getByUserId(int $userId): Collection
    {
        return $this->model->newQuery()
            ->with(['activityType', 'site', 'topic', 'status'])
            ->where('user_id', $userId)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function getByActivityType(int $activityTypeId): Collection
    {
        return $this->model->newQuery()
            ->with(['user', 'site', 'topic', 'status'])
            ->where('activity_type_id', $activityTypeId)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function getBySite(int $siteId): Collection
    {
        return $this->model->newQuery()
            ->with(['user', 'activityType', 'topic', 'status'])
            ->where('site_id', $siteId)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function getByTopic(int $topicId): Collection
    {
        return $this->model->newQuery()
            ->with(['user', 'activityType', 'site', 'status'])
            ->where('topic_id', $topicId)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function getActive(): Collection
    {
        return $this->model->newQuery()
            ->with(['user', 'activityType', 'site', 'topic', 'status'])
            ->whereHas('status', function ($q) {
                $q->where('slug', 'active');
            })
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function search(string $query): Collection
    {
        return $this->model->newQuery()
            ->with(['user', 'activityType', 'site', 'topic', 'status'])
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Apply filters to the query
     */
    private function applyFilters($query, array $filters): void
    {
        // Search filter
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Status filter
        if (isset($filters['status']) && !empty($filters['status'])) {
            $query->whereHas('status', function ($q) use ($filters) {
                $q->where('slug', $filters['status']);
            });
        }

        // User filter
        if (isset($filters['user_id']) && !empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Activity type filter
        if (isset($filters['activity_type_id']) && !empty($filters['activity_type_id'])) {
            $query->where('activity_type_id', $filters['activity_type_id']);
        }

        // Site filter
        if (isset($filters['site_id']) && !empty($filters['site_id'])) {
            $query->where('site_id', $filters['site_id']);
        }

        // Topic filter
        if (isset($filters['topic_id']) && !empty($filters['topic_id'])) {
            $query->where('topic_id', $filters['topic_id']);
        }

        // Date range filter
        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $query->where('start_date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $query->where('start_date', '<=', $filters['end_date']);
        }

        // Trashed filter
        if (isset($filters['trashed'])) {
            if ($filters['trashed'] === 'with') {
                $query->withTrashed();
            } elseif ($filters['trashed'] === 'only') {
                $query->onlyTrashed();
            }
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'start_date';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        
        if (in_array($sortBy, ['title', 'start_date', 'end_date', 'status', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }
    }
}
