<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role_id === 1; // Super admin only
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $settingId = $this->route('admin_setting')?->id;
        
        return [
            'key' => 'required|string|max:255|unique:admin_settings,key' . ($settingId ? ",{$settingId}" : ''),
            'value' => 'required|string|max:1000',
            'description' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'key.required' => 'The setting key is required.',
            'key.unique' => 'This setting key already exists.',
            'value.required' => 'The setting value is required.',
            'description.max' => 'The description may not be greater than 500 characters.',
        ];
    }
}
