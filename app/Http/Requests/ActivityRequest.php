<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled in the service layer
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'activity_type_id' => 'required|exists:activity_types,id',
            'site_id' => 'required|exists:sites,id',
            'topic_id' => 'required|exists:topics,id',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'frequency_config' => 'nullable|array',
                                  'activity_status_id' => 'nullable|exists:activity_statuses,id',
        ];

        // Additional validation for frequency config based on activity type
        if ($this->input('activity_type_id')) {
            $rules = array_merge($rules, $this->getFrequencyConfigRules());
        }

        return $rules;
    }



    /**
     * Get frequency config validation rules based on activity type
     */
    private function getFrequencyConfigRules(): array
    {
        $activityTypeId = $this->input('activity_type_id');
        
        // You might want to fetch this from the database in a real application
        $activityTypeSlugs = [
            1 => 'single',
            2 => 'quarterly_start',
            3 => 'quarterly_end',
            4 => 'every_x_months',
            5 => 'every_x_years',
            6 => 'specific_dates',
            7 => 'annually_custom',
            8 => 'monthly',
            9 => 'every_x_days',
        ];

        $slug = $activityTypeSlugs[$activityTypeId] ?? 'single';

        switch ($slug) {
            case 'every_x_months':
            case 'every_x_years':
            case 'every_x_days':
                return [
                    'frequency_config.interval' => 'required|integer|min:1|max:100',
                ];

            case 'specific_dates':
                return [
                    'frequency_config.specificDates' => 'required|string|min:1',
                ];

            case 'annually_custom':
                return [
                    'frequency_config.annualDate' => 'required|date_format:m-d',
                ];

            default:
                return [];
        }
    }

    /**
     * Get custom validation messages for frequency config
     */
    public function messages(): array
    {
        $messages = [
            'title.required' => 'Activity title is required.',
            'title.max' => 'Activity title cannot exceed 255 characters.',
            'activity_type_id.required' => 'Please select an activity type.',
            'activity_type_id.exists' => 'Selected activity type is not valid.',
            'site_id.required' => 'Please select a site.',
            'site_id.exists' => 'Selected site is not valid.',
            'topic_id.required' => 'Please select a topic.',
            'topic_id.exists' => 'Selected topic is not valid.',
            'description.required' => 'Activity description is required.',
            'start_date.required' => 'Start date is required.',
            'start_date.date' => 'Start date must be a valid date.',
            'end_date.date' => 'End date must be a valid date.',
            'end_date.after_or_equal' => 'End date must be on or after the start date.',
                                  'activity_status_id.exists' => 'Selected activity status is not valid.',
        ];

        // Add frequency config messages
        $messages['frequency_config.interval.required'] = 'Interval is required for this activity type.';
        $messages['frequency_config.interval.integer'] = 'Interval must be a whole number.';
        $messages['frequency_config.interval.min'] = 'Interval must be at least 1.';
        $messages['frequency_config.interval.max'] = 'Interval cannot exceed 100.';
        $messages['frequency_config.specificDates.required'] = 'Specific dates are required for this activity type.';
        $messages['frequency_config.annualDate.required'] = 'Annual date is required for this activity type.';
        $messages['frequency_config.annualDate.date_format'] = 'Annual date must be in MM-DD format.';

        return $messages;
    }
}
