<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class AuthenticationService
{
    /**
     * Authenticate a user and set session auth type
     */
    public function authenticateUser(Request $request, string $authType): void
    {
        $request->session()->put('auth_type', $authType);
    }

    /**
     * Create a new user with proper role assignment
     */
    public function createUser(array $userData, string $authType): User
    {
        // Split name into first and last name
        $nameParts = explode(' ', trim($userData['name']), 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $userData['email'],
            'password' => Hash::make($userData['password']),
            'role_id' => $this->getRoleIdForAuthType($authType),
        ]);

        event(new Registered($user));

        return $user;
    }

    /**
     * Get the appropriate role ID based on authentication type
     */
    private function getRoleIdForAuthType(string $authType): int
    {
        return match ($authType) {
            'admin' => Role::TUTOR,
            default => Role::CUSTOMER,
        };
    }

    /**
     * Determine redirect path based on user role and auth type
     */
    public function getRedirectPath(User $user, string $authType): string
    {
        // Admin authentication always goes to admin dashboard
        if ($authType === 'admin') {
            return route('admin.dashboard', absolute: false);
        }

        // Storefront authentication: Allow all users to access storefront
        // Let the frontend handle role-based UI differences
        return route('home', absolute: false);
    }

    /**
     * Login user and return redirect response
     */
    public function loginUser(User $user, string $authType): RedirectResponse
    {
        Auth::login($user);
        
        $redirectPath = $this->getRedirectPath($user, $authType);
        
        return redirect($redirectPath);
    }
}
