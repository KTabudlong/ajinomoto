<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role_id === 1;
    }

    public function view(User $user, Role $role): bool
    {
        return $user->role_id === 1;
    }

    public function create(User $user): bool
    {
        return $user->role_id === 1;
    }

    public function update(User $user, Role $role): bool
    {
        return $user->role_id === 1;
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->role_id === 1;
    }

    public function restore(User $user, Role $role): bool
    {
        return $user->role_id === 1;
    }

    public function forceDelete(User $user, Role $role): bool
    {
        return false;
    }
} 