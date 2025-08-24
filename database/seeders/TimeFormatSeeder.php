<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TimeFormat;

class TimeFormatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Note: System defaults are now managed through admin_settings table
        // This seeder no longer creates system defaults with user_id = null
        // Individual users will get their time format from admin_settings defaults
    }
} 