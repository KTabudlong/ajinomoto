<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class OrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->role_id === 1;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'name' => trim($this->input('name', '')),
            'description' => $this->input('description', null),
        ]);
    }
} 