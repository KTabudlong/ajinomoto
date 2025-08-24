<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DayColor;

class DayColorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default system day colors (hex values)
        $defaultDayColors = [
            ['day_of_week' => 0, 'hex_color' => '#6366F1'], // Sunday - Indigo
            ['day_of_week' => 1, 'hex_color' => '#3B82F6'], // Monday - Blue
            ['day_of_week' => 2, 'hex_color' => '#F59E0B'], // Tuesday - Yellow
            ['day_of_week' => 3, 'hex_color' => '#10B981'], // Wednesday - Green
            ['day_of_week' => 4, 'hex_color' => '#F97316'], // Thursday - Orange
            ['day_of_week' => 5, 'hex_color' => '#EC4899'], // Friday - Pink
            ['day_of_week' => 6, 'hex_color' => '#8B5CF6'], // Saturday - Purple
        ];

        // Note: System defaults are now managed through admin_settings table
        // This seeder no longer creates system defaults with user_id = null
        // Individual users will get their day colors from admin_settings defaults
    }
} 