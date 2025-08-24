<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthenticationService;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(
        private UserService $userService,
        private AuthenticationService $authService
    ) {}

    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'authType' => 'storefront',
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Set auth type for storefront registration
        $request->session()->put('auth_type', 'storefront');

        // Create user using service
        $user = $this->userService->createUser($request->all(), 'storefront');

        // Login and redirect using service
        return $this->authService->loginUser($user, 'storefront');
    }
}
