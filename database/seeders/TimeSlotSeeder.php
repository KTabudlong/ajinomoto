<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TimeSlot;

class TimeSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default system time slots (7:00 AM to 7:00 PM, 1-hour intervals) for super admin
        $defaultTimeSlots = [
            ['start_time' => '07:00', 'end_time' => '08:00'],
            ['start_time' => '08:00', 'end_time' => '09:00'],
            ['start_time' => '09:00', 'end_time' => '10:00'],
            ['start_time' => '10:00', 'end_time' => '11:00'],
            ['start_time' => '11:00', 'end_time' => '12:00'],
            ['start_time' => '12:00', 'end_time' => '13:00'],
            ['start_time' => '13:00', 'end_time' => '14:00'],
            ['start_time' => '14:00', 'end_time' => '15:00'],
            ['start_time' => '15:00', 'end_time' => '16:00'],
            ['start_time' => '16:00', 'end_time' => '17:00'],
            ['start_time' => '17:00', 'end_time' => '18:00'],
            ['start_time' => '18:00', 'end_time' => '19:00'],
        ];

        foreach ($defaultTimeSlots as $slot) {
            TimeSlot::create([
                'user_id' => 1, // Super admin (user ID 1)
                'start_time' => $slot['start_time'],
                'end_time' => $slot['end_time'],
                'is_active' => true,
            ]);
        }
    }
} 