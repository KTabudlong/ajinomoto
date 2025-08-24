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
        // If user is already authenticated, redirect them appropriately
        if (Auth::check()) {
            $user = Auth::user();
            
            // Admin users should go to admin dashboard
            if (in_array($user->role_id, [\App\Models\Role::SUPER_ADMIN, \App\Models\Role::TUTOR])) {
                return redirect()->route('admin.dashboard');
            }
            
            // Customers should go to storefront
            return redirect()->route('home');
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

        // Redirect based on where the logout was triggered and user role
        if ($isAdminRoute || ($user && in_array($user->role_id, [\App\Models\Role::SUPER_ADMIN, \App\Models\Role::TUTOR]))) {
            return redirect('/admin/login');
        }
        
        // For customers or other roles
        return redirect('/login');
    }
}
