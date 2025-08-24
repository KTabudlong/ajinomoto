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
            // Users must be created before time slots (foreign key constraint)
            UserSeeder::class,  
            // Schedule settings seeders (now users exist)
            TimeSlotSeeder::class,
            DayColorSeeder::class,
            TimeFormatSeeder::class,
            SlotDurationSeeder::class,
            // New activity system seeders
            ActivityTypeSeeder::class,
            SiteSeeder::class,
            TopicSeeder::class,

            // Schedule seeder for development
            ScheduleSeeder::class,
        ]);
    }
}
