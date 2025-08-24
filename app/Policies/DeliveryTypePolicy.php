<?php

namespace App\Policies;

use App\Models\User;
use App\Models\DeliveryType;

class DeliveryTypePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role_id === 1;
    }

    public function view(User $user, DeliveryType $deliveryType): bool
    {
        return $user->role_id === 1;
    }

    public function create(User $user): bool
    {
        return $user->role_id === 1;
    }

    public function update(User $user, DeliveryType $deliveryType): bool
    {
        return $user->role_id === 1;
    }

    public function delete(User $user, DeliveryType $deliveryType): bool
    {
        return $user->role_id === 1;
    }

    public function restore(User $user, DeliveryType $deliveryType): bool
    {
        return $user->role_id === 1;
    }

    public function forceDelete(User $user, DeliveryType $deliveryType): bool
    {
        return false;
    }
} 