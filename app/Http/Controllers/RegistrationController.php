<?php

namespace App\Http\Controllers;

use App\Services\RegistrationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function __construct(
        private RegistrationService $registrationService
    ) {}

    /**
     * Show registration stepper
     */
    public function show(): Response
    {
        return Inertia::render('Auth/Registration/Stepper');
    }

    /**
     * Start registration process
     */
    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'timezone' => 'nullable|string|max:100',
        ]);

        $result = $this->registrationService->startRegistration($request->all());

        return response()->json($result);
    }

    /**
     * Verify email code
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $result = $this->registrationService->verifyEmail(
            $request->email,
            $request->code
        );

        return response()->json($result);
    }

    /**
     * Complete profile setup
     */
    public function completeProfile(Request $request): JsonResponse
    {
        $request->validate([
            'contact' => 'nullable|string|max:20',
            'timezone' => 'nullable|string|max:100',
        ]);

        $result = $this->registrationService->completeProfile(
            Auth::id(),
            $request->all()
        );

        return response()->json($result);
    }

    /**
     * Resend verification code
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $result = $this->registrationService->resendVerification($request->email);

        return response()->json($result);
    }
}
