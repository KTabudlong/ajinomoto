<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sites = [
            [
                'name' => 'Main Office',
                'description' => 'Primary office location',
                'address' => '123 Main Street',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip_code' => '60601',
                'phone' => '(312) 555-0123',
                'email' => 'main@company.com',
                'sort_order' => 1,
            ],
            [
                'name' => 'Downtown Branch',
                'description' => 'Downtown office location',
                'address' => '456 Business Ave',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip_code' => '60602',
                'phone' => '(312) 555-0456',
                'email' => 'downtown@company.com',
                'sort_order' => 2,
            ],
            [
                'name' => 'North Branch',
                'description' => 'North side office location',
                'address' => '789 North Road',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip_code' => '60640',
                'phone' => '(773) 555-0789',
                'email' => 'north@company.com',
                'sort_order' => 3,
            ],
        ];

        foreach ($sites as $site) {
            DB::table('sites')->insert($site);
        }
    }
}
