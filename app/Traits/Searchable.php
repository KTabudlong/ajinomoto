<?php
namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Scope for searching across multiple columns
     *
     * @param Builder $query
     * @param string|null $search
     * @param array $columns
     * @return Builder
     */
    public function scopeSearch(Builder $query, ?string $search, array $columns = []): Builder
    {
        if (empty($search)) {
            return $query;
        }

        // Use default searchable columns if none provided
        if (empty($columns)) {
            $columns = $this->getSearchableColumns();
        }

        return $query->where(function (Builder $query) use ($search, $columns) {
            foreach ($columns as $column) {
                $query->orWhere($column, 'like', '%' . $search . '%');
            }
        });
    }

    /**
     * Scope for filtering by active status
     *
     * @param Builder $query
     * @param bool|null $active
     * @return Builder
     */
    public function scopeFilterActive(Builder $query, ?bool $active): Builder
    {
        if ($active === null) {
            return $query;
        }

        return $query->where('is_active', $active);
    }

    /**
     * Scope for filtering by showcase status
     *
     * @param Builder $query
     * @param bool|null $showcase
     * @return Builder
     */
    public function scopeFilterShowcase(Builder $query, ?bool $showcase): Builder
    {
        if ($showcase === null) {
            return $query;
        }

        return $query->where('is_showcase', $showcase);
    }

    /**
     * Scope for handling soft deletes filtering
     *
     * @param Builder $query
     * @param string|null $trashed
     * @return Builder
     */
    public function scopeFilterTrashed(Builder $query, ?string $trashed): Builder
    {
        if (empty($trashed)) {
            return $query;
        }

        return match ($trashed) {
            'with' => $query->withTrashed(),
            'only' => $query->onlyTrashed(),
            default => $query,
        };
    }

    /**
     * Scope for applying multiple filters at once
     *
     * @param Builder $query
     * @param array $filters
     * @return Builder
     */
    public function scopeApplyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->search($filters['search'] ?? null)
            ->filterActive($filters['active'] ?? null)
            ->filterShowcase($filters['showcase'] ?? null)
            ->filterTrashed($filters['trashed'] ?? null);
    }

    /**
     * Scope for applying filters (alias for ApplyFilters)
     *
     * @param Builder $query
     * @param array $filters
     * @return Builder
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $this->scopeApplyFilters($query, $filters);
    }

    /**
     * Scope for ordering by sort_order and name
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Get the default searchable columns for this model
     *
     * @return array
     */
    protected function getSearchableColumns(): array
    {
        return $this->searchableColumns ?? ['name', 'description'];
    }

    /**
     * Get searchable columns with their display names
     *
     * @return array
     */
    public function getSearchableColumnsWithLabels(): array
    {
        $columns = $this->getSearchableColumns();
        $labels  = [];

        foreach ($columns as $column) {
            $labels[$column] = ucwords(str_replace('_', ' ', $column));
        }

        return $labels;
    }

    /**
     * Check if the model has searchable columns
     *
     * @return bool
     */
    public function hasSearchableColumns(): bool
    {
        return ! empty($this->getSearchableColumns());
    }

    /**
     * Get search suggestions based on current search term
     *
     * @param string $search
     * @param int $limit
     * @return array
     */
    public function getSearchSuggestions(string $search, int $limit = 5): array
    {
        $columns     = $this->getSearchableColumns();
        $suggestions = [];

        foreach ($columns as $column) {
            $results = static::where($column, 'like', '%' . $search . '%')
                ->distinct()
                ->pluck($column)
                ->take($limit)
                ->toArray();

            $suggestions = array_merge($suggestions, $results);
        }

        return array_unique(array_slice($suggestions, 0, $limit));
    }
}
