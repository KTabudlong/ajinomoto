<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleRequest extends FormRequest
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
        // Check if this is a batch request (has 'dates' array)
        if ($this->has('dates') && is_array($this->input('dates'))) {
            // Batch format validation
            return [
                'scheduleType' => ['required', 'string', 'in:single,weekly,monthly'],
                'dates' => ['required', 'array', 'min:1'],
                'dates.*.date' => ['required', 'date'],
                'dates.*.start_time' => ['required'],
                'dates.*.end_time' => ['required'],
            ];
        } else {
            // Legacy single format validation
            $baseRules = [
                'date' => ['required', 'date'],
                'start_time' => ['required'],
                'end_time' => ['required'],
            ];

            if ($this->isMethod('put')) {
                $baseRules = [
                    'date' => ['sometimes', 'date'],
                    'start_time' => ['sometimes'],
                    'end_time' => ['sometimes'],
                ];
            }

            return $baseRules;
        }
    }
}
