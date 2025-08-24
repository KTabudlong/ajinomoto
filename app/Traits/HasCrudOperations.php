<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

trait HasCrudOperations
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render($this->getIndexView(), [
            'filters' => request()->all('search', 'sort_by', 'sort_order', 'active', 'showcase', 'trashed'),
            $this->getResourceName() => $this->getIndexData(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render($this->getCreateView());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->prepareStoreData($request->validated());
        $this->getModel()::create($data);

        return Redirect::route($this->getIndexRoute())
            ->with('success', $this->getSuccessMessage('created'));
    }

    /**
     * Display the specified resource.
     */
    public function show($model): Response
    {
        // Handle case where string ID is passed instead of model (fallback for legacy support)
        if (is_string($model)) {
            $model = $this->modelClass::withTrashed()->findOrFail($model);
        }
        
        $this->loadRelationships($model);
        
        return Inertia::render($this->getShowView(), [
            $this->getResourceName() => $this->createResource($model),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($model): Response
    {
        // Handle case where string ID is passed instead of model (fallback for legacy support)
        if (is_string($model)) {
            $model = $this->modelClass::withTrashed()->findOrFail($model);
        }
        
        return Inertia::render($this->getEditView(), [
            $this->getResourceName() => $this->createResource($model),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $model): RedirectResponse
    {
        // Handle case where string ID is passed instead of model (fallback for legacy support)
        if (is_string($model)) {
            $model = $this->modelClass::withTrashed()->findOrFail($model);
        }

        $model->update($request->validated());

        return Redirect::back()
            ->with('success', $this->getSuccessMessage('updated'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($model): RedirectResponse
    {
        // Handle case where string ID is passed instead of model (fallback for legacy support)
        if (is_string($model)) {
            $model = $this->modelClass::withTrashed()->findOrFail($model);
        }

        if ($this->hasDependencies($model)) {
            return Redirect::back()
                ->with('error', $this->getDependencyErrorMessage());
        }

        $model->delete();

        return Redirect::back()
            ->with('success', $this->getSuccessMessage('deleted'));
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore($model): RedirectResponse
    {
        // Handle case where string ID is passed instead of model (fallback for legacy support)
        if (is_string($model)) {
            $model = $this->modelClass::withTrashed()->findOrFail($model);
        }

        $model->restore();

        return Redirect::back()
            ->with('success', $this->getSuccessMessage('restored'));
    }

    // Abstract methods that must be implemented by the controller
    abstract protected function getModel(): string;
    abstract protected function getIndexView(): string;
    abstract protected function getCreateView(): string;
    abstract protected function getEditView(): string;
    abstract protected function getShowView(): string;
    abstract protected function getIndexRoute(): string;
    abstract protected function getResourceName(): string;

    // Optional methods with default implementations
    protected function getIndexData()
    {
        return $this->getPaginatedData(
            request()->only('search', 'sort_by', 'sort_order', 'active', 'showcase', 'trashed')
        );
    }

    protected function getPaginatedData(array $filters = [], array $with = [])
    {
        $query = $this->modelClass::query();
        
        if (!empty($with)) {
            $query->with($with);
        }

        // Filter by authenticated user for schedules
        if ($this->modelClass === \App\Models\Schedule::class && Auth::check()) {
            $query->where('user_id', Auth::id());
        }

        // Apply filters using the model's filter scope
        if (!empty($filters)) {
            $query->filter($filters);
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? $this->getDefaultSortBy();
        $sortOrder = $filters['sort_order'] ?? $this->getDefaultSortOrder();
        
        // Validate sort_by to prevent SQL injection
        $allowedSortFields = $this->getAllowedSortFields();
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy($this->getDefaultSortBy(), $this->getDefaultSortOrder());
        }

        return $query->paginate()->appends(request()->all());
    }

    protected function createResource($model)
    {
        $resourceClass = $this->getResourceClass();
        return new $resourceClass($model);
    }

    protected function getResourceClass(): string
    {
        return $this->resourceClass ?? $this->getDefaultResourceClass();
    }

    protected function getDefaultResourceClass(): string
    {
        $modelName = class_basename($this->getModel());
        return "App\\Http\\Resources\\{$modelName}Resource";
    }

    protected function getCollectionClass(): string
    {
        return $this->collectionClass ?? $this->getDefaultCollectionClass();
    }

    protected function getDefaultCollectionClass(): string
    {
        $modelName = class_basename($this->getModel());
        return "App\\Http\\Resources\\{$modelName}Collection";
    }

    protected function prepareStoreData(array $data): array
    {
        // Add tutor_id if the model supports it and user is authenticated
        if (Auth::check() && method_exists($this->modelClass, 'getFillable') && 
            in_array('tutor_id', (new $this->modelClass)->getFillable())) {
            $data['tutor_id'] = Auth::id();
        }

        return $data;
    }

    protected function loadRelationships($model, array $relations = []): void
    {
        if (empty($relations)) {
            $relations = $this->getDefaultRelationships();
        }

        if (!empty($relations)) {
            $model->load($relations);
        }
    }

    protected function getDefaultRelationships(): array
    {
        return $this->defaultRelationships ?? [];
    }

    protected function hasDependencies($model): bool
    {
        $dependencies = $this->getDependencies();
        
        foreach ($dependencies as $relation) {
            if ($model->$relation()->count() > 0) {
                return true;
            }
        }

        return false;
    }

    protected function getDependencies(): array
    {
        return $this->dependencies ?? [];
    }

    protected function getSuccessMessage(string $action): string
    {
        $modelName = ucfirst($this->getResourceName());
        return "{$modelName} {$action} successfully.";
    }

    protected function getDependencyErrorMessage(): string
    {
        return "Cannot delete this {$this->getResourceName()} because it has dependencies.";
    }

    // Sorting helper methods
    protected function getDefaultSortBy(): string
    {
        return 'name';
    }

    protected function getDefaultSortOrder(): string
    {
        return 'asc';
    }

    protected function getAllowedSortFields(): array
    {
        return ['name', 'description', 'created_at', 'updated_at'];
    }
} 