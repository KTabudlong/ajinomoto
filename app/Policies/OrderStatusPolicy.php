<?php

namespace App\Policies;

use App\Models\OrderStatus;
use App\Models\User;

class OrderStatusPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role_id === 1;
    }
    public function view(User $user, OrderStatus $orderStatus): bool
    {
        return $user->role_id === 1;
    }
    public function create(User $user): bool
    {
        return $user->role_id === 1;
    }
    public function update(User $user, OrderStatus $orderStatus): bool
    {
        return $user->role_id === 1;
    }
    public function delete(User $user, OrderStatus $orderStatus): bool
    {
        return $user->role_id === 1;
    }
    public function restore(User $user, OrderStatus $orderStatus): bool
    {
        return $user->role_id === 1;
    }
    public function forceDelete(User $user, OrderStatus $orderStatus): bool
    {
        return false;
    }
} 