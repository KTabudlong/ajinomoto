<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminOrTutorRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            abort(403, 'Access denied.');
        }
        if (Auth::user()->role_id === Role::SUPER_ADMIN) {
            return $next($request);
        }
        if (Auth::user()->role_id === Role::TUTOR) {
            return $next($request);
        }
        abort(403, 'Access denied.');
    }
} 