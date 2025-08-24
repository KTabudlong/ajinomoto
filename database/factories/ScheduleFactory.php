<?php

namespace Database\Factories;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleFactory extends Factory
{
    protected $model = Schedule::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'start_time' => $this->faker->time('H:i:s'),
            'end_time' => $this->faker->time('H:i:s'),
        ];
    }
} 