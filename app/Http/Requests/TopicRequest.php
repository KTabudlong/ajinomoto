<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TopicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $baseRules = [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price_per_session' => ['required', 'numeric', 'min:0', 'max:999999.9999'],
            'duration' => ['required', 'integer', 'min:1', 'max:2'],
            'subject_id' => ['nullable', 'exists:subjects,id'], // Made optional since it's set by route
        ];

        if ($this->isMethod('PUT')) {
            $topicId = $this->route('topic');
            $topicId = is_object($topicId) ? $topicId->id : $topicId;
            
            $baseRules['name'][] = Rule::unique('topics')->ignore($topicId);
        } else {
            $baseRules['name'][] = Rule::unique('topics');
        }

        return $baseRules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Topic name is required.',
            'name.unique' => 'This topic name already exists.',
            'price_per_session.required' => 'Price per session is required.',
            'price_per_session.numeric' => 'Price must be a valid number.',
            'price_per_session.min' => 'Price cannot be negative.',
            'duration.required' => 'Duration is required.',
            'duration.integer' => 'Duration must be a whole number.',
            'duration.min' => 'Duration must be at least 1 hour.',
            'duration.max' => 'Duration cannot exceed 2 hours.',
            'subject_id.required' => 'Subject is required.',
            'subject_id.exists' => 'Selected subject does not exist.',
        ];
    }
} 