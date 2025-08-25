<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\HasCrudOperations;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use HasCrudOperations;

    // Configuration properties
    protected string $modelClass = User::class;
    protected string $resourceClass = UserResource::class;
    protected string $collectionClass = UserCollection::class;
    protected string $resourceName = 'users';
    protected array $dependencies = [];
    protected array $defaultRelationships = [];

    // Abstract method implementations
    protected function getModel(): string
    {
        return $this->modelClass;
    }

    protected function getIndexView(): string
    {
        return 'Users/Index';
    }

    protected function getCreateView(): string
    {
        return 'Users/Create';
    }

    protected function getEditView(): string
    {
        return 'Users/Edit';
    }

    protected function getShowView(): string
    {
        return 'Users/Show';
    }

    protected function getIndexRoute(): string
    {
        return 'users';
    }

    protected function getResourceName(): string
    {
        return $this->resourceName;
    }

    // Override methods for custom behavior
    protected function getIndexData()
    {
        $filters = request()->only('search', 'trashed', 'sort_by', 'sort_order');
        
        // All authenticated users can see all users
        $query = User::query();

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }



        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'first_name';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        switch ($sortBy) {
            case 'first_name':
                $query->orderBy('first_name', $sortOrder)
                      ->orderBy('last_name', $sortOrder);
                break;
            case 'email':
                $query->orderBy('email', $sortOrder);
                break;
            case 'created_at':
                $query->orderBy('created_at', $sortOrder);
                break;
            default:
                $query->orderBy('first_name', 'asc')
                      ->orderBy('last_name', 'asc');
        }

        return $query->paginate(10)->appends(request()->all());
    }

    // Override sorting methods for users
    protected function getDefaultSortBy(): string
    {
        return 'first_name';
    }

    protected function getDefaultSortOrder(): string
    {
        return 'asc';
    }

    protected function getAllowedSortFields(): array
    {
        return ['first_name', 'last_name', 'email', 'created_at', 'updated_at'];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $data = $this->getIndexData();

        return Inertia::render($this->getIndexView(), [
            'users' => new UserCollection($data),
            'filters' => request()->only('search', 'trashed', 'sort_by', 'sort_order'),
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
    public function store(UserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = User::create($data);

        // WIP
        if ($request->hasFile('photo')) {
            $user->update([
                'photo' => $request->file('photo')->store('users'),
            ]);
        }

        return Redirect::route('users')->with('success', 'User created.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        return Inertia::render($this->getEditView(), [
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(User $user, UserRequest $request): RedirectResponse
    {
        $user->update($request->validated());

        // WIP
        if ($request->hasFile('avatar')) {
            $user->update([
                'avatar' => $request->file('avatar')->store('users'),
            ]);
        }

        return Redirect::back()->with('success', 'User updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return Redirect::back()->with('success', 'User deleted.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(User $user): RedirectResponse
    {
        $user->restore();

        return Redirect::back()->with('success', 'User restored.');
    }
}
