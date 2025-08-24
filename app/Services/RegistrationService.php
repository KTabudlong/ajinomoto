<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    public function __construct(
        private UserRepository $userRepository,
        private EmailVerificationService $emailVerificationService
    ) {}

    /**
     * Start registration process - create user and send verification
     */
    public function startRegistration(array $userData): array
    {
        try {
            DB::beginTransaction();

            // Create user with CUSTOMER role
            $user = $this->userRepository->create([
                'role_id' => Role::CUSTOMER,
                'first_name' => $userData['first_name'],
                'last_name' => $userData['last_name'],
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
                'timezone' => $userData['timezone'] ?? 'America/Chicago',
            ]);

            // Generate and send verification code
            $verification = $this->emailVerificationService->generateAndSendCode(
                $userData['email'], 
                $user
            );

            DB::commit();

            return [
                'success' => true,
                'user' => $user,
                'verification' => $verification,
                'message' => 'Registration started successfully. Please check your email for verification code.'
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            return [
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify email and complete registration
     */
    public function verifyEmail(string $email, string $code): array
    {
        $isValid = $this->emailVerificationService->verifyCode($email, $code);

        if (!$isValid) {
            return [
                'success' => false,
                'message' => 'Invalid or expired verification code.'
            ];
        }

        // Find user by email
        $user = $this->userRepository->findByEmail($email);
        
        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found.'
            ];
        }

        return [
            'success' => true,
            'user' => $user,
            'message' => 'Email verified successfully!'
        ];
    }

    /**
     * Complete profile setup
     */
    public function completeProfile(int $userId, array $profileData): array
    {
        try {
            $user = $this->userRepository->findById($userId);
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found.'
                ];
            }

            // Update profile data
            $this->userRepository->update($user, [
                'contact' => $profileData['contact'] ?? null,
                'timezone' => $profileData['timezone'] ?? 'America/Chicago',
            ]);

            return [
                'success' => true,
                'user' => $user->fresh(),
                'message' => 'Profile completed successfully!'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Profile completion failed. Please try again.',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Resend verification code
     */
    public function resendVerification(string $email): array
    {
        try {
            $user = $this->userRepository->findByEmail($email);
            
            $verification = $this->emailVerificationService->resendCode($email, $user);

            return [
                'success' => true,
                'message' => 'Verification code resent successfully. Please check your email.'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to resend verification code. Please try again.',
                'error' => $e->getMessage()
            ];
        }
    }
}
