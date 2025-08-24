<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $rules = [
            'first_name' => ['max:50'],
            'last_name'  => ['max:50'],
            'email'      => ['max:50', 'email'],
            'password'   => ['nullable'],
            'avatar'     => ['nullable', 'image'],
        ];

        if ($this->isMethod('post')) {
            $rules = array_merge($rules, [
                'first_name' => ['required'],
                'last_name'  => ['required'],
                'email'      => ['required', Rule::unique('users')],
                // Password is optional for tutor-created students; required for self-registration (future invite flow)
                'password'   => ['nullable', 'string', 'min:6'],
                'avatar'     => ['nullable', 'image'],

            ]);
        }

        if ($this->isMethod('put')) {
            $rules = array_merge($rules, [
                'first_name' => ['sometimes'],
                'last_name'  => ['sometimes'],
                'email'      => [
                    'sometimes',
                    Rule::unique('users')->ignore($this->route('user')->id)
                ],
                'password'   => ['nullable'],
            ]);
        }

        return $rules;
    }
}
