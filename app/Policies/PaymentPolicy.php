<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Payment;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role_id === 1;
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->role_id === 1;
    }

    public function create(User $user): bool
    {
        return $user->role_id === 1;
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->role_id === 1;
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->role_id === 1;
    }

    public function restore(User $user, Payment $payment): bool
    {
        return $user->role_id === 1;
    }

    public function forceDelete(User $user, Payment $payment): bool
    {
        return false;
    }
} 