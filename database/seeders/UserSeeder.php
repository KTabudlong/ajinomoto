<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\TimeSlot;
use App\Models\DayColor;
use App\Models\TimeFormat;
use App\Models\SlotDuration;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure test@last.com becomes user ID 1 (Admin)
        $superAdmin = User::updateOrCreate(
            ['email' => 'test@last.com'],
            [
                'first_name' => 'Super',
                'last_name'  => 'Admin',
                'contact'    => '1234567890',
                'password'   => Hash::make('test123'),
            ]
        );

        // Create additional users (starting from id 2)
        $additionalUsers = [];
        $additionalUsers[] = User::updateOrCreate(
            ['email' => 'user@one.com'],
            [
                'first_name' => 'User',
                'last_name'  => 'One',
                'contact'    => '1234567891',
                'password'   => Hash::make('test123'),
            ]
        );
        $additionalUsers[] = User::updateOrCreate(
            ['email' => 'user@two.com'],
            [
                'first_name' => 'User',
                'last_name'  => 'Two',
                'contact'    => '1234567892',
                'password'   => Hash::make('test123'),
            ]
        );

        // Create schedule settings for additional users (inherit system defaults)
        foreach ($additionalUsers as $user) {
            if ($user->id < 2) continue; // skip if user_id is 1 (admin)
            
            // Create time slots for user (inherit system defaults)
            $systemTimeSlots = TimeSlot::whereNull('user_id')->get();
            foreach ($systemTimeSlots as $systemSlot) {
                TimeSlot::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'start_time' => $systemSlot->start_time,
                        'end_time' => $systemSlot->end_time,
                    ],
                    [
                        'is_active' => true,
                    ]
                );
            }

            // Create day colors for user (inherit system defaults)
            $systemDayColors = DayColor::whereNull('user_id')->get();
            foreach ($systemDayColors as $systemColor) {
                DayColor::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'day_of_week' => $systemColor->day_of_week,
                    ],
                    [
                        'hex_color' => $systemColor->hex_color,
                        'is_active' => true,
                    ]
                );
            }

            // Create time format for user (inherit system default)
            $systemTimeFormat = TimeFormat::whereNull('user_id')->first();
            if ($systemTimeFormat) {
                TimeFormat::updateOrCreate(
                    [
                        'user_id' => $user->id,
                    ],
                    [
                        'format' => $systemTimeFormat->format,
                        'is_active' => true,
                    ]
                );
            }

            // Create slot duration for user (inherit system default)
            $systemSlotDuration = SlotDuration::whereNull('user_id')->first();
            if ($systemSlotDuration) {
                SlotDuration::updateOrCreate(
                    [
                        'user_id' => $user->id,
                    ],
                    [
                        'duration_minutes' => $systemSlotDuration->duration_minutes,
                        'is_active' => true,
                    ]
                );
            }
        }


    }
}

