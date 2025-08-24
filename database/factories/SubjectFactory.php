<?php

namespace Database\Factories;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class SubjectFactory extends Factory
{
    protected $model = Subject::class;

    public function definition(): array
    {
        $tutor = User::where('role_id', 2)->where('id', '>=', 2)->inRandomOrder()->first();
        if (!$tutor) {
            $tutor = User::factory()->create(['role_id' => 2]);
        }
        return [
            'name' => $this->faker->unique()->words(2, true),
            'description' => $this->faker->sentence(),
            'is_active' => true,
            'is_showcase' => false,
            'sort_order' => 0,
            'tutor_id' => $tutor->id,
        ];
    }
} 