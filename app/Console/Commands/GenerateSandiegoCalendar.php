<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExcelProcessingService;

class GenerateSandiegoCalendar extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:sandiego-calendar {--file=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate San Diego Environmental Compliance Calendar';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating San Diego Calendar Export...');
        
        $file = $this->option('file');
        if (!$file) {
            $file = 'xlsx/sandiego/San Diego Environmental Compliance Calendar.xlsx';
        }
        
        $this->info("Processing San Diego file: {$file}");
        
        try {
            $excelService = new ExcelProcessingService();
            $result = $excelService->generateSandiegoCalendarExport($file);
            
            $this->info("San Diego Calendar generated successfully!");
            $this->info("File saved to: {$result}");
            
        } catch (\Exception $e) {
            $this->error("Error generating San Diego Calendar: " . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
