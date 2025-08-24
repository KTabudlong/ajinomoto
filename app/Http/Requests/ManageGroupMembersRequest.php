<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class ManageGroupMembersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow super admin or the tutor who owns the group
        return (
            $this->user()->role_id === 1 ||
            ($this->user()->role_id === 2 && $this->route('group')->tutor_id === $this->user()->id)
        );
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'selected_users' => 'nullable|array',
            'selected_users.*' => 'integer|exists:users,id',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $selectedUsers = $this->input('selected_users', []);
            
            if (empty($selectedUsers)) {
                return; // Allow empty selection
            }

            // Validate that all users belong to the current tutor
            $invalidUsers = User::whereIn('id', $selectedUsers)
                ->where('tutor_id', '!=', $this->user()->id)
                ->pluck('id')
                ->toArray();

            if (!empty($invalidUsers)) {
                $validator->errors()->add('selected_users', 'Some selected users are not valid.');
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'selected_users.array' => 'Selected users must be an array.',
            'selected_users.*.required' => 'User ID is required.',
            'selected_users.*.integer' => 'User ID must be a number.',
        ];
    }
} 