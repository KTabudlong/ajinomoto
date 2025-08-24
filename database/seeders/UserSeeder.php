<?php
namespace Database\Seeders;

use App\Models\Role;
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
        // Ensure test@last.com becomes user ID 1 (Super Admin)
        $superAdmin = User::updateOrCreate(
            ['email' => 'test@last.com'],
            [
                'role_id'    => Role::SUPER_ADMIN,
                'first_name' => 'Super',
                'last_name'  => 'Admin',
                'contact'    => '1234567890',
                'password'   => Hash::make('test123'),
            ]
        );

        // Create tutors (starting from id 2)
        $tutors = [];
        $tutors[] = User::updateOrCreate(
            ['email' => 'tutor@one.com'],
            [
                'role_id'    => Role::TUTOR,
                'first_name' => 'Tutor',
                'last_name'  => 'One',
                'contact'    => '1234567891',
                'password'   => Hash::make('test123'),
            ]
        );
        $tutors[] = User::updateOrCreate(
            ['email' => 'tutor@two.com'],
            [
                'role_id'    => Role::TUTOR,
                'first_name' => 'Tutor',
                'last_name'  => 'Two',
                'contact'    => '1234567892',
                'password'   => Hash::make('test123'),
            ]
        );

        // Create schedule settings for tutors (inherit system defaults)
        foreach ($tutors as $tutor) {
            if ($tutor->id < 2) continue; // skip if tutor_id is 1 (super admin)
            
            // Create time slots for tutor (inherit system defaults)
            $systemTimeSlots = TimeSlot::whereNull('user_id')->get();
            foreach ($systemTimeSlots as $systemSlot) {
                TimeSlot::updateOrCreate(
                    [
                        'user_id' => $tutor->id,
                        'start_time' => $systemSlot->start_time,
                        'end_time' => $systemSlot->end_time,
                    ],
                    [
                        'is_active' => true,
                    ]
                );
            }

            // Create day colors for tutor (inherit system defaults)
            $systemDayColors = DayColor::whereNull('user_id')->get();
            foreach ($systemDayColors as $systemColor) {
                DayColor::updateOrCreate(
                    [
                        'user_id' => $tutor->id,
                        'day_of_week' => $systemColor->day_of_week,
                    ],
                    [
                        'hex_color' => $systemColor->hex_color,
                        'is_active' => true,
                    ]
                );
            }

            // Create time format for tutor (inherit system default)
            $systemTimeFormat = TimeFormat::whereNull('user_id')->first();
            if ($systemTimeFormat) {
                TimeFormat::updateOrCreate(
                    [
                        'user_id' => $tutor->id,
                    ],
                    [
                        'format' => $systemTimeFormat->format,
                        'is_active' => true,
                    ]
                );
            }

            // Create slot duration for tutor (inherit system default)
            $systemSlotDuration = SlotDuration::whereNull('user_id')->first();
            if ($systemSlotDuration) {
                SlotDuration::updateOrCreate(
                    [
                        'user_id' => $tutor->id,
                    ],
                    [
                        'duration_minutes' => $systemSlotDuration->duration_minutes,
                        'is_active' => true,
                    ]
                );
            }
        }

        // Create additional customers for each tutor (tutor_id >= 2)
        foreach ($tutors as $tutor) {
            if ($tutor->id < 2) continue; // skip if tutor_id is 1 (super admin)
            for ($i = 0; $i < 2; $i++) {
                User::factory()->create([
                    'role_id'    => Role::CUSTOMER,
                    'tutor_id'   => $tutor->id,
                    'created_at' => Carbon::now()->subDays(rand(1, 30))->subHours(rand(1, 23)),
                    'updated_at' => Carbon::now()->subDays(rand(1, 30))->subHours(rand(1, 23)),
                ]);
            }
        }
    }
}

