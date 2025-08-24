<?php
namespace Database\Factories;

use App\Models\DeliveryType;
use App\Models\OrderStatus;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Ensure subject_id is always assigned to a subject with a valid tutor_id
        $subject = Subject::whereNotNull('tutor_id')->inRandomOrder()->first() ?? Subject::factory()->create();
        return [
            'schedule_id'      => Schedule::factory(),
            'customer_id'      => User::factory(),
            'subject_id'       => $subject->id,
            'topic_id'         => null,
            'delivery_type_id' => DeliveryType::factory(),
            'order_status_id'  => OrderStatus::inRandomOrder()->first() ?? OrderStatus::factory(),
            'teacher_comment'  => fake()->text(),
            'customer_comment' => fake()->text(),
            'rating'           => rand(1, 5),
            'refund_amount'    => 0,
            'refunded_at'      => null,
        ];
    }
}
