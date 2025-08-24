<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Services\AdminSettingsService;

class AdminSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'day_colors',
                'value' => json_encode([
                    0 => '#ef4444', // Sunday - Red
                    1 => '#3b82f6', // Monday - Blue
                    2 => '#10b981', // Tuesday - Green
                    3 => '#f59e0b', // Wednesday - Orange
                    4 => '#8b5cf6', // Thursday - Purple
                    5 => '#06b6d4', // Friday - Cyan
                    6 => '#84cc16', // Saturday - Lime
                ]),
                'description' => 'Default day colors for calendar views (Sunday to Saturday)',
            ],
            [
                'key' => 'time_format',
                'value' => '12h',
                'description' => 'Default time format (12h or 24h)',
            ],
            [
                'key' => 'time_slots_start',
                'value' => '09:00',
                'description' => 'Default start time for available time slots',
            ],
            [
                'key' => 'time_slots_end',
                'value' => '21:00',
                'description' => 'Default end time for available time slots',
            ],
            [
                'key' => 'slot_duration',
                'value' => '60',
                'description' => 'Default slot duration in minutes',
            ],
            [
                'key' => 'time_buffer_hours',
                'value' => '3',
                'description' => 'Minimum hours in advance required for scheduling',
            ],
            [
                'key' => 'max_advance_booking_days',
                'value' => '30',
                'description' => 'Maximum days in advance for booking schedules',
            ],
            [
                'key' => 'default_booking_start_time',
                'value' => '09:00',
                'description' => 'Default start time for new schedule creation',
            ],
            [
                'key' => 'default_booking_end_time',
                'value' => '10:00',
                'description' => 'Default end time for new schedule creation',
            ],
        ];

        // Use the service layer for seeding
        $service = app(AdminSettingsService::class);
        $service->setMultiple($settings);
    }
}
