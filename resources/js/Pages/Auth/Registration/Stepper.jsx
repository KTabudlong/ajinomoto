import React, { useState, useCallback } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Button } from '@/Components/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/Components/Card';
import { Stepper } from '@/Components/Stepper';
import { Alert, AlertDescription } from '@/Components/Alert';
import { DEFAULT_TIMEZONE } from '@/utils/timezones';

// Step Components
import {
  PersonalDetailsStep,
  EmailVerificationStep,
  ContactInfoStep,
  PaymentPlaceholderStep,
  CompletionStep,
} from './Steps';

const STEPS = [
  { id: 1, title: 'Personal Details', component: PersonalDetailsStep },
  { id: 2, title: 'Email Verification', component: EmailVerificationStep },
  { id: 3, title: 'Contact Info', component: ContactInfoStep },
  { id: 4, title: 'Payment Method', component: PaymentPlaceholderStep },
  { id: 5, title: 'Complete', component: CompletionStep },
];

const RegistrationStepper = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    timezone: DEFAULT_TIMEZONE,

    // Step 2: Email Verification
    verification_code: '',

    // Step 3: Contact Info
    contact: '',

    // Step 4: Payment (placeholder)
    payment_skipped: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form data
  const updateFormData = useCallback(newData => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      setError('');
      setSuccess('');
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError('');
      setSuccess('');
    }
  }, [currentStep]);

  const goToStep = useCallback(step => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
      setError('');
      setSuccess('');
    }
  }, []);

  // Get current step component
  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <StorefrontLayout>
      <Head title="Register - TutorMatch Chicago" />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600 text-center">
              Join TutorMatch Chicago and connect with expert tutors
            </p>
          </div>

          {/* Progress Steps */}
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={goToStep}
            variant="default"
          />

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">
                Step {currentStep}: {STEPS[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
                currentStep={currentStep}
                nextStep={nextStep}
                prevStep={prevStep}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setError={setError}
                setSuccess={setSuccess}
              />
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {STEPS.length}
            </div>

            {currentStep < STEPS.length && (
              <Button
                onClick={nextStep}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default RegistrationStepper;
