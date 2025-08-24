<?php

namespace App\Contracts\Repositories;

use App\Models\Activity;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ActivityRepositoryInterface
{
    /**
     * Create a new activity
     */
    public function create(array $data): Activity;

    /**
     * Find activity by ID
     */
    public function findById(int $id): ?Activity;

    /**
     * Find activity by ID with relationships
     */
    public function findByIdWithRelations(int $id, array $relations = []): ?Activity;

    /**
     * Update activity by ID
     */
    public function update(int $id, array $data): Activity;

    /**
     * Delete activity by ID
     */
    public function delete(int $id): bool;

    /**
     * Soft delete activity by ID
     */
    public function softDelete(int $id): bool;

    /**
     * Restore soft deleted activity
     */
    public function restore(int $id): bool;

    /**
     * Get paginated activities with filters
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get activities by date range
     */
    public function getByDateRange(Carbon $startDate, Carbon $endDate): Collection;

    /**
     * Get activities by user ID
     */
    public function getByUserId(int $userId): Collection;

    /**
     * Get activities by activity type
     */
    public function getByActivityType(int $activityTypeId): Collection;

    /**
     * Get activities by site
     */
    public function getBySite(int $siteId): Collection;

    /**
     * Get activities by topic
     */
    public function getByTopic(int $topicId): Collection;

    /**
     * Get active activities only
     */
    public function getActive(): Collection;

    /**
     * Search activities by title or description
     */
    public function search(string $query): Collection;
}
