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

class AdminRegisteredUserController extends Controller
{
    public function __construct(
        private UserService $userService,
        private AuthenticationService $authService
    ) {}

    /**
     * Display the admin registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'authType' => 'admin',
        ]);
    }

    /**
     * Handle an incoming admin registration request.
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

        // Set auth type for admin registration
        $request->session()->put('auth_type', 'admin');

        // Create user using service
        $user = $this->userService->createUser($request->all(), 'admin');

        // Login and redirect using service
        return $this->authService->loginUser($user, 'admin');
    }
}
