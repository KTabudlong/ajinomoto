<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActivityTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activityTypes = [
            [
                'name' => 'Single Event',
                'slug' => 'single',
                'description' => 'One-time activity on a specific date',
                'config' => json_encode(['requires_end_date' => false]),
                'sort_order' => 1,
            ],
            [
                'name' => 'Quarterly (Start of Quarter)',
                'slug' => 'quarterly_start',
                'description' => 'Activity that starts on January 1st, April 1st, July 1st, October 1st',
                'config' => json_encode(['quarter_start_months' => [1, 4, 7, 10]]),
                'sort_order' => 2,
            ],
            [
                'name' => 'Quarterly (End of Quarter)',
                'slug' => 'quarterly_end',
                'description' => 'Activity that occurs at the end of each quarter (March 31st, June 30th, September 30th, December 31st)',
                'config' => json_encode(['quarter_end_months' => [3, 6, 9, 12]]),
                'sort_order' => 3,
            ],
            [
                'name' => 'Every X Months',
                'slug' => 'every_x_months',
                'description' => 'Activity that repeats every specified number of months',
                'config' => json_encode(['requires_interval' => true, 'interval_type' => 'months']),
                'sort_order' => 4,
            ],
            [
                'name' => 'Every X Years',
                'slug' => 'every_x_years',
                'description' => 'Activity that repeats every specified number of years',
                'config' => json_encode(['requires_interval' => true, 'interval_type' => 'years']),
                'sort_order' => 5,
            ],
            [
                'name' => 'Specific Dates',
                'slug' => 'specific_dates',
                'description' => 'Activity that occurs on specific dates throughout the year',
                'config' => json_encode(['requires_custom_dates' => true]),
                'sort_order' => 6,
            ],
            [
                'name' => 'Annually (Custom Date)',
                'slug' => 'annually_custom',
                'description' => 'Activity that repeats annually on a specific date',
                'config' => json_encode(['requires_annual_date' => true]),
                'sort_order' => 7,
            ],
            [
                'name' => 'Monthly',
                'slug' => 'monthly',
                'description' => 'Activity that occurs every month on the same date',
                'config' => json_encode(['frequency' => 'monthly']),
                'sort_order' => 8,
            ],
            [
                'name' => 'Every X Days',
                'slug' => 'every_x_days',
                'description' => 'Activity that repeats every specified number of days',
                'config' => json_encode(['requires_interval' => true, 'interval_type' => 'days']),
                'sort_order' => 9,
            ],
        ];

        foreach ($activityTypes as $type) {
            DB::table('activity_types')->insert($type);
        }
    }
}
