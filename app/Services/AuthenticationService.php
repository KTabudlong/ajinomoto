<?php

namespace App\Services;

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
     * Create a new user
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
        ]);

        event(new Registered($user));

        return $user;
    }

    /**
     * Determine redirect path based on authentication type
     */
    public function getRedirectPath(User $user, string $authType): string
    {
        // All authentication goes to admin dashboard since no storefront is planned
        return route('admin.dashboard', absolute: false);
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
