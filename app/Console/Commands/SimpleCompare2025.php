<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;

class SimpleCompare2025 extends Command
{
    protected $signature = 'simple:compare-2025';
    protected $description = 'Simple comparison of generated vs sample 2025 calendars';

    public function handle()
    {
        $this->info("=== COMPREHENSIVE 2025 CALENDAR COMPARISON ===");
        
        // Read generated calendar
        $generatedFile = 'storage/app/temp/toluca_calendar_2025_2025.xlsx';
        $this->info("Reading generated calendar: " . $generatedFile);
        $generatedData = $this->getAllActivities($generatedFile);
        
        // Read sample calendar
        $sampleFile = 'xlsx/toluca 2025 sample.xlsx';
        $this->info("Reading sample calendar: " . $sampleFile);
        $sampleData = $this->getAllActivities($sampleFile);
        
        $this->info("\n=== RESULTS ===");
        $this->info("Generated calendar activities: " . count($generatedData));
        $this->info("Sample calendar activities: " . count($sampleData));
        $this->info("Difference: " . (count($sampleData) - count($generatedData)));
        
        // Show all activities by month
        $this->info("\n=== GENERATED CALENDAR ACTIVITIES BY MONTH ===");
        $this->showActivitiesByMonth($generatedData);
        
        $this->info("\n=== SAMPLE CALENDAR ACTIVITIES BY MONTH ===");
        $this->showActivitiesByMonth($sampleData);
        
        return 0;
    }
    
    private function countActivities($filePath)
    {
        if (!file_exists($filePath)) {
            $this->error("File not found: " . $filePath);
            return 0;
        }
        
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getSheet(0);
        $highestRow = $sheet->getHighestRow();
        
        $count = 0;
        for ($row = 1; $row <= $highestRow; $row++) {
            for ($col = 'A'; $col <= 'H'; $col++) {
                $cellValue = $sheet->getCell($col . $row)->getValue();
                if (!empty($cellValue) && !is_numeric($cellValue) && strlen(trim($cellValue)) > 10) {
                    // Check if it looks like an activity (contains "Due" or activity keywords)
                    if (str_contains($cellValue, 'Due') || 
                        str_contains($cellValue, 'SPCC') || 
                        str_contains($cellValue, 'Stormwater') || 
                        str_contains($cellValue, 'EPCRA') || 
                        str_contains($cellValue, 'Air') ||
                        str_contains($cellValue, 'Universal Waste')) {
                        $count++;
                    }
                }
            }
        }
        
        return $count;
    }
    
    private function getAllActivities($filePath)
    {
        if (!file_exists($filePath)) {
            $this->error("File not found: " . $filePath);
            return [];
        }
        
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getSheet(0);
        $highestRow = $sheet->getHighestRow();
        
        $activities = [];
        $currentMonth = '';
        
        for ($row = 1; $row <= $highestRow; $row++) {
            $cellA = $sheet->getCell('A' . $row)->getValue();
            
            // Check if this is a month header
            if (!empty($cellA) && (str_contains($cellA, '2025') || is_numeric($cellA))) {
                $currentMonth = $cellA;
                continue;
            }
            
            // Check all columns for activities
            for ($col = 'A'; $col <= 'H'; $col++) {
                $cellValue = $sheet->getCell($col . $row)->getValue();
                if (!empty($cellValue) && !is_numeric($cellValue) && strlen(trim($cellValue)) > 10) {
                    // Check if it looks like an activity
                    if (str_contains($cellValue, 'Due') || 
                        str_contains($cellValue, 'SPCC') || 
                        str_contains($cellValue, 'Stormwater') || 
                        str_contains($cellValue, 'EPCRA') || 
                        str_contains($cellValue, 'Air') ||
                        str_contains($cellValue, 'Universal Waste') ||
                        str_contains($cellValue, 'Annually') ||
                        str_contains($cellValue, 'Quarterly') ||
                        str_contains($cellValue, 'End of Month')) {
                        
                        $activities[] = [
                            'month' => $currentMonth,
                            'row' => $row,
                            'column' => $col,
                            'activity' => trim($cellValue)
                        ];
                    }
                }
            }
        }
        
        return $activities;
    }
    
    private function showActivitiesByMonth($activities)
    {
        $byMonth = [];
        foreach ($activities as $activity) {
            $month = $activity['month'];
            if (!isset($byMonth[$month])) {
                $byMonth[$month] = [];
            }
            $byMonth[$month][] = $activity;
        }
        
        foreach ($byMonth as $month => $monthActivities) {
            $this->info("  {$month}: " . count($monthActivities) . " activities");
            foreach ($monthActivities as $activity) {
                $this->info("    Row {$activity['row']} {$activity['column']}: " . substr($activity['activity'], 0, 60) . "...");
            }
        }
    }
}
