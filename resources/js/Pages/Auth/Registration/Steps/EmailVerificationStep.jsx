import React, { useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';

import { Button } from '@/Components/Button';
import { TextInput as Input, Label } from '@/Components/Form';

const EmailVerificationStep = ({
    formData,
    updateFormData,
    nextStep,
    isLoading,
    setIsLoading,
    setError,
    setSuccess
}) => {
    const [isResending, setIsResending] = useState(false);

    // Handle verification code submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.verification_code.trim()) {
            setError('Please enter the verification code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(route('register.verify'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    email: formData.email,
                    code: formData.verification_code,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);
                // Move to next step after a brief delay
                setTimeout(() => {
                    nextStep();
                }, 1500);
            } else {
                setError(result.message || 'Verification failed. Please try again.');
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle resend verification code
    const handleResend = async () => {
        setIsResending(true);
        setError('');

        try {
            const response = await fetch(route('register.resend-verification'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    email: formData.email,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);
            } else {
                setError(result.message || 'Failed to resend verification code.');
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Email Verification Info */}
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Check Your Email
                </h3>
                <p className="text-gray-600">
                    We've sent a verification code to <strong>{formData.email}</strong>
                </p>
            </div>

            {/* Verification Code Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="verification_code">Verification Code *</Label>
                    <Input
                        id="verification_code"
                        type="text"
                        value={formData.verification_code}
                        onChange={(e) => updateFormData({ verification_code: e.target.value })}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg font-mono tracking-widest"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">
                        Enter the 6-digit code from your email
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !formData.verification_code.trim()}
                >
                    {isLoading ? 'Verifying...' : 'Verify Email & Continue'}
                </Button>
            </form>

            {/* Resend Code Section */}
            <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                    Didn't receive the code?
                </p>
                <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={isResending}
                    className="flex items-center gap-2 mx-auto"
                >
                    {isResending ? (
                        <>
                            <RefreshCw size={16} className="animate-spin" />
                            Resending...
                        </>
                    ) : (
                        <>
                            <RefreshCw size={16} />
                            Resend Code
                        </>
                    )}
                </Button>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check your spam/junk folder</li>
                    <li>• Make sure you entered the correct email address</li>
                    <li>• The code expires in 5 minutes</li>
                    <li>• You can request a new code if needed</li>
                </ul>
            </div>
                 </div>
     );
};

export default EmailVerificationStep;
