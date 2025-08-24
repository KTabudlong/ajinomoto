<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only allow super admin
        return $this->user() && $this->user()->role_id === 1;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'amount' => (float) $this->input('amount', 0),
        ]);
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
            'payment_status_id' => 'required|exists:payment_statuses,id',
            'payment_gateway_id' => 'required|exists:payment_gateways,id',
        ];
    }
} 