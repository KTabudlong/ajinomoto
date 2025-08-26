<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExcelProcessingService;
use Illuminate\Support\Facades\Log;

class TestExcelProcessing extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:excel {--master= : Path to Master file} {--toluca= : Path to Toluca file} {--analyze : Analyze file structures}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Excel processing functionality and analyze file structures';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $masterFile = $this->option('master');
        $tolucaFile = $this->option('toluca');
        $analyze = $this->option('analyze');
        
        if ($analyze) {
            $this->analyzeFiles($masterFile, $tolucaFile);
            return 0;
        }
        
        // Default behavior - test with Toluca file
        if (!$tolucaFile) {
            $tolucaFile = 'xlsx/Toluca Environmental Compliance Calendar.xlsx';
        }
        
        if (!file_exists($tolucaFile)) {
            $this->error("File not found: {$tolucaFile}");
            return 1;
        }

        $this->info("Testing Excel processing with file: {$tolucaFile}");
        
        try {
            // Create a mock file object
            $file = new \Illuminate\Http\UploadedFile(
                $tolucaFile,
                basename($tolucaFile),
                mime_content_type($tolucaFile),
                null,
                true
            );

            $excelService = new ExcelProcessingService();
            
            $this->info("Processing Excel file...");
            
            // Process the file
            $complianceData = $excelService->processComplianceFile($file);
            
            $this->info("Found " . count($complianceData) . " compliance tasks");
            
            // Generate calendar events
            $calendarEvents = $excelService->generateCalendarEvents($complianceData, 2025);
            
            $this->info("Generated " . count($calendarEvents) . " calendar events");
            
            // Display sample data
            if (count($complianceData) > 0) {
                $this->info("\nSample compliance tasks:");
                $this->table(
                    ['Topic', 'Site', 'Activity', 'Frequency', 'Due Date'],
                    array_slice($complianceData, 0, 5)
                );
            }
            
            if (count($calendarEvents) > 0) {
                $this->info("\nSample calendar events:");
                $this->table(
                    ['Date', 'Topic', 'Site', 'Activity', 'Frequency'],
                    array_slice($calendarEvents, 0, 5)
                );
            }
            
            $this->info("\nExcel processing test completed successfully!");
            
        } catch (\Exception $e) {
            $this->error("Error processing Excel file: " . $e->getMessage());
            Log::error('Excel processing test failed', [
                'file' => $tolucaFile,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }

        return 0;
    }
    
    /**
     * Analyze both master and Toluca files
     */
    private function analyzeFiles($masterFile, $tolucaFile)
    {
        $this->info("=== EXCEL FILE STRUCTURE ANALYSIS ===\n");
        
        $excelService = new ExcelProcessingService();
        
        // Analyze Master file
        if ($masterFile && file_exists($masterFile)) {
            $this->info("📋 ANALYZING MASTER FILE: {$masterFile}");
            $this->info(str_repeat('-', 50));
            
            try {
                $masterUpload = new \Illuminate\Http\UploadedFile(
                    $masterFile,
                    basename($masterFile),
                    mime_content_type($masterFile),
                    null,
                    true
                );
                
                $masterStructure = $excelService->analyzeFileStructure($masterUpload);
                $masterData = $excelService->processMasterFile($masterUpload);
                
                $this->info("File Type: " . strtoupper($masterStructure['file_type']));
                $this->info("Sheets: " . implode(', ', $masterStructure['sheet_names']));
                
                foreach ($masterStructure['sheet_names'] as $sheetName) {
                    $sheetData = $masterStructure['sheet_data'][$sheetName];
                    $this->info("  - {$sheetName}: {$sheetData['rows']} rows, {$sheetData['columns']} columns");
                }
                
                if (isset($masterData['template'])) {
                    $this->info("\n📄 TEMPLATE SHEET STRUCTURE:");
                    $template = $masterData['template'];
                    $this->info("Columns: A to {$template['columns']}");
                    $this->info("Rows: {$template['rows']}");
                    
                    if (isset($template['data'][0])) {
                        $this->info("\nSample headers:");
                        $this->table(
                            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
                            [array_slice($template['data'][0], 0, 10)]
                        );
                    }
                }
                
                if (isset($masterData['toluca_2025'])) {
                    $this->info("\n📅 TOLUCA 2025 SHEET STRUCTURE:");
                    $toluca2025 = $masterData['toluca_2025'];
                    $this->info("Columns: A to {$toluca2025['columns']}");
                    $this->info("Rows: {$toluca2025['rows']}");
                    
                    if (isset($toluca2025['data'][0])) {
                        $this->info("\nSample data (first row):");
                        $this->table(
                            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
                            [array_slice($toluca2025['data'][0], 0, 10)]
                        );
                    }
                }
                
            } catch (\Exception $e) {
                $this->error("Error analyzing Master file: " . $e->getMessage());
            }
        } else {
            $this->warn("⚠️  Master file not provided or not found");
        }
        
        $this->info("\n" . str_repeat('=', 60) . "\n");
        
        // Analyze Toluca file
        if ($tolucaFile && file_exists($tolucaFile)) {
            $this->info("📊 ANALYZING TOLUCA FILE: {$tolucaFile}");
            $this->info(str_repeat('-', 50));
            
            try {
                $tolucaUpload = new \Illuminate\Http\UploadedFile(
                    $tolucaFile,
                    basename($tolucaFile),
                    mime_content_type($tolucaFile),
                    null,
                    true
                );
                
                $tolucaStructure = $excelService->analyzeFileStructure($tolucaUpload);
                $tolucaData = $excelService->processTolucaFile($tolucaUpload);
                
                $this->info("File Type: " . strtoupper($tolucaStructure['file_type']));
                $this->info("Sheets: " . implode(', ', $tolucaStructure['sheet_names']));
                
                foreach ($tolucaStructure['sheet_names'] as $sheetName) {
                    $sheetData = $tolucaStructure['sheet_data'][$sheetName];
                    $this->info("  - {$sheetName}: {$sheetData['rows']} rows, {$sheetData['columns']} columns");
                }
                
                $this->info("\n📋 ACTIONS SHEET COMPLIANCE DATA:");
                $this->info("Total Tasks Found: " . count($tolucaData));
                
                if (count($tolucaData) > 0) {
                    $this->info("\nSample compliance tasks:");
                    $this->table(
                        ['Topic', 'Site', 'Activity', 'Frequency', 'Due Date'],
                        array_slice($tolucaData, 0, 5)
                    );
                }
                
            } catch (\Exception $e) {
                $this->error("Error analyzing Toluca file: " . $e->getMessage());
            }
        } else {
            $this->warn("⚠️  Toluca file not provided or not found");
        }
        
        // Compare data if both files are available
        if ($masterFile && $tolucaFile && file_exists($masterFile) && file_exists($tolucaFile)) {
            $this->info("\n" . str_repeat('=', 60) . "\n");
            $this->info("🔄 COMPARISON ANALYSIS");
            $this->info(str_repeat('-', 50));
            
            try {
                $masterUpload = new \Illuminate\Http\UploadedFile(
                    $masterFile,
                    basename($masterFile),
                    mime_content_type($masterFile),
                    null,
                    true
                );
                
                $tolucaUpload = new \Illuminate\Http\UploadedFile(
                    $tolucaFile,
                    basename($tolucaFile),
                    mime_content_type($tolucaFile),
                    null,
                    true
                );
                
                $masterData = $excelService->processMasterFile($masterUpload);
                $tolucaData = $excelService->processTolucaFile($tolucaUpload);
                
                $comparison = $excelService->compareData($tolucaData, $masterData);
                
                $this->info("Comparison Results:");
                $this->info("  - Toluca Tasks: {$comparison['toluca_tasks']}");
                $this->info("  - Master Template: " . ($comparison['master_structure'] ? 'Available' : 'Not found'));
                $this->info("  - Master Toluca 2025: " . ($comparison['master_toluca_2025'] ? 'Available' : 'Not found'));
                
                if (isset($comparison['analysis']['template_structure'])) {
                    $template = $comparison['analysis']['template_structure'];
                    $this->info("\n📋 Template Structure:");
                    $this->info("  - Columns: A to {$template['columns']}");
                    $this->info("  - Rows: {$template['rows']}");
                }
                
                if (isset($comparison['analysis']['toluca_2025_structure'])) {
                    $toluca2025 = $comparison['analysis']['toluca_2025_structure'];
                    $this->info("\n📅 Toluca 2025 Structure:");
                    $this->info("  - Columns: A to {$toluca2025['columns']}");
                    $this->info("  - Rows: {$toluca2025['rows']}");
                }
                
            } catch (\Exception $e) {
                $this->error("Error comparing files: " . $e->getMessage());
            }
        }
        
        $this->info("\n" . str_repeat('=', 60));
        $this->info("Analysis completed!");
    }
}
