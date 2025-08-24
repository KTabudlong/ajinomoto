<?php
namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Admin settings seeder (must come first for system defaults)
            AdminSettingSeeder::class,
            UserSeeder::class,  
            TimeSlotSeeder::class,
            DayColorSeeder::class,
            TimeFormatSeeder::class,
            SlotDurationSeeder::class,
            // New activity system seeders
            ActivityTypeSeeder::class,
            ActivityStatusSeeder::class,
            SiteSeeder::class,
            TopicSeeder::class,

            // Schedule seeder for development
            ScheduleSeeder::class,
        ]);
    }
}
