import React from 'react';
import { Phone, Clock } from 'lucide-react';

import { Button } from '@/Components/Button';
import { TextInput, Label, SelectInput as Select } from '@/Components/Form';
import { getTimezoneOptions } from '@/utils/timezones';

const ContactInfoStep = ({
    formData,
    updateFormData,
    nextStep,
    isLoading,
    setIsLoading,
    setError,
    setSuccess
}) => {
    // Get timezone options for the select dropdown
    const timezoneOptions = getTimezoneOptions();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.contact.trim()) {
            setError('Please enter your phone number');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(route('register.complete-profile'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    contact: formData.contact,
                    timezone: formData.timezone,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(result.message);
                setTimeout(() => {
                    nextStep();
                }, 1500);
            } else {
                setError(result.message || 'Profile completion failed. Please try again.');
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Contact Information
                </h3>
                <p className="text-gray-600">
                    Help us personalize your experience
                </p>
            </div>

            {/* Phone Number */}
            <div>
                <Label htmlFor="contact">Phone Number</Label>
                <TextInput
                    id="contact"
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => updateFormData({ contact: e.target.value })}
                    placeholder="(555) 123-4567"
                    disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                    We'll use this to contact you about your bookings
                </p>
            </div>

            {/* Timezone */}
            <div>
                <Label htmlFor="timezone">Timezone</Label>
                             <Select
                 id="timezone"
                 value={formData.timezone}
                 onChange={(e) => updateFormData({ timezone: e.target.value })}
                 disabled={isLoading}
                 options={timezoneOptions}
             />
                <p className="text-xs text-gray-500 mt-1">
                    This helps us show times in your local timezone
                </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Continue to Payment Setup'}
                </Button>
            </div>
                 </form>
     );
};

export default ContactInfoStep;
