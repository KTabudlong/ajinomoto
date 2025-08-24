<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthenticatedSessionController extends Controller
{
    public function __construct(
        private AuthenticationService $authService
    ) {}

    /**
     * Display the admin login view.
     */
    public function create(): Response|RedirectResponse
    {
        // If user is already authenticated, redirect them to admin dashboard
        if (Auth::check()) {
            return redirect()->route('admin.dashboard');
        }
        
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'authType' => 'admin',
        ]);
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Set auth type for admin login
        $request->session()->put('auth_type', 'admin');
        
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();
        
        // Get redirect path using service
        $redirectPath = $this->authService->getRedirectPath($user, 'admin');
        
        return redirect()->intended($redirectPath);
    }
}
