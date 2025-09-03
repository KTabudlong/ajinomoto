<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExcelProcessingService;
use Illuminate\Http\UploadedFile;

class DebugMonthEvents extends Command
{
    protected $signature = 'debug:month-events';
    protected $description = 'Debug the getMonthEvents method to see what events are being generated';

    public function handle()
    {
        $this->info("=== DEBUGGING MONTH EVENTS ===");
        
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
            
            // Test January 2025
            $this->info("\n=== JANUARY 2025 EVENTS ===");
            $janEvents = $this->getMonthEventsDebug($excelService, $tolucaData, 2025, 1);
            $this->info("January events found: " . count($janEvents));
            foreach ($janEvents as $date => $activities) {
                $this->info("  {$date}: " . count($activities) . " activities");
                foreach ($activities as $activity) {
                    $this->info("    - " . $activity['topic'] . ": " . substr($activity['activity'], 0, 50) . "...");
                }
            }
            
            // Test March 2025
            $this->info("\n=== MARCH 2025 EVENTS ===");
            $marEvents = $this->getMonthEventsDebug($excelService, $tolucaData, 2025, 3);
            $this->info("March events found: " . count($marEvents));
            foreach ($marEvents as $date => $activities) {
                $this->info("  {$date}: " . count($activities) . " activities");
                foreach ($activities as $activity) {
                    $this->info("    - " . $activity['topic'] . ": " . substr($activity['activity'], 0, 50) . "...");
                }
            }
            
            // Test July 2025
            $this->info("\n=== JULY 2025 EVENTS ===");
            $julEvents = $this->getMonthEventsDebug($excelService, $tolucaData, 2025, 7);
            $this->info("July events found: " . count($julEvents));
            foreach ($julEvents as $date => $activities) {
                $this->info("  {$date}: " . count($activities) . " activities");
                foreach ($activities as $activity) {
                    $this->info("    - " . $activity['topic'] . ": " . substr($activity['activity'], 0, 50) . "...");
                }
            }
            
            // Test November 2025
            $this->info("\n=== NOVEMBER 2025 EVENTS ===");
            $novEvents = $this->getMonthEventsDebug($excelService, $tolucaData, 2025, 11);
            $this->info("November events found: " . count($novEvents));
            foreach ($novEvents as $date => $activities) {
                $this->info("  {$date}: " . count($activities) . " activities");
                foreach ($activities as $activity) {
                    $this->info("    - " . $activity['topic'] . ": " . substr($activity['activity'], 0, 50) . "...");
                }
            }
            
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            $this->error("Trace: " . $e->getTraceAsString());
            return 1;
        }

        return 0;
    }
    
    private function getMonthEventsDebug($excelService, $tolucaData, $year, $month)
    {
        $events = [];
        
        foreach ($tolucaData as $task) {
            $dueDate = $excelService->parseDueDate($task['due_date'], $year);
            
            if ($dueDate) {
                $this->info("Processing task: " . $task['topic'] . " - " . substr($task['activity'], 0, 30) . "...");
                $this->info("  Due date: " . $dueDate->format('Y-m-d'));
                $this->info("  Frequency: " . $task['frequency']);
                
                // Generate recurring dates for the specific year
                $recurringDates = $excelService->calculateRecurringDates($dueDate, $task['frequency'], $year);
                $this->info("  Recurring dates: " . count($recurringDates));
                
                foreach ($recurringDates as $date) {
                    $this->info("    Checking date: " . $date->format('Y-m-d'));
                    
                    // Handle weekend events - move to weekday
                    $adjustedDate = $excelService->adjustWeekendDate($date);
                    $this->info("    Adjusted date: " . $adjustedDate->format('Y-m-d'));
                    
                    // Check if this date is in the target month
                    if ($adjustedDate->format('Y') == $year && $adjustedDate->format('n') == $month) {
                        $dateKey = $adjustedDate->format('Y-m-d');
                        $this->info("    ✅ MATCH! Adding to {$dateKey}");
                        
                        if (!isset($events[$dateKey])) {
                            $events[$dateKey] = [];
                        }
                        
                        $events[$dateKey][] = [
                            'topic' => $task['topic'],
                            'activity' => $task['activity'],
                            'site' => $task['site'],
                            'frequency' => $task['frequency']
                        ];
                    } else {
                        $this->info("    ❌ Not in target month");
                    }
                }
            } else {
                $this->info("Skipping task (no due date): " . $task['topic'] . " - " . substr($task['activity'], 0, 30) . "...");
            }
        }
        
        return $events;
    }
}

