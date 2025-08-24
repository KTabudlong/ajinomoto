<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only allow super admin
        return $this->user() && $this->user()->role_id === 1;
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