<?php

namespace App\Repositories;

use App\Contracts\Repositories\TopicRepositoryInterface;
use App\Models\Topic;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TopicRepository implements TopicRepositoryInterface
{
    public function __construct(
        private Topic $model
    ) {}

    /**
     * Get paginated topics with filters
     */
    public function getPaginated(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        // Apply search filter
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply trashed filter
        if (isset($filters['trashed'])) {
            if ($filters['trashed'] === 'with') {
                $query->withTrashed();
            } elseif ($filters['trashed'] === 'only') {
                $query->onlyTrashed();
            }
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        // Handle relationship sorting
        if (str_contains($sortBy, '.')) {
            [$relation, $column] = explode('.', $sortBy);
            $query->join("{$relation}s", "topics.{$relation}_id", '=', "{$relation}s.id")
                  ->orderBy("{$relation}s.{$column}", $sortOrder)
                  ->select('topics.*');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }



    /**
     * Find topic by ID with trashed records
     */
    public function findWithTrashed(int $id)
    {
        return $this->model->withTrashed()->find($id);
    }

    /**
     * Create a new topic
     */
    public function create(array $data)
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing topic
     */
    public function update(int $id, array $data): bool
    {
        $topic = $this->findWithTrashed($id);
        if (!$topic) {
            return false;
        }

        return $topic->update($data);
    }

    /**
     * Delete a topic (soft delete if SoftDeletes trait is used)
     */
    public function delete(int $id): bool
    {
        $topic = $this->findWithTrashed($id);
        if (!$topic) {
            return false;
        }

        return $topic->delete();
    }

    /**
     * Restore a soft-deleted topic
     */
    public function restore(int $id): bool
    {
        $topic = $this->model->onlyTrashed()->find($id);
        if (!$topic) {
            return false;
        }

        return $topic->restore();
    }

    /**
     * Force delete a topic
     */
    public function forceDelete(int $id): bool
    {
        $topic = $this->findWithTrashed($id);
        if (!$topic) {
            return false;
        }

        return $topic->forceDelete();
    }
} 