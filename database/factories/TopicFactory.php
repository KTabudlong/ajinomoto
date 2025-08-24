<?php

namespace Database\Factories;

use App\Models\Topic;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

class TopicFactory extends Factory
{
    protected $model = Topic::class;

    public function definition(): array
    {
        $subject = Subject::inRandomOrder()->first() ?? Subject::factory()->create();
        return [
            'subject_id' => $subject->id,
            'name' => $this->faker->words(2, true),
            'price_per_session' => $this->faker->randomFloat(2, 10, 100),
            'duration' => $this->faker->numberBetween(1, 2),
            'description' => $this->faker->sentence(),
        ];
    }
} 