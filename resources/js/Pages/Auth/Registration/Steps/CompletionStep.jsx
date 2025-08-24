import React from 'react';
import { CheckCircle, ArrowRight, User, BookOpen, Star } from 'lucide-react';
import { router } from '@inertiajs/react';

import { Button } from '@/Components/Button';

export default function CompletionStep({
    formData,
    isLoading
}) {
    const handleGoToProfile = () => {
        router.visit(route('storefront.profile.edit'));
    };

    const handleGoToHome = () => {
        router.visit(route('home'));
    };

    return (
        <div className="space-y-6 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900">
                Welcome to TutorMatch Chicago! 🎉
            </h3>
            
            <p className="text-gray-600 text-lg">
                Your account has been created successfully. You're now ready to start 
                your learning journey with expert tutors.
            </p>

            {/* Account Summary */}
            <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h4 className="font-medium text-gray-900 mb-4">Account Summary</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <User size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                            <strong>Name:</strong> {formData.first_name} {formData.last_name}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <BookOpen size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                            <strong>Email:</strong> {formData.email}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Star size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                            <strong>Status:</strong> Email verified ✓
                        </span>
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-3">What's Next?</h4>
                <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            1
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-900">Complete Your Profile</p>
                            <p className="text-xs text-blue-700">Add your phone number and preferences</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            2
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-900">Browse Subjects & Tutors</p>
                            <p className="text-xs text-blue-700">Find the perfect match for your learning goals</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            3
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-900">Book Your First Session</p>
                            <p className="text-xs text-blue-700">Start learning with expert tutors</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                    onClick={handleGoToProfile}
                    className="flex-1 flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    <User size={16} />
                    Complete Profile
                </Button>
                
                <Button
                    variant="outline"
                    onClick={handleGoToHome}
                    className="flex-1 flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    <ArrowRight size={16} />
                    Explore Tutors
                </Button>
            </div>

            {/* Welcome Message */}
            <div className="border-t pt-6">
                <p className="text-sm text-gray-500">
                    Welcome to the TutorMatch community! We're excited to help you 
                    achieve your learning goals. If you have any questions, our 
                    support team is here to help.
                </p>
            </div>
        </div>
    );
}
