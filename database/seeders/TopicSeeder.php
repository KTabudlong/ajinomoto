<?php
namespace Database\Seeders;

use App\Models\Topic;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TopicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $topics = [
            [
                'name' => 'Team Meeting',
                'description' => 'Regular team meetings and discussions',
                'sort_order' => 1,
            ],
            [
                'name' => 'Training Session',
                'description' => 'Professional development and skill building',
                'sort_order' => 2,
            ],
            [
                'name' => 'Client Review',
                'description' => 'Client meetings and project reviews',
                'sort_order' => 3,
            ],
            [
                'name' => 'Maintenance',
                'description' => 'System maintenance and updates',
                'sort_order' => 4,
            ],
            [
                'name' => 'Planning Session',
                'description' => 'Strategic planning and goal setting',
                'sort_order' => 5,
            ],
        ];

        foreach ($topics as $topic) {
            Topic::create([
                'name' => $topic['name'],
                'description' => $topic['description'],
                'sort_order' => $topic['sort_order'],
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
