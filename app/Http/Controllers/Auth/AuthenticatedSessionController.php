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

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        private AuthenticationService $authService
    ) {}

    /**
     * Display the login view.
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
            'authType' => 'storefront',
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();
        
        // Set auth type for storefront login
        $request->session()->put('auth_type', 'storefront');
        
        // Get redirect path using service
        $redirectPath = $this->authService->getRedirectPath($user, 'storefront');
        
        return redirect()->intended($redirectPath);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Get user info before logout
        $user = $request->user();
        $isAdminRoute = $request->is('admin*');
        
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect based on where the logout was triggered
        if ($isAdminRoute) {
            return redirect('/admin/login');
        }
        
        // For regular users
        return redirect('/login');
    }
}
