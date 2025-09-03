<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExcelProcessingService;
use Illuminate\Http\UploadedFile;

class GenerateTolucaCalendar extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:toluca-calendar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Toluca Calendar Export (2025-2030)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating Toluca Calendar Export...');
        
        try {
            // Read the Toluca file
            $tolucaFile = 'xlsx/toluca/Toluca Environmental Compliance Calendar.xlsx';
            
            if (!file_exists($tolucaFile)) {
                $this->error('Toluca file not found: ' . $tolucaFile);
                return 1;
            }
            
            // Create a mock file object
            $file = new UploadedFile(
                $tolucaFile,
                basename($tolucaFile),
                mime_content_type($tolucaFile),
                null,
                true
            );
            
            $excelService = new ExcelProcessingService();
            
            // Process the Toluca file
            $this->info('Processing Toluca file...');
            $tolucaData = $excelService->processTolucaFile($file);
            $this->info('Found ' . count($tolucaData) . ' compliance tasks');
            
            // Generate the calendar export (2025-2030)
            $this->info('Generating calendar export (2025-2030)...');
            $filePath = $excelService->generateTolucaCalendarExport($tolucaData, 2025, 2030, $file);
            
            $this->info('Calendar generated successfully!');
            $this->info('File path: ' . $filePath);
            $this->info('File exists: ' . (file_exists($filePath) ? 'Yes' : 'No'));
            $this->info('File size: ' . (file_exists($filePath) ? filesize($filePath) . ' bytes' : 'N/A'));
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('Trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
}
