<?php

namespace App\Contracts\Repositories;

use App\Models\AdminSettings;
use Illuminate\Database\Eloquent\Collection;

interface AdminSettingsRepositoryInterface
{
    /**
     * Get all admin settings ordered by key
     */
    public function getAllOrderedByKey(): Collection;

    /**
     * Get paginated admin settings with search and sort
     */
    public function getPaginatedWithSearchAndSort(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator;

    /**
     * Find admin setting by ID
     */
    public function findById(int $id): ?AdminSettings;

    /**
     * Find admin setting by key
     */
    public function findByKey(string $key): ?AdminSettings;

    /**
     * Create a new admin setting
     */
    public function create(array $data): AdminSettings;

    /**
     * Update an existing admin setting
     */
    public function update(AdminSettings $adminSettings, array $data): bool;

    /**
     * Delete an admin setting
     */
    public function delete(AdminSettings $adminSettings): bool;

    /**
     * Get setting value by key with fallback
     */
    public function getValue(string $key, $default = null);

    /**
     * Set setting value by key
     */
    public function setValue(string $key, $value, string $description = null): void;

    /**
     * Set multiple settings at once (for seeding)
     */
    public function setMultiple(array $settings): void;

    /**
     * Get all settings as associative array
     */
    public function getAllAsArray(): array;
}
