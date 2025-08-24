import React from 'react';
import { CreditCard, SkipForward } from 'lucide-react';

import { Button } from '@/Components/Button';

export default function PaymentPlaceholderStep({
    formData,
    updateFormData,
    nextStep,
    isLoading,
    setIsLoading,
    setError,
    setSuccess
}) {
    const handleSkip = () => {
        updateFormData({ payment_skipped: true });
        nextStep();
    };

    return (
        <div className="space-y-6 text-center">
            {/* Payment Setup Info */}
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900">
                Payment Method Setup
            </h3>
            
            <p className="text-gray-600">
                Set up your payment method to start booking tutoring sessions
            </p>

            {/* Coming Soon Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                    🚧 Coming Soon
                </h4>
                <p className="text-sm text-blue-800">
                    We're working hard to integrate secure payment processing. 
                    For now, you can complete your registration and we'll notify 
                    you when payment setup is available.
                </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Secure Payments</h5>
                    <p className="text-sm text-gray-600">
                        Industry-standard encryption and secure payment processing
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Multiple Options</h5>
                    <p className="text-sm text-gray-600">
                        Credit cards, PayPal, and other payment methods
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Instant Booking</h5>
                    <p className="text-sm text-gray-600">
                        Book sessions immediately once payment is set up
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Easy Management</h5>
                    <p className="text-sm text-gray-600">
                        Update payment methods and view transaction history
                    </p>
                </div>
            </div>

            {/* Skip Button */}
            <div className="pt-4">
                <Button
                    onClick={handleSkip}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    <SkipForward size={16} />
                    Skip for Now & Complete Registration
                </Button>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500">
                You can always add payment methods later from your profile settings
            </p>
        </div>
    );
}
