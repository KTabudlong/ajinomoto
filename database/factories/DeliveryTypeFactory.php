<?php

namespace Database\Factories;

use App\Models\DeliveryType;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryTypeFactory extends Factory
{
    protected $model = DeliveryType::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->words(2, true),
        ];
    }
} 