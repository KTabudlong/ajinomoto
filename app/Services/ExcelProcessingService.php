<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ExcelProcessingService
{
    /**
     * Analyze Excel file structure to determine its type
     */
    public function analyzeFileStructure($file)
    {
        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheetNames = [];
            $sheetData = [];
            
            foreach ($spreadsheet->getWorksheetIterator() as $worksheet) {
                $sheetName = $worksheet->getTitle();
                $sheetNames[] = $sheetName;
                
                // Get first few rows to analyze structure
                $highestRow = min(10, $worksheet->getHighestRow());
                $highestCol = min(10, $worksheet->getHighestRow());
                
                $sheetData[$sheetName] = [
                    'rows' => $highestRow,
                    'columns' => $worksheet->getHighestColumn(),
                    'sample_data' => []
                ];
                
                for ($row = 1; $row <= $highestRow; $row++) {
                    $rowData = [];
                    for ($col = 'A'; $col <= $highestCol; $col++) {
                        $cellValue = $worksheet->getCell($col . $row)->getValue();
                        $rowData[$col] = $cellValue;
                    }
                    $sheetData[$sheetName]['sample_data'][] = $rowData;
                }
            }
            
            return [
                'sheet_names' => $sheetNames,
                'sheet_data' => $sheetData,
                'file_type' => $this->determineFileType($sheetData)
            ];
            
        } catch (\Exception $e) {
            Log::error('Error analyzing Excel file structure', [
                'error' => $e->getMessage(),
                'file' => $file->getClientOriginalName()
            ]);
            throw $e;
        }
    }
    
    /**
     * Determine if file is master or Toluca type
     */
    private function determineFileType($sheetData)
    {
        foreach ($sheetData as $sheetName => $data) {
            if (stripos($sheetName, 'toluca') !== false) {
                return 'toluca';
            }
            if (stripos($sheetName, 'template') !== false) {
                return 'master';
            }
        }
        
        // Check data structure
        foreach ($sheetData as $sheetName => $data) {
            if (isset($data['sample_data'][0])) {
                $firstRow = $data['sample_data'][0];
                if (isset($firstRow['A']) && isset($firstRow['B']) && isset($firstRow['C']) && 
                    isset($firstRow['D']) && isset($firstRow['E'])) {
                    return 'toluca';
                }
            }
        }
        
        return 'unknown';
    }
    
    /**
     * Process Toluca file (Actions sheet)
     */
    public function processTolucaFile($file)
    {
        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            
            // Get the Actions sheet (first sheet)
            $actionsSheet = $spreadsheet->getSheet(0);
            
            $complianceData = [];
            
            // Start from row 2 (assuming row 1 is header)
            $highestRow = $actionsSheet->getHighestRow();
            
            for ($row = 2; $row <= $highestRow; $row++) {
                $topic = $actionsSheet->getCell('A' . $row)->getValue();
                $site = $actionsSheet->getCell('B' . $row)->getValue();
                $activity = $actionsSheet->getCell('C' . $row)->getValue();
                $frequency = $actionsSheet->getCell('D' . $row)->getValue();
                $dueDate = $actionsSheet->getCell('E' . $row)->getValue();
                
                // Only process rows with repetitive frequency
                if ($this->isRepetitiveFrequency($frequency)) {
                    $complianceData[] = [
                        'topic' => $topic,
                        'site' => $site,
                        'activity' => $activity,
                        'frequency' => $frequency,
                        'due_date' => $dueDate,
                        'row' => $row
                    ];
                }
            }
            
            Log::info('Toluca file processed successfully', [
                'total_rows' => $highestRow,
                'compliance_tasks' => count($complianceData)
            ]);
            
            return $complianceData;
            
        } catch (\Exception $e) {
            Log::error('Error processing Toluca file', [
                'error' => $e->getMessage(),
                'file' => $file->getClientOriginalName()
            ]);
            throw $e;
        }
    }
    
    /**
     * Process Master file (Template and Toluca 2025 sheets)
     */
    public function processMasterFile($file)
    {
        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            
            $masterData = [];
            
            // Process Template sheet (first sheet)
            $templateSheet = $spreadsheet->getSheet(0);
            $masterData['template'] = $this->extractSheetData($templateSheet, 'Template');
            
            // Process Toluca 2025 sheet (second sheet)
            if ($spreadsheet->getSheetCount() > 1) {
                $tolucaSheet = $spreadsheet->getSheet(1);
                $masterData['toluca_2025'] = $this->extractSheetData($tolucaSheet, 'Toluca 2025');
            }
            
            Log::info('Master file processed successfully', [
                'sheets' => array_keys($masterData)
            ]);
            
            return $masterData;
            
        } catch (\Exception $e) {
            Log::error('Error processing Master file', [
                'error' => $e->getMessage(),
                'file' => $file->getClientOriginalName()
            ]);
            throw $e;
        }
    }
    
    /**
     * Extract data from a sheet
     */
    private function extractSheetData($worksheet, $sheetName)
    {
        $highestRow = $worksheet->getHighestRow();
        $highestCol = $worksheet->getHighestColumn();
        
        $sheetData = [
            'name' => $sheetName,
            'rows' => $highestRow,
            'columns' => $highestCol,
            'data' => []
        ];
        
        for ($row = 1; $row <= $highestRow; $row++) {
            $rowData = [];
            for ($col = 'A'; $col <= $highestCol; $col++) {
                $cellValue = $worksheet->getCell($col . $row)->getValue();
                $rowData[$col] = $cellValue;
            }
            $sheetData['data'][] = $rowData;
        }
        
        return $sheetData;
    }
    
    /**
     * Compare Toluca data with Master template
     */
    public function compareData($tolucaData, $masterData)
    {
        $comparison = [
            'toluca_tasks' => count($tolucaData),
            'master_structure' => $masterData['template'] ?? null,
            'master_toluca_2025' => $masterData['toluca_2025'] ?? null,
            'analysis' => []
        ];
        
        // Analyze structure differences
        if (isset($masterData['template'])) {
            $template = $masterData['template'];
            $comparison['analysis']['template_structure'] = [
                'columns' => $template['columns'],
                'rows' => $template['rows'],
                'sample_headers' => array_slice($template['data'], 0, 3)
            ];
        }
        
        if (isset($masterData['toluca_2025'])) {
            $toluca2025 = $masterData['toluca_2025'];
            $comparison['analysis']['toluca_2025_structure'] = [
                'columns' => $toluca2025['columns'],
                'rows' => $toluca2025['rows'],
                'sample_data' => array_slice($toluca2025['data'], 0, 5)
            ];
        }
        
        return $comparison;
    }
    
    /**
     * Generate export data in Master file format
     */
    public function generateMasterFormatExport($tolucaData, $masterTemplate)
    {
        $exportData = [];
        
        // Add header row based on master template
        if (isset($masterTemplate['data'][0])) {
            $exportData[] = $masterTemplate['data'][0];
        }
        
        // Convert Toluca data to master format
        foreach ($tolucaData as $task) {
            $exportRow = [];
            
            // Map Toluca columns to master format
            // This will need to be adjusted based on actual master file structure
            $exportRow['A'] = $task['topic'] ?? '';
            $exportRow['B'] = $task['site'] ?? '';
            $exportRow['C'] = $task['activity'] ?? '';
            $exportRow['D'] = $task['frequency'] ?? '';
            $exportRow['E'] = $task['due_date'] ?? '';
            
            $exportData[] = $exportRow;
        }
        
        return $exportData;
    }

    /**
     * Process uploaded Excel file and extract compliance data
     */
    public function processComplianceFile($file)
    {
        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            
            // Get the Actions sheet (first sheet)
            $actionsSheet = $spreadsheet->getSheet(0);
            
            $complianceData = [];
            
            // Start from row 2 (assuming row 1 is header)
            $highestRow = $actionsSheet->getHighestRow();
            
            for ($row = 2; $row <= $highestRow; $row++) {
                $topic = $actionsSheet->getCell('A' . $row)->getValue();
                $site = $actionsSheet->getCell('B' . $row)->getValue();
                $activity = $actionsSheet->getCell('C' . $row)->getValue();
                $frequency = $actionsSheet->getCell('D' . $row)->getValue();
                $dueDate = $actionsSheet->getCell('E' . $row)->getValue();
                
                // Only process rows with repetitive frequency
                if ($this->isRepetitiveFrequency($frequency)) {
                    $complianceData[] = [
                        'topic' => $topic,
                        'site' => $site,
                        'activity' => $activity,
                        'frequency' => $frequency,
                        'due_date' => $dueDate,
                        'row' => $row
                    ];
                }
            }
            
            Log::info('Excel file processed successfully', [
                'total_rows' => $highestRow,
                'compliance_tasks' => count($complianceData)
            ]);
            
            return $complianceData;
            
        } catch (\Exception $e) {
            Log::error('Error processing Excel file', [
                'error' => $e->getMessage(),
                'file' => $file->getClientOriginalName()
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Check if frequency is repetitive
     */
    private function isRepetitiveFrequency($frequency)
    {
        if (empty($frequency)) {
            return false;
        }
        
        $frequency = strtolower(trim($frequency));
        
        $repetitivePatterns = [
            'annual',
            'yearly',
            'monthly',
            'quarterly',
            'weekly',
            'daily',
            'every',
            'at least every'
        ];
        
        foreach ($repetitivePatterns as $pattern) {
            if (str_contains($frequency, $pattern)) {
                return true;
            }
        }
        
        // Check for patterns like "every X years", "X years", etc.
        if (preg_match('/(\d+)\s*year/', $frequency)) {
            return true;
        }
        
        if (preg_match('/(\d+)\s*day/', $frequency)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Generate calendar events based on frequency and due date
     */
    public function generateCalendarEvents($complianceData, $year = 2025)
    {
        $events = [];
        
        foreach ($complianceData as $task) {
            $dueDate = $this->parseDueDate($task['due_date']);
            
            if ($dueDate) {
                $recurringDates = $this->calculateRecurringDates($dueDate, $task['frequency'], $year);
                
                foreach ($recurringDates as $date) {
                    // Handle weekend events - move to weekday
                    $adjustedDate = $this->adjustWeekendDate($date);
                    
                    $events[] = [
                        'date' => $adjustedDate->format('Y-m-d'),
                        'topic' => $task['topic'],
                        'site' => $task['site'],
                        'activity' => $task['activity'],
                        'frequency' => $task['frequency'],
                        'original_due_date' => $task['due_date']
                    ];
                }
            } else {
                // Debug: log when date parsing fails
                \Illuminate\Support\Facades\Log::warning("Failed to parse due date", [
                    'due_date' => $task['due_date'],
                    'task' => $task['topic']
                ]);
            }
        }
        
        // Debug: log total events generated
        \Illuminate\Support\Facades\Log::info("Generated calendar events", [
            'total_events' => count($events),
            'year' => $year
        ]);
        
        return $events;
    }

    /**
     * Adjust weekend dates to weekdays according to rules
     */
    private function adjustWeekendDate($date)
    {
        $dayOfWeek = $date->format('N'); // 6 = Saturday, 7 = Sunday
        
        if ($dayOfWeek < 6) {
            // Already a weekday, return as is
            return $date;
        }
        
        // It's a weekend, need to adjust
        $adjustedDate = clone $date;
        
        if ($dayOfWeek == 6) { // Saturday
            // Move to next Monday (2 days ahead)
            $adjustedDate->modify('+2 days');
            
            // Check if this moves us to next month
            if ($adjustedDate->format('m') != $date->format('m')) {
                // Move to previous Friday instead
                $adjustedDate = clone $date;
                $adjustedDate->modify('-1 day');
            }
        } else { // Sunday
            // Move to next Monday (1 day ahead)
            $adjustedDate->modify('+1 day');
            
            // Check if this moves us to next month
            if ($adjustedDate->format('m') != $date->format('m')) {
                // Move to previous Friday instead
                $adjustedDate = clone $date;
                $adjustedDate->modify('-2 days');
            }
        }
        
        return $adjustedDate;
    }

    /**
     * Calculate recurring dates based on frequency
     */
    private function calculateRecurringDates($startDate, $frequency, $year)
    {
        $dates = [];
        $frequency = strtolower(trim($frequency));
        
        // Debug: log what we're processing
        \Illuminate\Support\Facades\Log::info("Calculating recurring dates", [
            'start_date' => $startDate->format('Y-m-d'),
            'frequency' => $frequency,
            'year' => $year
        ]);
        
        if (str_contains($frequency, 'annual') || str_contains($frequency, 'yearly')) {
            // Annual - add to every year from start year to 2030
            $startYear = max($year, $startDate->format('Y'));
            for ($y = $startYear; $y <= 2030; $y++) {
                $newDate = new \DateTime("{$y}-" . $startDate->format('m-d'));
                if ($newDate->format('Y') == $y) { // Ensure date is valid
                    $dates[] = $newDate;
                }
            }
        } elseif (str_contains($frequency, 'monthly')) {
            // Monthly - add to every month in the year
            $startMonth = $startDate->format('m');
            $startDay = $startDate->format('d');
            
            for ($m = 1; $m <= 12; $m++) {
                $monthStr = str_pad($m, 2, '0', STR_PAD_LEFT);
                $newDate = new \DateTime("{$year}-{$monthStr}-{$startDay}");
                
                // Check if date is valid (e.g., Feb 30 doesn't exist)
                if ($newDate->format('m') == $monthStr) {
                    $dates[] = $newDate;
                }
            }
        } elseif (str_contains($frequency, 'quarterly')) {
            // Quarterly - add every 3 months starting from start month
            $startMonth = $startDate->format('m');
            $startDay = $startDate->format('d');
            
            // Determine quarter start months
            $quarterMonths = [];
            if ($startMonth <= 3) {
                $quarterMonths = [1, 4, 7, 10]; // Q1, Q2, Q3, Q4
            } elseif ($startMonth <= 6) {
                $quarterMonths = [4, 7, 10, 1]; // Q2, Q3, Q4, Q1
            } elseif ($startMonth <= 9) {
                $quarterMonths = [7, 10, 1, 4]; // Q3, Q4, Q1, Q2
            } else {
                $quarterMonths = [10, 1, 4, 7]; // Q4, Q1, Q2, Q3
            }
            
            foreach ($quarterMonths as $month) {
                $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
                $newDate = new \DateTime("{$year}-{$monthStr}-{$startDay}");
                
                // Check if date is valid
                if ($newDate->format('m') == $monthStr) {
                    $dates[] = $newDate;
                }
            }
        } elseif (preg_match('/(\d+)\s*year/', $frequency, $matches)) {
            // Every X years
            $years = (int) $matches[1];
            $startYear = max($year, $startDate->format('Y'));
            
            for ($y = $startYear; $y <= 2030; $y += $years) {
                $newDate = new \DateTime("{$y}-" . $startDate->format('m-d'));
                if ($newDate->format('Y') == $y) {
                    $dates[] = $newDate;
                }
            }
        } elseif (preg_match('/(\d+)\s*day/', $frequency, $matches)) {
            // Every X days
            $days = (int) $matches[1];
            $currentDate = clone $startDate;
            
            // Generate dates for the year
            for ($i = 0; $i < 365; $i += $days) {
                $newDate = clone $currentDate;
                $newDate->modify("+{$i} days");
                
                if ($newDate->format('Y') == $year) {
                    $dates[] = $newDate;
                }
            }
        } else {
            // Default: just add the original date if it's in the target year
            if ($startDate->format('Y') == $year) {
                $dates[] = clone $startDate;
            }
        }
        
        // Debug: log what dates were generated
        \Illuminate\Support\Facades\Log::info("Generated recurring dates", [
            'frequency' => $frequency,
            'dates_count' => count($dates),
            'sample_dates' => array_slice(array_map(function($date) { return $date->format('Y-m-d'); }, $dates), 0, 5)
        ]);
        
        return $dates;
    }
    
    /**
     * Parse due date from various formats
     */
    private function parseDueDate($dueDate)
    {
        if (empty($dueDate)) {
            return null;
        }
        
        // Try to parse as date
        if (is_numeric($dueDate)) {
            // Excel date serial number
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($dueDate);
        }
        
        // Try common formats in order of likelihood
        $formats = ['m/d/Y', 'd/m/Y', 'Y-m-d', 'd-m-Y', 'm-d-Y'];
        foreach ($formats as $format) {
            $parsed = \DateTime::createFromFormat($format, $dueDate);
            if ($parsed) {
                return $parsed;
            }
        }
        
        // If all else fails, try to parse as Y-m-d
        $parsed = \DateTime::createFromFormat('Y-m-d', $dueDate);
        if ($parsed) {
            return $parsed;
        }
        
        return null;
    }
    
    /**
     * Generate calendar-based export in Master file format
     */
    public function generateCalendarExport($tolucaData, $year = 2025)
    {
        $calendarData = [];
        
        // Create calendar structure for the entire year
        $startDate = new \DateTime("{$year}-01-01");
        $endDate = new \DateTime("{$year}-12-31");
        
        // Generate all dates for the year
        $currentDate = clone $startDate;
        $allDates = [];
        
        while ($currentDate <= $endDate) {
            $allDates[] = clone $currentDate;
            $currentDate->modify('+1 day');
        }
        
        // Group dates by week
        $weeks = [];
        $currentWeek = [];
        
        foreach ($allDates as $date) {
            $currentWeek[] = $date;
            
            if ($date->format('N') == 7) { // Sunday
                $weeks[] = $currentWeek;
                $currentWeek = [];
            }
        }
        
        // Add remaining days to last week
        if (!empty($currentWeek)) {
            $weeks[] = $currentWeek;
        }
        
        // Create header row with dates
        $headerRow = ['Task ID', 'Task Name', 'Site', 'Activity', 'Frequency', 'Original Due Date'];
        foreach ($weeks as $weekIndex => $week) {
            foreach ($week as $date) {
                $headerRow[] = $date->format('m/d/Y');
            }
        }
        $calendarData[] = $headerRow;
        
        // Process each compliance task
        foreach ($tolucaData as $taskIndex => $task) {
            $taskRow = [
                $taskIndex + 1, // Task ID
                $task['topic'] ?? 'N/A', // Task Name
                $task['site'] ?? 'N/A', // Site
                $task['activity'] ?? 'N/A', // Activity
                $task['frequency'] ?? 'N/A', // Frequency
                $task['due_date'] ?? 'N/A' // Original Due Date
            ];
            
            // Generate calendar events for this task
            $taskEvents = $this->generateCalendarEvents([$task], $year);
            
            // Fill calendar cells for each week
            foreach ($weeks as $week) {
                foreach ($week as $date) {
                    $dateStr = $date->format('Y-m-d');
                    $hasEvent = false;
                    $eventDetails = '';
                    
                    // Check if this date has an event for this task
                    foreach ($taskEvents as $event) {
                        if ($event['date'] === $dateStr) {
                            $hasEvent = true;
                            $eventDetails = $task['topic'] ?? 'Task';
                            break;
                        }
                    }
                    
                    $taskRow[] = $hasEvent ? $eventDetails : '';
                }
            }
            
            $calendarData[] = $taskRow;
        }
        
        return $calendarData;
    }
    
    /**
     * Export data to Excel in Master format
     */
    public function exportToExcel($calendarData, $filename = 'compliance_calendar.xlsx')
    {
        try {
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            
            // Create the main calendar sheet
            $worksheet = $spreadsheet->getActiveSheet();
            $worksheet->setTitle('Toluca 2025');
            
            // Add data to worksheet
            foreach ($calendarData as $rowIndex => $row) {
                foreach ($row as $colIndex => $value) {
                    $cellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1) . ($rowIndex + 1);
                    $worksheet->setCellValue($cellAddress, $value);
                }
            }
            
            // Auto-size columns
            foreach (range(1, count($calendarData[0])) as $column) {
                $worksheet->getColumnDimension(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($column))->setAutoSize(true);
            }
            
            // Create writer and save
            $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
            
            // Save to temporary file
            $tempPath = storage_path('app/temp/' . $filename);
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            
            $writer->save($tempPath);
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error('Error exporting to Excel', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Export data to Excel in exact Master file format
     */
    public function exportToExcelMasterFormat($tolucaData, $filename = 'master_calendar_export.xlsx')
    {
        try {
            Log::info('Starting Excel export', [
                'toluca_data_count' => count($tolucaData),
                'filename' => $filename
            ]);
            
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            
            // Create 6 sheets for years 2025-2030
            $years = [2025, 2026, 2027, 2028, 2029, 2030];
            
            foreach ($years as $yearIndex => $year) {
                if ($yearIndex === 0) {
                    $worksheet = $spreadsheet->getActiveSheet();
                } else {
                    $worksheet = $spreadsheet->createSheet();
                }
                
                $worksheet->setTitle("Toluca {$year}");
                
                Log::info("Setting up worksheet for year {$year}");
                
                // Set up the calendar structure for this year
                $this->setupMasterFormatWorksheet($worksheet, $tolucaData, $year);
            }
            
            // Set first sheet as active
            $spreadsheet->setActiveSheetIndex(0);
            
            Log::info('Creating Excel writer');
            
            // Create writer and save
            $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
            
            // Save to temporary file
            $tempPath = storage_path('app/temp/' . $filename);
            Log::info('Saving to temp path', ['temp_path' => $tempPath]);
            
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            
            $writer->save($tempPath);
            
            Log::info('Excel file saved successfully', ['temp_path' => $tempPath]);
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error('Error exporting to Excel Master format', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Setup worksheet in Master file format for a specific year
     */
    private function setupMasterFormatWorksheet($worksheet, $tolucaData, $year)
    {
        // Set column widths for task table
        $worksheet->getColumnDimension('A')->setWidth(15); // Task ID
        $worksheet->getColumnDimension('B')->setWidth(30); // Task Name
        $worksheet->getColumnDimension('C')->setWidth(20); // Site
        $worksheet->getColumnDimension('D')->setWidth(25); // Activity
        $worksheet->getColumnDimension('E')->setWidth(20); // Frequency
        $worksheet->getColumnDimension('F')->setWidth(20); // Original Due Date
        
        // Set calendar column widths (A for month, B-H for days of week)
        $worksheet->getColumnDimension('A')->setWidth(15); // Month names
        $worksheet->getColumnDimension('B')->setWidth(15); // Sunday
        $worksheet->getColumnDimension('C')->setWidth(15); // Monday
        $worksheet->getColumnDimension('D')->setWidth(15); // Tuesday
        $worksheet->getColumnDimension('E')->setWidth(15); // Wednesday
        $worksheet->getColumnDimension('F')->setWidth(15); // Thursday
        $worksheet->getColumnDimension('G')->setWidth(15); // Friday
        $worksheet->getColumnDimension('H')->setWidth(15); // Saturday
        
        // Create calendar grid for each month (vertical layout)
        $this->createCalendarGrid($worksheet, $tolucaData, $year);
        
        // Add borders and styling
        $this->styleCalendarWorksheet($worksheet, $tolucaData);
        
        // Set row heights for calendar rows
        $this->setCalendarRowHeights($worksheet, 3);
    }



    /**
     * Create calendar grid with dates and events
     */
    private function createCalendarGrid($worksheet, $tolucaData, $year)
    {
        $months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        $currentRow = 1; // Start with task table headers
        
        // Add task information table
        $this->addTaskInfoTable($worksheet, $tolucaData, $currentRow);
        
        // Add empty space after task table
        $currentRow += count($tolucaData) + 2; // +2 for header and empty space
        
        // Create calendar grid for each month (vertical layout)
        foreach ($months as $monthIndex => $month) {
            $currentRow = $this->createMonthCalendarVertical($worksheet, $monthIndex, $month, $tolucaData, $currentRow, $year);
        }
    }

    /**
     * Add task information table
     */
    private function addTaskInfoTable($worksheet, $tolucaData, $startRow)
    {
        $taskHeaders = ['Task ID', 'Task Name', 'Site', 'Activity', 'Frequency', 'Original Due Date'];
        
        // Write task headers
        foreach ($taskHeaders as $colIndex => $header) {
            $cellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1) . $startRow;
            $worksheet->setCellValue($cellAddress, $header);
            
            // Style task headers
            $worksheet->getStyle($cellAddress)->getFont()->setBold(true);
            $worksheet->getStyle($cellAddress)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $worksheet->getStyle($cellAddress)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
            $worksheet->getStyle($cellAddress)->getFill()->getStartColor()->setRGB('E6E6FA');
        }
        
        // Write task data
        $rowIndex = $startRow + 1;
        foreach ($tolucaData as $taskIndex => $task) {
            $worksheet->setCellValue('A' . $rowIndex, $taskIndex + 1);
            $worksheet->setCellValue('B' . $rowIndex, $task['topic'] ?? 'N/A');
            $worksheet->setCellValue('C' . $rowIndex, $task['site'] ?? 'N/A');
            $worksheet->setCellValue('D' . $rowIndex, $task['activity'] ?? 'N/A');
            $worksheet->setCellValue('E' . $rowIndex, $task['frequency'] ?? 'N/A');
            $worksheet->setCellValue('F' . $rowIndex, $task['due_date'] ?? 'N/A');
            
            // Style task info
            $worksheet->getStyle('A' . $rowIndex . ':F' . $rowIndex)->getFont()->setBold(true);
            $worksheet->getStyle('A' . $rowIndex . ':F' . $rowIndex)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
            $worksheet->getStyle('A' . $rowIndex . ':F' . $rowIndex)->getFill()->getStartColor()->setRGB('F0F8FF');
            
            $rowIndex++;
        }
    }

    /**
     * Create calendar grid for a specific month (vertical layout)
     */
    private function createMonthCalendarVertical($worksheet, $monthIndex, $month, $tolucaData, $startRow, $year)
    {
        // Add empty space before month
        $currentRow = $startRow + 1;
        
        // Add month header in column A
        $worksheet->setCellValue('A' . $currentRow, $month);
        $worksheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $worksheet->getStyle('A' . $currentRow)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
        $worksheet->getStyle('A' . $currentRow)->getFill()->getStartColor()->setRGB('E6E6FA');
        
        $currentRow++;
        
        // Add day headers (Sun, Mon, Tue, etc.)
        $daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        foreach ($daysOfWeek as $dayIndex => $day) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($dayIndex + 2); // Start from column B
            $worksheet->setCellValue($colLetter . $currentRow, $day);
            $worksheet->getStyle($colLetter . $currentRow)->getFont()->setBold(true);
            $worksheet->getStyle($colLetter . $currentRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }
        
        $currentRow++;
        
        // Get first day of month and number of days
        $firstDay = new \DateTime("{$year}-" . str_pad($monthIndex + 1, 2, '0', STR_PAD_LEFT) . "-01");
        $lastDay = new \DateTime("{$year}-" . str_pad($monthIndex + 1, 2, '0', STR_PAD_LEFT) . "-" . $firstDay->format('t'));
        $daysInMonth = $lastDay->format('t');
        $firstDayOfWeek = $firstDay->format('w'); // 0 = Sunday, 1 = Monday, etc.
        
        // Fill calendar grid with dates
        $currentDate = 1;
        $currentRow = $currentRow;
        
        while ($currentDate <= $daysInMonth) {
            // Fill week
            for ($dayOfWeek = 0; $dayOfWeek < 7 && $currentDate <= $daysInMonth; $dayOfWeek++) {
                if ($currentDate == 1 && $dayOfWeek < $firstDayOfWeek) {
                    // Empty cell before first day of month
                    continue;
                }
                
                // Calculate the correct column for this day of week (start from column B)
                $currentCol = $dayOfWeek + 2; // Column B = 2
                $cellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($currentCol) . $currentRow;
                
                // Set the date
                $worksheet->setCellValue($cellAddress, $currentDate);
                
                // Check if this date has events and add them in the row below
                $dateStr = "{$year}-" . str_pad($monthIndex + 1, 2, '0', STR_PAD_LEFT) . "-" . str_pad($currentDate, 2, '0', STR_PAD_LEFT);
                $this->markEventsOnDateVertical($worksheet, $cellAddress, $dateStr, $tolucaData, $year);
                
                $currentDate++;
            }
            
            $currentRow++;
        }
        
        return $currentRow;
    }

    /**
     * Mark events on a specific date (vertical layout - events go in row below date)
     */
    private function markEventsOnDateVertical($worksheet, $cellAddress, $dateStr, $tolucaData, $year)
    {
        $eventsForDate = [];
        
        foreach ($tolucaData as $task) {
            $taskEvents = $this->generateCalendarEvents([$task], $year);
            $eventDates = array_column($taskEvents, 'date');
            
            if (in_array($dateStr, $eventDates)) {
                // Format: <frequency> (<due date>): <topic>: <activity>
                $frequency = $task['frequency'] ?? 'N/A';
                $dueDate = $task['due_date'] ?? 'N/A';
                $topic = $task['topic'] ?? 'N/A';
                $activity = $task['activity'] ?? 'N/A';
                
                $eventText = "{$frequency} ({$dueDate}):\n{$topic}: {$activity}";
                $eventsForDate[] = $eventText;
            }
        }
        
        if (!empty($eventsForDate)) {
            // Parse the cell address manually to avoid PhpSpreadsheet issues
            preg_match('/([A-Z]+)(\d+)/', $cellAddress, $matches);
            if (count($matches) >= 3) {
                $colLetter = $matches[1];
                $row = (int) $matches[2];
                
                // Create event cell address (same column, row below)
                $eventCellAddress = $colLetter . ($row + 1);
            } else {
                // Fallback: skip event placement if we can't parse the address
                return;
            }
            
            // Combine all events for this date
            $combinedEvents = implode("\n\n", $eventsForDate);
            
            // Set the event details in the row below the date
            $worksheet->setCellValue($eventCellAddress, $combinedEvents);
            
            // Style the event cell
            $worksheet->getStyle($eventCellAddress)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
            $worksheet->getStyle($eventCellAddress)->getFill()->getStartColor()->setRGB('90EE90');
            $worksheet->getStyle($eventCellAddress)->getFont()->setBold(true);
            $worksheet->getStyle($eventCellAddress)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT);
            $worksheet->getStyle($eventCellAddress)->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP);
            $worksheet->getStyle($eventCellAddress)->getAlignment()->setWrapText(true);
            
            // Adjust row height to accommodate text
            $worksheet->getRowDimension($row + 1)->setRowHeight(60);
        }
    }

    /**
     * Style the calendar worksheet
     */
    private function styleCalendarWorksheet($worksheet, $tolucaData)
    {
        // Add borders to task table
        $taskTableEndRow = count($tolucaData) + 1; // +1 for header
        $worksheet->getStyle('A1:F' . $taskTableEndRow)->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
        
        // Add borders to calendar grid (columns A-H for month and days)
        $lastRow = $worksheet->getHighestRow();
        $worksheet->getStyle('A1:H' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
        
        // Freeze panes for easy navigation
        $worksheet->freezePane('A1');
    }

    /**
     * Set row heights for calendar rows
     */
    private function setCalendarRowHeights($worksheet, $startRow)
    {
        // Set row height for task info header
        $worksheet->getRowDimension(1)->setRowHeight(30);
        
        // Set row heights for task data rows
        for ($row = 2; $row <= 10; $row++) { // Assume max 10 tasks
            $worksheet->getRowDimension($row)->setRowHeight(25);
        }
        
        // Set row heights for calendar grid rows (dynamic based on content)
        $lastRow = $worksheet->getHighestRow();
        for ($row = 11; $row <= $lastRow; $row++) {
            $worksheet->getRowDimension($row)->setRowHeight(30); // Default height for calendar rows
        }
    }
    
    /**
     * Export data to CSV in Master format
     */
    public function exportToCsv($calendarData, $filename = 'compliance_calendar.csv')
    {
        try {
            $tempPath = storage_path('app/temp/' . $filename);
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            
            $file = fopen($tempPath, 'w');
            
            foreach ($calendarData as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error('Error exporting to CSV', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Export data to CSV in exact Master file format
     */
    public function exportToCsvMasterFormat($tolucaData, $filename = 'master_calendar_export.csv')
    {
        try {
            $tempPath = storage_path('app/temp/' . $filename);
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            
            $file = fopen($tempPath, 'w');
            
            // Create calendar headers
            $this->writeCalendarCsvHeaders($file);
            
            // Write task information
            $this->writeTaskInfoCsv($file, $tolucaData);
            
            // Write calendar grid
            $this->writeCalendarGridCsv($file, $tolucaData);
            
            fclose($file);
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error('Error exporting to CSV Master format', [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Write calendar headers to CSV
     */
    private function writeCalendarCsvHeaders($file)
    {
        $months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        $daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Write month headers (each month spans 7 columns)
        $monthRow = array_fill(0, 6, ''); // First 6 columns are empty for task info
        foreach ($months as $monthIndex => $month) {
            for ($i = 0; $i < 7; $i++) {
                $monthRow[] = $month;
            }
        }
        fputcsv($file, $monthRow);
        
        // Write days of week headers
        $daysRow = array_fill(0, 6, ''); // First 6 columns are empty for task info
        foreach ($months as $monthIndex => $month) {
            foreach ($daysOfWeek as $day) {
                $daysRow[] = $day;
            }
        }
        fputcsv($file, $daysRow);
    }

    /**
     * Write task information to CSV
     */
    private function writeTaskInfoCsv($file, $tolucaData)
    {
        // Write task headers
        $taskHeaders = ['Task ID', 'Task Name', 'Site', 'Activity', 'Frequency', 'Original Due Date'];
        $headerRow = $taskHeaders;
        
        // Add empty cells for calendar columns
        for ($i = 0; $i < 84; $i++) { // 12 months * 7 columns
            $headerRow[] = '';
        }
        fputcsv($file, $headerRow);
        
        // Write task data
        foreach ($tolucaData as $taskIndex => $task) {
            $taskRow = [
                $taskIndex + 1, // Task ID
                $task['topic'] ?? 'N/A', // Task Name
                $task['site'] ?? 'N/A', // Site
                $task['activity'] ?? 'N/A', // Activity
                $task['frequency'] ?? 'N/A', // Frequency
                $task['due_date'] ?? 'N/A' // Original Due Date
            ];
            
            // Add empty cells for calendar columns
            for ($i = 0; $i < 84; $i++) {
                $taskRow[] = '';
            }
            fputcsv($file, $taskRow);
        }
    }

    /**
     * Write calendar grid to CSV
     */
    private function writeCalendarGridCsv($file, $tolucaData)
    {
        $months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Calculate how many rows we need for the calendar grid
        $maxRows = 6; // Maximum weeks in a month
        
        for ($week = 0; $week < $maxRows; $week++) {
            $weekRow = array_fill(0, 6, ''); // First 6 columns are empty for task info
            
            foreach ($months as $monthIndex => $month) {
                $weekRow = array_merge($weekRow, $this->getWeekDatesWithEvents($monthIndex, $week, $tolucaData));
            }
            
            fputcsv($file, $weekRow);
        }
    }

    /**
     * Get week dates for a specific month and week
     */
    private function getWeekDates($monthIndex, $week, $tolucaData)
    {
        $weekDates = [];
        
        // Get first day of month and number of days
        $firstDay = new \DateTime("2025-" . str_pad($monthIndex + 1, 2, '0', STR_PAD_LEFT) . "-01");
        $lastDay = new \DateTime("2025-" . str_pad($monthIndex + 1, 2, '0', STR_PAD_LEFT) . "-" . $firstDay->format('t'));
        $daysInMonth = $lastDay->format('t');
        $firstDayOfWeek = $firstDay->format('w'); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate starting date for this week
        $startDate = $week * 7 - $firstDayOfWeek + 1;
        
        for ($dayOfWeek = 0; $dayOfWeek < 7; $dayOfWeek++) {
            $currentDate = $startDate + $dayOfWeek;
            
            if ($currentDate < 1 || $currentDate > $daysInMonth) {
                $weekDates[] = ''; // Empty cell
            } else {
                $weekDates[] = $currentDate;
            }
        }
        
        return $weekDates;
    }

    /**
     * Get week dates with events for a specific month and week
     */
    private function getWeekDatesWithEvents($monthIndex, $week, $tolucaData)
    {
        $weekDates = [];
        
        // Get first day of month and number of days
        $firstDay = new \DateTime("2025-" . str_pad($monthIndex + 1, 2, '0', STR_PAD_LEFT) . "-01");
        $lastDay = new \DateTime("2025-" . str_pad($monthIndex + 1, 2, '0', STR_PAD_LEFT) . "-" . $firstDay->format('t'));
        $daysInMonth = $lastDay->format('t');
        $firstDayOfWeek = $firstDay->format('w'); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate starting date for this week
        $startDate = $week * 7 - $firstDayOfWeek + 1;
        
        for ($dayOfWeek = 0; $dayOfWeek < 7; $dayOfWeek++) {
            $currentDate = $startDate + $dayOfWeek;
            
            if ($currentDate < 1 || $currentDate > $daysInMonth) {
                $weekDates[] = ''; // Empty cell
            } else {
                // Check if this date has events
                $dateStr = "2025-" . str_pad($monthIndex + 1, 2, '0', STR_PAD_LEFT) . "-" . str_pad($currentDate, 2, '0', STR_PAD_LEFT);
                $eventsForDate = $this->getEventsForDate($dateStr, $tolucaData);
                
                if (!empty($eventsForDate)) {
                    $weekDates[] = $eventsForDate;
                } else {
                    $weekDates[] = $currentDate;
                }
            }
        }
        
        return $weekDates;
    }

    /**
     * Get events for a specific date in CSV format
     */
    private function getEventsForDate($dateStr, $tolucaData)
    {
        $eventsForDate = [];
        
        foreach ($tolucaData as $task) {
            $taskEvents = $this->generateCalendarEvents([$task], 2025);
            $eventDates = array_column($taskEvents, 'date');
            
            if (in_array($dateStr, $eventDates)) {
                // Format: <frequency> (<due date>): <topic>: <activity>
                $frequency = $task['frequency'] ?? 'N/A';
                $dueDate = $task['due_date'] ?? 'N/A';
                $topic = $task['topic'] ?? 'N/A';
                $activity = $task['activity'] ?? 'N/A';
                
                $eventText = "{$frequency} ({$dueDate}): {$topic}: {$activity}";
                $eventsForDate[] = $eventText;
            }
        }
        
        if (!empty($eventsForDate)) {
            return implode(' | ', $eventsForDate);
        }
        
        return '';
    }
}
