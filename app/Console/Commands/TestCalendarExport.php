<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExcelProcessingService;
use PhpOffice\PhpSpreadsheet\IOFactory;

class TestCalendarExport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:calendar-export';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the calendar export functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Calendar Export...');
        
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
        
        $this->info('Sample data created: ' . count($sampleData) . ' tasks');
        
        try {
            $excelService = new ExcelProcessingService();
            
            $this->info('Testing Excel export...');
            $filename = 'test_calendar_export.xlsx';
            $filePath = $excelService->exportToExcelMasterFormat($sampleData, $filename);
            
            $this->info('Excel export successful!');
            $this->info('File saved to: ' . $filePath);
            
            // Check if file exists and has content
            if (file_exists($filePath)) {
                $fileSize = filesize($filePath);
                $this->info('File size: ' . $fileSize . ' bytes');
                
                if ($fileSize > 0) {
                    $this->info('✅ File has content!');
                    
                    // Examine the Excel file structure
                    $this->info('🔍 Examining Excel file structure...');
                    $this->examineExcelFile($filePath);
                } else {
                    $this->error('❌ File is empty!');
                }
            } else {
                $this->error('❌ File not found!');
            }
            
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('Trace: ' . $e->getTraceAsString());
        }
    }
    
    /**
     * Examine the Excel file to see its structure
     */
    private function examineExcelFile($filePath)
    {
        try {
            $spreadsheet = IOFactory::load($filePath);
            $this->info('📊 Excel file loaded successfully');
            
            $this->info('📋 Sheets found: ' . $spreadsheet->getSheetCount());
            
            foreach ($spreadsheet->getWorksheetIterator() as $worksheet) {
                $sheetName = $worksheet->getTitle();
                $this->info("\n📄 Sheet: {$sheetName}");
                
                $highestRow = $worksheet->getHighestRow();
                $highestCol = $worksheet->getHighestColumn();
                $this->info("   Dimensions: {$highestCol}{$highestRow}");
                
                // Show first few rows to see the structure
                $this->info("   📝 First 10 rows content:");
                for ($row = 1; $row <= min(10, $highestRow); $row++) {
                    $rowData = [];
                    for ($col = 'A'; $col <= min('H', $highestCol); $col++) {
                        $cellValue = $worksheet->getCell($col . $row)->getValue();
                        $rowData[] = $cellValue ?: 'empty';
                    }
                    $this->info("      Row {$row}: " . implode(' | ', $rowData));
                }
                
                // Show month headers if they exist
                $this->info("   🗓️  Month headers (row 1):");
                for ($col = 'G'; $col <= 'Z'; $col++) {
                    $cellValue = $worksheet->getCell($col . '1')->getValue();
                    if ($cellValue) {
                        $this->info("      Column {$col}: {$cellValue}");
                    }
                }
                
                // Show day headers if they exist
                $this->info("   📅 Day headers (row 2):");
                for ($col = 'G'; $col <= 'Z'; $col++) {
                    $cellValue = $worksheet->getCell($col . '2')->getValue();
                    if ($cellValue) {
                        $this->info("      Column {$col}: {$cellValue}");
                    }
                }
                
                // Show task info columns
                $this->info("   📋 Task info columns (row 25):");
                for ($col = 'A'; $col <= 'F'; $col++) {
                    $cellValue = $worksheet->getCell($col . '25')->getValue();
                    $this->info("      Column {$col}: {$cellValue}");
                }
                
                // Show task data rows
                $this->info("   📋 Task data rows:");
                for ($row = 26; $row <= min(30, $highestRow); $row++) {
                    $rowData = [];
                    for ($col = 'A'; $col <= 'F'; $col++) {
                        $cellValue = $worksheet->getCell($col . $row)->getValue();
                        $rowData[] = $cellValue ?: 'empty';
                    }
                    $this->info("      Row {$row}: " . implode(' | ', $rowData));
                }
                
                // Show calendar grid sample
                $this->info("   📅 Calendar grid sample (rows 26-30):");
                for ($row = 26; $row <= min(30, $highestRow); $row++) {
                    $rowData = [];
                    for ($col = 'G'; $col <= 'M'; $col++) { // Just January for sample
                        $cellValue = $worksheet->getCell($col . $row)->getValue();
                        $rowData[] = $cellValue ?: 'empty';
                    }
                    $this->info("      Row {$row}: " . implode(' | ', $rowData));
                }
            }
            
        } catch (\Exception $e) {
            $this->error('Error examining Excel file: ' . $e->getMessage());
        }
    }
}
