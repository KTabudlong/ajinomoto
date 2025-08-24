<?php

namespace App\Traits;

use Illuminate\Http\RedirectResponse;

trait HasToggleableStatus
{
    /**
     * Toggle a boolean field on the model
     *
     * @param mixed $model
     * @param string $field
     * @return RedirectResponse
     */
    public function toggleStatus($model, string $field): RedirectResponse
    {
        $model->update([$field => !$model->$field]);
        $status = $model->$field ? 'activated' : 'deactivated';
        
        return redirect()->back()
            ->with('success', $this->getToggleMessage($field, $status));
    }

    /**
     * Toggle the active status
     *
     * @param mixed $model
     * @return RedirectResponse
     */
    public function toggleActive($model): RedirectResponse
    {
        return $this->toggleStatus($model, 'is_active');
    }

    /**
     * Toggle the showcase status
     *
     * @param mixed $model
     * @return RedirectResponse
     */
    public function toggleShowcase($model): RedirectResponse
    {
        return $this->toggleStatus($model, 'is_showcase');
    }

    /**
     * Toggle the featured status
     *
     * @param mixed $model
     * @return RedirectResponse
     */
    public function toggleFeatured($model): RedirectResponse
    {
        return $this->toggleStatus($model, 'is_featured');
    }

    /**
     * Toggle the published status
     *
     * @param mixed $model
     * @return RedirectResponse
     */
    public function togglePublished($model): RedirectResponse
    {
        return $this->toggleStatus($model, 'is_published');
    }

    /**
     * Get the toggle message
     *
     * @param string $field
     * @param string $status
     * @return string
     */
    protected function getToggleMessage(string $field, string $status): string
    {
        $fieldName = ucwords(str_replace('_', ' ', $field));
        $modelName = ucfirst($this->getResourceName());
        
        return "{$modelName} {$status} successfully.";
    }

    /**
     * Get the resource name for messages
     *
     * @return string
     */
    protected function getResourceName(): string
    {
        return $this->resourceName ?? 'item';
    }
} 