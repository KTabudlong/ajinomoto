<?php

namespace App\Policies;

use App\Models\User;
use App\Models\AdminSettings;

class AdminSettingsPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role_id === 1; // Super admin only
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AdminSettings $adminSettings): bool
    {
        return $user->role_id === 1; // Super admin only
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role_id === 1; // Super admin only
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AdminSettings $adminSettings): bool
    {
        return $user->role_id === 1; // Super admin only
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AdminSettings $adminSettings): bool
    {
        return $user->role_id === 1; // Super admin only
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AdminSettings $adminSettings): bool
    {
        return $user->role_id === 1; // Super admin only
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AdminSettings $adminSettings): bool
    {
        return $user->role_id === 1; // Super admin only
    }
}
