<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;

class DebugGeneratedCalendar extends Command
{
    protected $signature = 'debug:generated-calendar';
    protected $description = 'Debug the generated calendar file to see what activities are actually in it';

    public function handle()
    {
        $filePath = 'storage/app/temp/toluca_calendar_2025_2025.xlsx';
        
        if (!file_exists($filePath)) {
            $this->error("Generated calendar file not found: " . $filePath);
            return 1;
        }
        
        $this->info("=== DEBUGGING GENERATED CALENDAR ===");
        $this->info("File: " . $filePath);
        
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getSheet(0);
        
        $highestRow = $sheet->getHighestRow();
        $this->info("Total rows: " . $highestRow);
        
        $activities = [];
        $currentMonth = '';
        
        for ($row = 1; $row <= min($highestRow, 200); $row++) { // Limit to first 200 rows for debugging
            $cellA = $sheet->getCell('A' . $row)->getValue();
            $cellB = $sheet->getCell('B' . $row)->getValue();
            $cellC = $sheet->getCell('C' . $row)->getValue();
            $cellD = $sheet->getCell('D' . $row)->getValue();
            $cellE = $sheet->getCell('E' . $row)->getValue();
            $cellF = $sheet->getCell('F' . $row)->getValue();
            $cellG = $sheet->getCell('G' . $row)->getValue();
            $cellH = $sheet->getCell('H' . $row)->getValue();
            
            // Check if this is a month header
            if (!empty($cellA) && !empty($cellB) && !empty($cellC) && 
                in_array(strtolower($cellB), ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])) {
                $currentMonth = $cellA;
                $this->info("Row {$row}: Month header - {$currentMonth}");
                continue;
            }
            
            // Check if this row has any non-empty cells
            $hasContent = false;
            for ($col = 'A'; $col <= 'H'; $col++) {
                $cellValue = $sheet->getCell($col . $row)->getValue();
                if (!empty($cellValue)) {
                    $hasContent = true;
                    break;
                }
            }
            
            if ($hasContent) {
                $this->info("Row {$row}: A='{$cellA}' B='{$cellB}' C='{$cellC}' D='{$cellD}' E='{$cellE}' F='{$cellF}' G='{$cellG}' H='{$cellH}'");
                
                // Check if this is an activity row (has text in B-H)
                for ($col = 'B'; $col <= 'H'; $col++) {
                    $cellValue = $sheet->getCell($col . $row)->getValue();
                    if (!empty($cellValue) && !is_numeric($cellValue) && strlen(trim($cellValue)) > 3) {
                        $activities[] = [
                            'row' => $row,
                            'month' => $currentMonth,
                            'column' => $col,
                            'activity' => trim($cellValue)
                        ];
                    }
                }
            }
        }
        
        $this->info("\n=== ACTIVITIES FOUND ===");
        $this->info("Total activities found: " . count($activities));
        
        foreach ($activities as $activity) {
            $this->info("Row {$activity['row']} ({$activity['month']} {$activity['column']}): " . substr($activity['activity'], 0, 60) . "...");
        }
        
        // Group by month
        $this->info("\n=== ACTIVITIES BY MONTH ===");
        $byMonth = [];
        foreach ($activities as $activity) {
            $month = $activity['month'];
            if (!isset($byMonth[$month])) {
                $byMonth[$month] = 0;
            }
            $byMonth[$month]++;
        }
        
        foreach ($byMonth as $month => $count) {
            $this->info("{$month}: {$count} activities");
        }
        
        return 0;
    }
}
