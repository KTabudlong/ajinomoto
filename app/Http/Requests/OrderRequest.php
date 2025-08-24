<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
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
        return [
            'schedule_id' => 'required|exists:schedules,id',
            'subject_id' => 'required|exists:subjects,id',
            'topic_id' => 'nullable|exists:topics,id',
            'delivery_type_id' => 'required|exists:delivery_types,id',
            'order_status_id' => 'required|exists:order_statuses,id',
            'teacher_comment' => 'nullable|string',
            'customer_comment' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'schedule_id.required' => 'Please select a schedule.',
            'schedule_id.exists' => 'The selected schedule is invalid.',
            'subject_id.required' => 'Please select a subject.',
            'subject_id.exists' => 'The selected subject is invalid.',
            'topic_id.exists' => 'The selected topic is invalid.',
            'delivery_type_id.required' => 'Please select a delivery type.',
            'delivery_type_id.exists' => 'The selected delivery type is invalid.',
            'order_status_id.required' => 'Please select an order status.',
            'order_status_id.exists' => 'The selected order status is invalid.',
        ];
    }
} 