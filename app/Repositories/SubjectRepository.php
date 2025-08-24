<?php

namespace App\Repositories;

use App\Contracts\Repositories\SubjectRepositoryInterface;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SubjectRepository implements SubjectRepositoryInterface
{
    /**
     * Get paginated subjects for a tutor with filters
     */
    public function getPaginatedForTutor(int $tutorId, array $filters = [], array $with = []): LengthAwarePaginator
    {
        $query = Subject::forTutor($tutorId);
        
        if (!empty($with)) {
            $query->with($with);
        }

        // Apply search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Apply active filter
        if (isset($filters['active'])) {
            $query->filterActive($filters['active']);
        }

        // Apply showcase filter
        if (isset($filters['showcase'])) {
            $query->filterShowcase($filters['showcase']);
        }

        // Apply trashed filter
        if (!empty($filters['trashed'])) {
            $query->filterTrashed($filters['trashed']);
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        
        // Validate sort_by to prevent SQL injection
        $allowedSortFields = ['name', 'description', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('name', 'asc'); // Default fallback
        }

        return $query->paginate()->appends(request()->all());
    }

    /**
     * Get all subjects for a tutor
     */
    public function getAllForTutor(int $tutorId, array $filters = [], array $with = []): Collection
    {
        $query = Subject::forTutor($tutorId);
        
        if (!empty($with)) {
            $query->with($with);
        }

        // Apply filters
        if (!empty($filters)) {
            $query->applyFilters($filters);
        }

        // Apply ordering
        if (method_exists(Subject::class, 'ordered')) {
            $query->ordered();
        }

        return $query->get();
    }

    /**
     * Find subject by ID with relationships
     */
    public function findById(int $id, array $with = []): ?Subject
    {
        $query = Subject::query();
        
        if (!empty($with)) {
            $query->with($with);
        }

        return $query->find($id);
    }

    /**
     * Create a new subject
     */
    public function create(array $data): Subject
    {
        return Subject::create($data);
    }

    /**
     * Update an existing subject
     */
    public function update(Subject $subject, array $data): bool
    {
        return $subject->update($data);
    }

    /**
     * Delete a subject
     */
    public function delete(Subject $subject): bool
    {
        return $subject->delete();
    }

    /**
     * Restore a soft-deleted subject
     */
    public function restore(Subject $subject): bool
    {
        return $subject->restore();
    }

    /**
     * Check if subject has dependencies
     */
    public function hasDependencies(Subject $subject): bool
    {
        return $subject->topics()->count() > 0;
    }

    /**
     * Get subjects for API consumption
     */
    public function getActiveForApi(): Collection
    {
        return Subject::active()
            ->withCount('topics')
            ->ordered()
            ->get();
    }
} 