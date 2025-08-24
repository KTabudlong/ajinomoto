<?php

namespace App\Contracts\Repositories;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface SubjectRepositoryInterface
{
    /**
     * Get paginated subjects for a tutor with filters
     */
    public function getPaginatedForTutor(int $tutorId, array $filters = [], array $with = []): LengthAwarePaginator;

    /**
     * Get all subjects for a tutor
     */
    public function getAllForTutor(int $tutorId, array $filters = [], array $with = []): Collection;

    /**
     * Find subject by ID with relationships
     */
    public function findById(int $id, array $with = []): ?Subject;

    /**
     * Create a new subject
     */
    public function create(array $data): Subject;

    /**
     * Update an existing subject
     */
    public function update(Subject $subject, array $data): bool;

    /**
     * Delete a subject
     */
    public function delete(Subject $subject): bool;

    /**
     * Restore a soft-deleted subject
     */
    public function restore(Subject $subject): bool;

    /**
     * Check if subject has dependencies
     */
    public function hasDependencies(Subject $subject): bool;

    /**
     * Get subjects for API consumption
     */
    public function getActiveForApi(): Collection;
} 