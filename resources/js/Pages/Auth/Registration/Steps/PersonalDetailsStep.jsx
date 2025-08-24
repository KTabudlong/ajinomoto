import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

import { Button } from '@/Components/Button/Button';
import { TextInput as Input } from '@/Components/Form/TextInput';
import { Label } from '@/Components/Form/Label';
import { SelectInput as Select } from '@/Components/Form/SelectInput';
import { getTimezoneOptions, DEFAULT_TIMEZONE } from '@/utils/timezones';

const PersonalDetailsStep = ({
  formData,
  updateFormData,
  nextStep,
  isLoading,
  setIsLoading,
  setError,
  setSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Get timezone options for the select dropdown
  const timezoneOptions = getTimezoneOptions();

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(route('storefront.register.start'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute('content'),
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          timezone: formData.timezone,
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
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = password => {
    if (!password) return { strength: 0, color: 'bg-gray-200', text: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return { strength: score, color: 'bg-red-500', text: 'Weak' };
    if (score <= 3)
      return { strength: score, color: 'bg-yellow-500', text: 'Fair' };
    if (score <= 4)
      return { strength: score, color: 'bg-blue-500', text: 'Good' };
    return { strength: score, color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            type="text"
            value={formData.first_name}
            onChange={e => updateFormData({ first_name: e.target.value })}
            placeholder="Enter your first name"
            className={validationErrors.first_name ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {validationErrors.first_name && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.first_name}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            type="text"
            value={formData.last_name}
            onChange={e => updateFormData({ last_name: e.target.value })}
            placeholder="Enter your last name"
            className={validationErrors.last_name ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {validationErrors.last_name && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.last_name}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={e => updateFormData({ email: e.target.value })}
          placeholder="Enter your email address"
          className={validationErrors.email ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={e => updateFormData({ password: e.target.value })}
            placeholder="Create a strong password"
            className={
              validationErrors.password ? 'border-red-500 pr-10' : 'pr-10'
            }
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    level <= passwordStrength.strength
                      ? passwordStrength.color
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {passwordStrength.text}
            </span>
          </div>

          {/* Password Requirements */}
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium mb-1">
              Password Requirements:
            </p>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={`text-xs ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}
                >
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={`text-xs ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}
                >
                  Lowercase letter (a-z)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={`text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}
                >
                  Uppercase letter (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={`text-xs ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}
                >
                  Number (0-9)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <span
                  className={`text-xs ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}
                >
                  Special character (!@#$%^&*)
                </span>
              </div>
            </div>
          </div>
        </div>

        {validationErrors.password && (
          <p className="text-red-500 text-sm mt-1">
            {validationErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <Label htmlFor="password_confirmation">Confirm Password *</Label>
        <div className="relative">
          <Input
            id="password_confirmation"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.password_confirmation}
            onChange={e =>
              updateFormData({ password_confirmation: e.target.value })
            }
            placeholder="Confirm your password"
            className={
              validationErrors.password_confirmation
                ? 'border-red-500 pr-10'
                : 'pr-10'
            }
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Password Match Indicator */}
        {formData.password_confirmation && (
          <div className="mt-2 flex items-center gap-2">
            {formData.password === formData.password_confirmation ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-green-500 text-sm">Passwords match</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-red-500 text-sm">
                  Passwords do not match
                </span>
              </>
            )}
          </div>
        )}

        {validationErrors.password_confirmation && (
          <p className="text-red-500 text-sm mt-1">
            {validationErrors.password_confirmation}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          id="timezone"
          value={formData.timezone}
          onChange={e => updateFormData({ timezone: e.target.value })}
          disabled={isLoading}
        >
          {timezoneOptions.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          We'll use this to show times in your local timezone
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Continue to Email Verification'}
        </Button>
      </div>

      {/* Terms and Privacy */}
      <div className="text-center text-sm text-gray-600">
        By continuing, you agree to our{' '}
        <a
          href={route('storefront.terms')}
          className="text-blue-600 hover:underline"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href={route('storefront.privacy')}
          className="text-blue-600 hover:underline"
        >
          Privacy Policy
        </a>
      </div>
    </form>
  );
};

export default PersonalDetailsStep;
