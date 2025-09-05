<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SanDiegoExcelProcessingService;

class GenerateSandiego2025Calendar extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:sandiego-2025-calendar {--file=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate San Diego 2025 Calendar';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating San Diego 2025 Calendar...');
        
        $file = $this->option('file');
        if (!$file) {
            $file = 'xlsx/sandiego/San Diego Environmental Compliance Calendar.xlsx';
        }
        
        $this->info("Processing San Diego file: {$file}");
        
        try {
            $excelService = new SanDiegoExcelProcessingService();
            $result = $excelService->generateSanDiego2025Calendar($file);
            
            $this->info("San Diego 2025 Calendar generated successfully!");
            $this->info("File saved to: {$result}");
            
        } catch (\Exception $e) {
            $this->error("Error generating San Diego 2025 Calendar: " . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
