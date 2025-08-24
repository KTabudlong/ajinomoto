<?php

namespace App\Services;

use App\Models\EmailVerification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\EmailVerificationMail;

class EmailVerificationService
{
    /**
     * Generate and send verification code for email
     */
    public function generateAndSendCode(string $email, ?User $user = null): EmailVerification
    {
        // Create verification record
        $verification = EmailVerification::createVerification($email, $user?->id);
        
        // Send email
        Mail::to($email)->send(new EmailVerificationMail($verification));
        
        return $verification;
    }

    /**
     * Verify email code
     */
    public function verifyCode(string $email, string $code): bool
    {
        $verification = EmailVerification::valid()
            ->forEmail($email)
            ->where('code', $code)
            ->first();

        if (!$verification) {
            return false;
        }

        // Mark as used
        $verification->markAsUsed();

        // Update user if exists
        if ($verification->user_id) {
            $verification->user->update(['email_verified_at' => now()]);
        }

        return true;
    }

    /**
     * Check if verification code is valid
     */
    public function isCodeValid(string $email, string $code): bool
    {
        return EmailVerification::valid()
            ->forEmail($email)
            ->where('code', $code)
            ->exists();
    }

    /**
     * Clean up expired verifications
     */
    public function cleanupExpired(): int
    {
        return EmailVerification::where('expires_at', '<', now())->delete();
    }

    /**
     * Resend verification code
     */
    public function resendCode(string $email, ?User $user = null): EmailVerification
    {
        // Invalidate existing codes for this email
        EmailVerification::forEmail($email)->update(['is_used' => true]);
        
        // Generate new code
        return $this->generateAndSendCode($email, $user);
    }
}
