<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExcelProcessingService;
use Illuminate\Http\UploadedFile;

class Test2025Only extends Command
{
    protected $signature = 'test:2025-only';
    protected $description = 'Test 2025 calendar generation only';

    public function handle()
    {
        $this->info("=== TESTING 2025 CALENDAR GENERATION ===");
        
        try {
            $file = new UploadedFile(
                'xlsx/Toluca Environmental Compliance Calendar.xlsx', 
                'Toluca Environmental Compliance Calendar.xlsx', 
                null, 
                null, 
                true
            );

            $excelService = new ExcelProcessingService();
            
            $this->info("Processing Toluca file...");
            $tolucaData = $excelService->processTolucaFile($file);
            $this->info("Found " . count($tolucaData) . " compliance tasks");
            
            $this->info("\n=== COMPLIANCE TASKS FOR 2025 ===");
            $this->table(
                ['Row', 'Topic', 'Site', 'Activity', 'Frequency', 'Due Date', 'Should Include'],
                array_map(function($task, $index) {
                    $row = $index + 2; // Excel rows start at 2
                    $activityShort = strlen($task['activity']) > 40 ? substr($task['activity'], 0, 40) . '...' : $task['activity'];
                    
                    // Determine if should be included based on your specifications
                    $shouldInclude = $this->shouldIncludeIn2025($task, $row);
                    
                    return [
                        $row,
                        $task['topic'],
                        $task['site'],
                        $activityShort,
                        $task['frequency'],
                        $task['due_date'],
                        $shouldInclude ? 'YES' : 'NO'
                    ];
                }, $tolucaData, array_keys($tolucaData))
            );
            
            $this->info("\n=== GENERATING 2025 EVENTS ===");
            $events = $excelService->generateCalendarEvents($tolucaData, 2025);
            $this->info("Generated " . count($events) . " calendar events for 2025");
            
            if (count($events) > 0) {
                $this->info("\n=== 2025 CALENDAR EVENTS ===");
                $this->table(
                    ['Date', 'Topic', 'Site', 'Activity', 'Frequency'],
                    array_map(function($event) {
                        $activityShort = strlen($event['activity']) > 50 ? substr($event['activity'], 0, 50) . '...' : $event['activity'];
                        return [
                            $event['date'],
                            $event['topic'],
                            $event['site'],
                            $activityShort,
                            $event['frequency']
                        ];
                    }, array_slice($events, 0, 20)) // Show first 20 events
                );
                
                if (count($events) > 20) {
                    $this->info("... and " . (count($events) - 20) . " more events");
                }
            }
            
            $this->info("\n=== GENERATING 2025 CALENDAR FILE ===");
            $filePath = $excelService->generateTolucaCalendar2025($tolucaData);
            
            $this->info("Calendar generated successfully!");
            $this->info("File path: " . $filePath);
            $this->info("File exists: " . (file_exists($filePath) ? 'Yes' : 'No'));
            $this->info("File size: " . (file_exists($filePath) ? filesize($filePath) . ' bytes' : 'N/A'));
            
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            $this->error("Trace: " . $e->getTraceAsString());
            return 1;
        }

        return 0;
    }
    
    private function shouldIncludeIn2025($task, $row)
    {
        $frequency = strtolower($task['frequency']);
        $dueDate = $task['due_date'];
        
        // Based on the actual data shown in the test output
        switch ($row) {
            case 2: // Air - July 1st (Annual)
                return true; // Should be included
            case 3: // EPCRA - March 1st (Annual)
                return true; // Should be included
            case 4: // EPCRA - July 1st (Annual)
                return true; // Should be included
            case 5: // Wastewater - Every 4 years, 2027
                return false; // Not in 2025
            case 6: // Hazardous Waste - 180 days
                return true; // Should be included
            case 7: // Universal Waste - On hire, then annually
                return true; // Should be included
            case 8: // Stormwater - Quarterly
                return true; // Should be included
            case 9: // Stormwater - Quarterly
                return true; // Should be included
            case 10: // Stormwater - Quarterly
                return true; // Should be included
            case 11: // Stormwater - Annual, 2025-11-19
                return true; // Should be included (exact date in 2025)
            case 12: // Stormwater - On hire, then annually
                return true; // Should be included
            case 13: // Stormwater - Annual, 2025-11-19
                return true; // Should be included (exact date in 2025)
            case 14: // Stormwater - 5 Years, 2028
                return false; // Not in 2025
            case 15: // SPCC - Monthly
                return true; // Should be included
            case 16: // SPCC - Annually, no date
                return true; // Should be included
            case 17: // SPCC - On hire, then annually
                return true; // Should be included
            case 18: // SPCC - Annual, no date
                return true; // Should be included
            case 19: // SPCC - 5 Years, 2030
                return false; // Not in 2025
            default:
                return true; // Include by default
        }
    }
}
