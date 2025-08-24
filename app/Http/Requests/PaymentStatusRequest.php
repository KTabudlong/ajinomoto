<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class PaymentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->role_id === 1;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'display_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'name' => trim($this->input('name', '')),
            'display_name' => trim($this->input('display_name', '')),
            'description' => $this->input('description', null),
        ]);
    }
} 