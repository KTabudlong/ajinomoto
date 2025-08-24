<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GroupRequest extends FormRequest
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
            'name' => ['max:50', 'alpha_num'],
        ];

        if ($this->isMethod('post')) {
            $rules = array_merge($rules, [
                'name' => ['required'],
            ]);
        }

        if ($this->isMethod('put')) {
            $rules = array_merge($rules, [
                'name' => ['sometimes'],
            ]);
        }

        return $rules;
    }
}
