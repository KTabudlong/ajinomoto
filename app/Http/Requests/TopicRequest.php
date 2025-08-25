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
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
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
            'is_active.boolean' => 'Active status must be true or false.',
            'sort_order.integer' => 'Sort order must be a whole number.',
            'sort_order.min' => 'Sort order cannot be negative.',
        ];
    }
} 