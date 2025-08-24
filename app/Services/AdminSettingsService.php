<?php

namespace App\Services;

use App\Contracts\Repositories\AdminSettingsRepositoryInterface;
use App\Models\AdminSettings;
use Illuminate\Database\Eloquent\Collection;

class AdminSettingsService
{
    public function __construct(
        private AdminSettingsRepositoryInterface $repository
    ) {}

    /**
     * Get all admin settings ordered by key
     */
    public function getAllOrderedByKey(): Collection
    {
        return $this->repository->getAllOrderedByKey();
    }

    /**
     * Get paginated admin settings with search and sort
     */
    public function getPaginatedWithSearchAndSort(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        return $this->repository->getPaginatedWithSearchAndSort($filters);
    }

    /**
     * Find admin setting by ID
     */
    public function findById(int $id): ?AdminSettings
    {
        return $this->repository->findById($id);
    }

    /**
     * Find admin setting by key
     */
    public function findByKey(string $key): ?AdminSettings
    {
        return $this->repository->findByKey($key);
    }

    /**
     * Create a new admin setting
     */
    public function create(array $data): AdminSettings
    {
        return $this->repository->create($data);
    }

    /**
     * Update an existing admin setting
     */
    public function update(int $id, array $data): bool
    {
        $setting = $this->findById($id);
        
        if (!$setting) {
            return false;
        }

        return $this->repository->update($setting, $data);
    }

    /**
     * Delete an admin setting
     */
    public function delete(int $id): bool
    {
        $setting = $this->findById($id);
        
        if (!$setting) {
            return false;
        }

        return $this->repository->delete($setting);
    }

    /**
     * Get setting value by key with fallback
     */
    public function getValue(string $key, $default = null)
    {
        return $this->repository->getValue($key, $default);
    }

    /**
     * Set setting value by key
     */
    public function setValue(string $key, $value, string $description = null): void
    {
        $this->repository->setValue($key, $value, $description);
    }

    /**
     * Set multiple settings at once (for seeding)
     */
    public function setMultiple(array $settings): void
    {
        $this->repository->setMultiple($settings);
    }

    /**
     * Get all settings as associative array
     */
    public function getAllAsArray(): array
    {
        return $this->repository->getAllAsArray();
    }

    /**
     * Get success message for admin settings operations
     */
    public function getSuccessMessage(string $action): string
    {
        return match ($action) {
            'create' => 'Admin setting created successfully.',
            'update' => 'Admin setting updated successfully.',
            'delete' => 'Admin setting deleted successfully.',
            default => 'Operation completed successfully.',
        };
    }

    /**
     * Get error message for admin settings operations
     */
    public function getErrorMessage(string $action): string
    {
        return match ($action) {
            'not_found' => 'Admin setting not found.',
            'create_failed' => 'Failed to create admin setting.',
            'update_failed' => 'Failed to update admin setting.',
            'delete_failed' => 'Failed to delete admin setting.',
            default => 'An error occurred.',
        };
    }
}
