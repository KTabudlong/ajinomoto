<?php

namespace Database\Seeders;

use App\Models\ActivityStatus;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ActivityStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Active',
                'slug' => 'active',
                'description' => 'Activity is currently active and ongoing',
                'color' => '#10B981', // Green
                'sort_order' => 1,
            ],
            [
                'name' => 'Paused',
                'slug' => 'paused',
                'description' => 'Activity is temporarily paused',
                'color' => '#F59E0B', // Yellow
                'sort_order' => 2,
            ],
            [
                'name' => 'Completed',
                'slug' => 'completed',
                'description' => 'Activity has been completed successfully',
                'color' => '#3B82F6', // Blue
                'sort_order' => 3,
            ],
            [
                'name' => 'Cancelled',
                'slug' => 'cancelled',
                'description' => 'Activity has been cancelled',
                'color' => '#EF4444', // Red
                'sort_order' => 4,
            ],
        ];

        foreach ($statuses as $status) {
            ActivityStatus::create([
                'name' => $status['name'],
                'slug' => $status['slug'],
                'description' => $status['description'],
                'color' => $status['color'],
                'sort_order' => $status['sort_order'],
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
