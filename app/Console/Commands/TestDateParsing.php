<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExcelProcessingService;

class TestDateParsing extends Command
{
    protected $signature = 'test:date-parsing';
    protected $description = 'Test date parsing and event generation';

    public function handle()
    {
        $this->info('Testing Date Parsing and Event Generation...');
        
        // Create sample compliance data
        $sampleData = [
            [
                'topic' => 'SPCC',
                'site' => 'Toluca',
                'activity' => 'Conduct annual AST integrity inspections',
                'frequency' => 'annual',
                'due_date' => '01/15/2025'
            ],
            [
                'topic' => 'Environmental',
                'site' => 'Toluca',
                'activity' => 'Quarterly environmental review',
                'frequency' => 'quarterly',
                'due_date' => '01/01/2025'
            ],
            [
                'topic' => 'Safety',
                'site' => 'Toluca',
                'activity' => 'Monthly safety inspection',
                'frequency' => 'monthly',
                'due_date' => '01/01/2025'
            ]
        ];
        
        try {
            $excelService = new ExcelProcessingService();
            
            foreach ($sampleData as $index => $task) {
                $this->info("\n📋 Task " . ($index + 1) . ":");
                $this->info("   Topic: " . $task['topic']);
                $this->info("   Frequency: " . $task['frequency']);
                $this->info("   Due Date: " . $task['due_date']);
                
                // Test date parsing
                $parsedDate = $this->invokeMethod($excelService, 'parseDueDate', [$task['due_date']]);
                if ($parsedDate) {
                    $this->info("   ✅ Parsed Date: " . $parsedDate->format('Y-m-d'));
                    
                    // Test recurring dates calculation
                    $recurringDates = $this->invokeMethod($excelService, 'calculateRecurringDates', [$parsedDate, $task['frequency'], 2025]);
                    $this->info("   📅 Recurring Dates for 2025: " . count($recurringDates));
                    foreach ($recurringDates as $date) {
                        $this->info("      - " . $date->format('Y-m-d'));
                    }
                    
                    // Test weekend adjustment
                    $adjustedDates = [];
                    foreach ($recurringDates as $date) {
                        $adjusted = $this->invokeMethod($excelService, 'adjustWeekendDate', [$date]);
                        $adjustedDates[] = $adjusted->format('Y-m-d');
                    }
                    $this->info("   🔄 Adjusted Dates (weekend handling): " . count($adjustedDates));
                    foreach ($adjustedDates as $date) {
                        $this->info("      - " . $date);
                    }
                } else {
                    $this->error("   ❌ Failed to parse date: " . $task['due_date']);
                }
            }
            
            // Test full event generation
            $this->info("\n🎯 Testing Full Event Generation...");
            $events = $excelService->generateCalendarEvents($sampleData, 2025);
            $this->info("Total events generated: " . count($events));
            
            foreach ($events as $event) {
                $this->info("   Event: " . $event['date'] . " - " . $event['topic'] . ": " . $event['activity']);
            }
            
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('Trace: ' . $e->getTraceAsString());
        }
    }
    
    /**
     * Invoke a private method for testing
     */
    private function invokeMethod($object, $methodName, array $parameters = [])
    {
        $reflection = new \ReflectionClass(get_class($object));
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invokeArgs($object, $parameters);
    }
}
