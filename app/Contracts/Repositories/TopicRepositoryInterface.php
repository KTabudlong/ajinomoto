<?php

namespace App\Contracts\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface TopicRepositoryInterface
{
    /**
     * Get paginated topics with filters
     */
    public function getPaginated(array $filters = []): LengthAwarePaginator;

    /**
     * Get all topics for a specific subject
     */
    public function getBySubject(int $subjectId): Collection;

    /**
     * Find topic by ID with trashed records
     */
    public function findWithTrashed(int $id);

    /**
     * Create a new topic
     */
    public function create(array $data);

    /**
     * Update an existing topic
     */
    public function update(int $id, array $data): bool;

    /**
     * Delete a topic (soft delete if SoftDeletes trait is used)
     */
    public function delete(int $id): bool;

    /**
     * Restore a soft-deleted topic
     */
    public function restore(int $id): bool;

    /**
     * Force delete a topic
     */
    public function forceDelete(int $id): bool;
} 