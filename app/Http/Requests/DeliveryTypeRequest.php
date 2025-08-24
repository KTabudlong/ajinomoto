<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeliveryTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only allow admins or tutors (adjust as needed)
        return $this->user() && in_array($this->user()->role_id, [1, 2]);
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'name' => trim($this->input('name', '')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
        ];
    }
} 