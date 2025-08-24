<?php

namespace Database\Factories;

use App\Models\OrderStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderStatusFactory extends Factory
{
    protected $model = OrderStatus::class;

    public function definition(): array
    {
        $statuses = ['pending', 'active', 'completed', 'cancelled'];
        
        return [
            'name' => $this->faker->randomElement($statuses),
        ];
    }
} 