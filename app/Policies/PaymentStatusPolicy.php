<?php

namespace App\Policies;

use App\Models\PaymentStatus;
use App\Models\User;

class PaymentStatusPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role_id === 1;
    }
    public function view(User $user, PaymentStatus $paymentStatus): bool
    {
        return $user->role_id === 1;
    }
    public function create(User $user): bool
    {
        return $user->role_id === 1;
    }
    public function update(User $user, PaymentStatus $paymentStatus): bool
    {
        return $user->role_id === 1;
    }
    public function delete(User $user, PaymentStatus $paymentStatus): bool
    {
        return $user->role_id === 1;
    }
    public function restore(User $user, PaymentStatus $paymentStatus): bool
    {
        return $user->role_id === 1;
    }
    public function forceDelete(User $user, PaymentStatus $paymentStatus): bool
    {
        return false;
    }
} 