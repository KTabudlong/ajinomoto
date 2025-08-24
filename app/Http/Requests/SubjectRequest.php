<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will be enhanced with policies later
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $baseRules = [
            'name' => [
                'string',
                'max:255',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'is_active' => [
                'boolean',
            ],
            'is_showcase' => [
                'boolean',
            ],
            'sort_order' => [
                'nullable',
                'integer',
                'min:0',
                'max:999',
            ],
        ];

        // Add conditional name validation
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            // When updating, name is optional but must be unique if provided
            $subject = $this->route('subject');
            $subjectId = null;
            
            // Handle both model instance and string ID
            if ($subject instanceof \App\Models\Subject) {
                $subjectId = $subject->id;
            } elseif (is_numeric($subject)) {
                $subjectId = (int) $subject;
            }
            
            $baseRules['name'][] = 'sometimes';
            $baseRules['name'][] = Rule::unique('subjects')->whereNull('deleted_at')->ignore($subjectId);
        } else {
            // When creating, name is required and must be unique
            $baseRules['name'][] = 'required';
            $baseRules['name'][] = Rule::unique('subjects')->whereNull('deleted_at');
        }

        return $baseRules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Subject name is required.',
            'name.unique' => 'You already have a subject with this name.',
            'name.max' => 'Subject name cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'sort_order.integer' => 'Sort order must be a number.',
            'sort_order.min' => 'Sort order must be at least 0.',
            'sort_order.max' => 'Sort order cannot exceed 999.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'subject name',
            'description' => 'description',
            'is_active' => 'active status',
            'is_showcase' => 'showcase status',
            'sort_order' => 'sort order',
        ];
    }
}
