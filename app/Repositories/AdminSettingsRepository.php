<?php

namespace App\Repositories;

use App\Contracts\Repositories\AdminSettingsRepositoryInterface;
use App\Models\AdminSettings;
use Illuminate\Database\Eloquent\Collection;

class AdminSettingsRepository implements AdminSettingsRepositoryInterface
{
    public function __construct(
        private AdminSettings $model
    ) {}

    /**
     * Get all admin settings ordered by key
     */
    public function getAllOrderedByKey(): Collection
    {
        return $this->model->orderBy('key')->get();
    }

    /**
     * Get paginated admin settings with search and sort
     */
    public function getPaginatedWithSearchAndSort(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = $this->model->query();

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('value', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'key';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        
        // Only allow sorting by key for security
        if ($sortBy === 'key') {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('key', 'asc'); // Default fallback
        }

        return $query->paginate(15);
    }

    /**
     * Find admin setting by ID
     */
    public function findById(int $id): ?AdminSettings
    {
        return $this->model->find($id);
    }

    /**
     * Find admin setting by key
     */
    public function findByKey(string $key): ?AdminSettings
    {
        return $this->model->where('key', $key)->first();
    }

    /**
     * Create a new admin setting
     */
    public function create(array $data): AdminSettings
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing admin setting
     */
    public function update(AdminSettings $adminSettings, array $data): bool
    {
        return $adminSettings->update($data);
    }

    /**
     * Delete an admin setting
     */
    public function delete(AdminSettings $adminSettings): bool
    {
        return $adminSettings->delete();
    }

    /**
     * Get setting value by key with fallback
     */
    public function getValue(string $key, $default = null)
    {
        $setting = $this->findByKey($key);
        
        if (!$setting) {
            return $default;
        }

        // Try to decode JSON, fallback to string
        $decoded = json_decode($setting->value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $setting->value;
    }

    /**
     * Set setting value by key
     */
    public function setValue(string $key, $value, string $description = null): void
    {
        $setting = $this->findByKey($key);
        
        if ($setting) {
            $setting->update([
                'value' => is_array($value) ? json_encode($value) : (string) $value,
                'description' => $description ?? $setting->description,
            ]);
        } else {
            $this->create([
                'key' => $key,
                'value' => is_array($value) ? json_encode($value) : (string) $value,
                'description' => $description,
            ]);
        }
    }

    /**
     * Set multiple settings at once (for seeding)
     */
    public function setMultiple(array $settings): void
    {
        foreach ($settings as $setting) {
            $this->setValue(
                $setting['key'],
                $setting['value'],
                $setting['description'] ?? null
            );
        }
    }

    /**
     * Get all settings as associative array
     */
    public function getAllAsArray(): array
    {
        $settings = $this->getAllOrderedByKey();
        $result = [];
        
        foreach ($settings as $setting) {
            $decoded = json_decode($setting->value, true);
            $result[$setting->key] = json_last_error() === JSON_ERROR_NONE ? $decoded : $setting->value;
        }
        
        return $result;
    }
}
