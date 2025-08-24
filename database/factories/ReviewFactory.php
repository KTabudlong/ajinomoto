<?php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $teacherId = User::where('role_id', \App\Models\Role::TUTOR)->first()->id;
        $customers = User::where('role_id', \App\Models\Role::CUSTOMER)->get();

        return [
            'teacher_id'  => $teacherId,
            'customer_id' => $customers->random()->id,
            'body'        => fake()->text(),
        ];
    }
}
