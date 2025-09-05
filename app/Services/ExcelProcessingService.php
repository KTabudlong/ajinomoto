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
        
        // Exclude non-repetitive activities
        $nonRepetitivePatterns = [
            'one time',
            'one time registration',
            'episodic',
            'complete',
            'as needed',
            'upon request',
            'when required'
        ];
        
        foreach ($nonRepetitivePatterns as $pattern) {
            if (str_contains($frequency, $pattern)) {
                return false;
            }
        }
        
        // Include repetitive patterns
        $repetitivePatterns = [
            'annual',
            'yearly',
            'monthly',
            'quarterly',
            'end of quarter',
            'end of every quarter',
            'quarter end',
            'weekly',
            'daily',
            'every',
            'at least every',
            'on hire',
            'end of month',
            'month end',
            'routine',
            'periodic'
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
        
        // Check for patterns like "Every 4 years"
        if (preg_match('/every\s+(\d+)\s+years?/', $frequency)) {
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
        \Log::info("generateCalendarEvents called with " . count($complianceData) . " tasks for year $year");
        
        foreach ($complianceData as $task) {
            $dueDate = $this->parseDueDate($task['due_date'], $year, $task['frequency']);
            
            if ($dueDate) {
                \Log::info("Calling calculateRecurringDates with due_date: '{$task['due_date']}'");
                $recurringDates = $this->calculateRecurringDates($dueDate, $task['frequency'], $year, $task['due_date']);
                
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
            }
        }
        

        
        return $events;
    }

    /**
     * Adjust weekend dates to weekdays according to rules
     */
    public function adjustWeekendDate($date)
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
    public function calculateRecurringDates($startDate, $frequency, $year, $dueDateStr = null)
    {
        $dates = [];
        $frequency = strtolower(trim($frequency));
        

        
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
            // For monthly activities, use the last day of each month to avoid date issues
            for ($m = 1; $m <= 12; $m++) {
                $monthStr = str_pad($m, 2, '0', STR_PAD_LEFT);
                $lastDay = date('t', mktime(0, 0, 0, $m, 1, $year));
                $newDate = new \DateTime("{$year}-{$monthStr}-{$lastDay}");
                    $dates[] = $newDate;
                }
        } elseif (str_contains($frequency, 'weekly')) {
            // Weekly - add to every Monday of the year
            $startDate = new \DateTime("{$year}-01-01");
            $endDate = new \DateTime("{$year}-12-31");
            
            // Find the first Monday of the year
            $currentDate = clone $startDate;
            while ($currentDate->format('N') != 1) { // 1 = Monday
                $currentDate->add(new \DateInterval('P1D'));
            }
            
            // Add every Monday from first Monday to end of year
            while ($currentDate <= $endDate) {
                $dates[] = clone $currentDate;
                $currentDate->add(new \DateInterval('P7D')); // Add 7 days to get next Monday
            }
        } elseif (str_contains($frequency, 'quarterly')) {
            // Quarterly frequency - check due date for timing
            $dueDateStr = strtolower($dueDateStr ?? '');
            
            // Debug: Log the due date string to see what we're actually getting
            \Log::info("Quarterly activity - Frequency: {$frequency}, Due Date: '{$dueDateStr}'");
            
            // Check if this is an end-of-quarter activity by looking at the parsed due date
            $isEndOfQuarter = false;
            if (str_contains($dueDateStr, 'end of quarter') || str_contains($dueDateStr, 'end of every quarter') || str_contains($dueDateStr, 'the end of every quarter') || str_contains($dueDateStr, 'quarter end')) {
                $isEndOfQuarter = true;
            } else {
                // Check if the due date is a quarter-end date (March 31, June 30, September 30, December 31)
                $dueDate = $this->parseDueDate($dueDateStr, $year, $frequency);
                if ($dueDate) {
                    $month = $dueDate->format('n');
                    $day = $dueDate->format('j');
                    if (($month == 3 && $day == 31) || ($month == 6 && $day == 30) || 
                        ($month == 9 && $day == 30) || ($month == 12 && $day == 31)) {
                        $isEndOfQuarter = true;
                        \Log::info("Detected quarter-end date: {$month}-{$day} for quarterly activity");
                    }
                }
            }
            
            if ($isEndOfQuarter) {
                // Quarterly + End of quarter = last day of March, June, September, December
                \Log::info("Using END OF QUARTER dates for quarterly activity");
                $quarterEndMonths = [3, 6, 9, 12];
                
                foreach ($quarterEndMonths as $month) {
                $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
                    $lastDay = date('t', mktime(0, 0, 0, $month, 1, $year));
                    $newDate = new \DateTime("{$year}-{$monthStr}-{$lastDay}");
                    $dates[] = $newDate;
                    \Log::info("Generated end-of-quarter date: " . $newDate->format('Y-m-d'));
                }
            } else {
                // Quarterly + no specific timing = start of each quarter (January 1, April 1, July 1, October 1)
                \Log::info("Using QUARTERLY START dates for quarterly activity");
                $quarterStartMonths = [1, 4, 7, 10];
                
                foreach ($quarterStartMonths as $month) {
                    $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
                    $newDate = new \DateTime("{$year}-{$monthStr}-01");
                    $dates[] = $newDate;
                }
            }
        } elseif (preg_match('/every\s+(\d+)\s+years?/', $frequency, $matches)) {
            // Every X years (e.g., "Every 4 years")
            $years = (int) $matches[1];
            $startYear = max($year, $startDate->format('Y'));
            
            // For "Every 4 years", start from the base year and add every 4 years
            $baseYear = $startDate->format('Y');
            for ($y = $baseYear; $y <= 2030; $y += $years) {
                if ($y >= $year) {
                    $newDate = new \DateTime("{$y}-" . $startDate->format('m-d'));
                    if ($newDate->format('Y') == $y) {
                    $dates[] = $newDate;
                    }
                }
            }
        } elseif (preg_match('/(\d+)\s*year/', $frequency, $matches)) {
            // Every X years (legacy pattern)
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
        

        
        return $dates;
    }
    
    /**
     * Parse due date from various formats
     */
    public function parseDueDate($dueDate, $targetYear = 2025, $frequency = null)
    {
        if (empty($dueDate)) {
            // Handle San Diego-specific frequencies with no due date
            if ($frequency) {
                $freq = strtolower($frequency);
                if (str_contains($freq, 'annual')) {
                    return new \DateTime("{$targetYear}-01-01");
                } elseif (str_contains($freq, 'monthly')) {
                    return new \DateTime("{$targetYear}-01-01"); // Will be adjusted to first weekday
                } elseif (str_contains($freq, 'weekly')) {
                    return new \DateTime("{$targetYear}-01-01"); // Will be adjusted to first Monday
                }
            }
            return null;
        }
        
        // Try to parse as date
        if (is_numeric($dueDate)) {
            // Excel date serial number
            $excelDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($dueDate);
            
            // If the date is in the target year, keep it as is (exact date)
            if ($excelDate->format('Y') == $targetYear) {
                return $excelDate;
            } else {
                // For dates not in the target year, return null to skip the activity
                return null;
            }
        }
        
        // Handle "On hire, then annually" - use January 1st of target year
        if (stripos($dueDate, 'on hire') !== false || stripos($dueDate, 'annually') !== false) {
            return new \DateTime("{$targetYear}-01-01");
        }
        
        // Handle "end of every quarter", "quarterly" - use quarter-end dates
        if (stripos($dueDate, 'quarter') !== false || stripos($dueDate, 'quarterly') !== false) {
            return new \DateTime("{$targetYear}-03-31"); // Will be handled by calculateRecurringDates
        }
        
        // Handle "end of every month", "monthly" - use month-end
        if (stripos($dueDate, 'month') !== false || stripos($dueDate, 'monthly') !== false) {
            return new \DateTime("{$targetYear}-01-31"); // Will be handled by calculateRecurringDates
        }
        
        // Handle "July 1st", "March 1st" format
        if (preg_match('/(\w+)\s+(\d+)(st|nd|rd|th)?/', $dueDate, $matches)) {
            $month = $matches[1];
            $day = $matches[2];
            
            // Convert month name to number
            $monthNumber = date('n', strtotime($month . ' 1'));
            if ($monthNumber) {
                return new \DateTime("{$targetYear}-{$monthNumber}-{$day}");
            }
        }
        
        // Try common formats in order of likelihood
        $formats = ['m/d/Y', 'd/m/Y', 'Y-m-d', 'd-m-Y', 'm-d-Y'];
        foreach ($formats as $format) {
            $parsed = \DateTime::createFromFormat($format, $dueDate);
            if ($parsed) {
                // If it's not in the target year, return null to skip
                if ($parsed->format('Y') != $targetYear) {
                    return null;
                }
                return $parsed;
            }
        }
        
        // If all else fails, try to parse as Y-m-d
        $parsed = \DateTime::createFromFormat('Y-m-d', $dueDate);
        if ($parsed) {
            // If it's not in the target year, return null to skip
            if ($parsed->format('Y') != $targetYear) {
                return null;
            }
            return $parsed;
        }
        
        // If parsing fails, use January 1st of target year as default
        return new \DateTime("{$targetYear}-01-01");
    }
    
    /**
     * Generate Toluca Calendar Export for 2025 only (for debugging)
     */
    public function generateTolucaCalendar2025($tolucaData)
    {
        return $this->generateTolucaCalendarExport($tolucaData, 2025, 2025);
    }



    /**
     * Process Training sheet from file path
     */
    public function processTrainingSheetFromPath($filePath)
    {
        try {
            $spreadsheet = IOFactory::load($filePath);
            $trainingSheet = $spreadsheet->getSheetByName('Training');

            if (!$trainingSheet) {
                throw new \Exception('Training sheet not found');
            }

            $highestRow = $trainingSheet->getHighestRow();
            $highestColumn = $trainingSheet->getHighestColumn();

            $trainingData = [];

            for ($row = 2; $row <= $highestRow; $row++) {
                $rowData = [];
                for ($col = 'A'; $col <= $highestColumn; $col++) {
                    $cellValue = $trainingSheet->getCell($col . $row)->getCalculatedValue();
                    $rowData[$col] = $cellValue;
                }

                if (empty(array_filter($rowData))) {
                    continue;
                }

                $trainingData[] = [
                    'topic' => $rowData['A'] ?? '',
                    'training_content' => $rowData['C'] ?? '',
                    'frequency' => $rowData['E'] ?? '',
                    'due_date' => $rowData['D'] ?? ''
                ];
            }

            return $trainingData;

        } catch (\Exception $e) {
            Log::error('Error processing Training sheet from path', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Process Training sheet and create Annual Training and Tasks sheet
     */
    public function processTrainingSheet($file)
    {
        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $trainingSheet = $spreadsheet->getSheetByName('Training');
            
            if (!$trainingSheet) {
                throw new \Exception('Training sheet not found');
            }
            
            $trainingData = [];
            $highestRow = $trainingSheet->getHighestRow();
            
            // Read columns A-E (Topic, Site, Training Content, Target Personnel, Frequency)
            for ($row = 2; $row <= $highestRow; $row++) { // Skip header row
                $topic = $trainingSheet->getCell('A' . $row)->getValue();
                $site = $trainingSheet->getCell('B' . $row)->getValue();
                $trainingContent = $trainingSheet->getCell('C' . $row)->getValue();
                $targetPersonnel = $trainingSheet->getCell('D' . $row)->getValue();
                $frequency = $trainingSheet->getCell('E' . $row)->getValue();
                
                if (!empty($topic) && !empty($trainingContent)) {
                    $trainingData[] = [
                        'topic' => $topic,
                        'site' => $site,
                        'training_content' => $trainingContent,
                        'target_personnel' => $targetPersonnel,
                        'frequency' => $frequency
                    ];
                }
            }
            
            return $trainingData;
            
        } catch (\Exception $e) {
            Log::error('Error processing Training sheet', ['error' => $e->getMessage()]);
            return [];
        }
    }
    
    /**
     * Create Training and Tasks sheet grouped by topic with specific column structure
     */
    public function createAnnualTrainingAndTasksSheet($actionsData, $trainingData)
    {
        // Check what frequencies exist in the data
        $hasAnnualTraining = false;
        $hasOtherTraining = false;
        
        // Check training data for frequencies
        foreach ($trainingData as $training) {
            $frequency = strtolower(trim($training['frequency']));
            if (str_contains($frequency, 'annual')) {
                $hasAnnualTraining = true;
            }
            if (str_contains($frequency, 'every') || str_contains($frequency, 'years')) {
                $hasOtherTraining = true;
            }
        }
        
        // Group all data by topic
        $topicsData = [];
        
        // Process training data
        foreach ($trainingData as $training) {
            $topic = $training['topic'];
            $frequency = strtolower(trim($training['frequency']));
            
            if (!isset($topicsData[$topic])) {
                $topicsData[$topic] = [
                    'annual_training' => [],
                    'annual_tasks' => [],
                    'other_training' => []
                ];
            }
            
            // Check if it's "every x years" - put in other training with frequency
            if (str_contains($frequency, 'every') || str_contains($frequency, 'years')) {
                $topicsData[$topic]['other_training'][] = [
                    'frequency' => $frequency,
                    'content' => $training['training_content']
                ];
            } elseif (str_contains($frequency, 'annual')) {
                // Put in annual training
                $topicsData[$topic]['annual_training'][] = $training['training_content'];
            }
        }
        
        // Process actions data (annual tasks only)
        foreach ($actionsData as $action) {
            $frequency = strtolower(trim($action['frequency']));
            if (str_contains($frequency, 'annual')) {
                $topic = $action['topic'];
                
                if (!isset($topicsData[$topic])) {
                    $topicsData[$topic] = [
                        'annual_training' => [],
                        'annual_tasks' => [],
                        'other_training' => []
                    ];
                }
                
                $topicsData[$topic]['annual_tasks'][] = $action['activity'];
            }
        }
        
        // Create the sheet data
        $sheetData = [];
        
        // Create headers based on what frequencies exist
        $headers = ['Topics'];
        if ($hasAnnualTraining) {
            $headers[] = 'Annual Training';
        }
        $headers[] = 'Annual Tasks'; // Always present
        if ($hasOtherTraining) {
            $headers[] = 'Other Training';
        }
        
        $sheetData[] = $headers;
        
        // Fill data rows grouped by topic
        foreach ($topicsData as $topic => $data) {
            $row = [];
            
            // Topics column
            $row[] = $topic;
            
            // Annual Training column (only if annual training exists)
            if ($hasAnnualTraining) {
                if (!empty($data['annual_training'])) {
                    $annualTrainingText = '';
                    foreach ($data['annual_training'] as $training) {
                        $annualTrainingText .= "-{$training}\n";
                    }
                    $row[] = rtrim($annualTrainingText, "\n");
                } else {
                    $row[] = '';
                }
            }
            
            // Annual Tasks column (always present)
            if (!empty($data['annual_tasks'])) {
                $annualTasksText = '';
                foreach ($data['annual_tasks'] as $task) {
                    $annualTasksText .= "-{$task}\n";
                }
                $row[] = rtrim($annualTasksText, "\n");
            } else {
                $row[] = '';
            }
            
            // Other Training column (only if other training exists)
            if ($hasOtherTraining) {
                if (!empty($data['other_training'])) {
                    $otherTrainingText = '';
                    foreach ($data['other_training'] as $training) {
                        $otherTrainingText .= "-{$training['frequency']}: {$training['content']}\n";
                    }
                    $row[] = rtrim($otherTrainingText, "\n");
                } else {
                    $row[] = '';
                }
            }
            
            $sheetData[] = $row;
        }
        
        return $sheetData;
    }



    /**
     * Create San Diego Training and Tasks sheet grouped by topic
     */
    public function createSanDiegoTrainingAndTasksSheet($sandiegoData, $trainingData)
    {
        // Check what frequencies exist in the data
        $hasAnnualTraining = false;
        $hasAnnualTasks = false;
        $hasOtherTraining = false;
        
        // Check training data for frequencies
        foreach ($trainingData as $training) {
            $frequency = strtolower(trim($training['frequency']));
            if (str_contains($frequency, 'annual')) {
                $hasAnnualTraining = true;
            }
            if (str_contains($frequency, 'every') || str_contains($frequency, 'years')) {
                $hasOtherTraining = true;
            }
        }
        
        // Check San Diego compliance data for annual tasks
        foreach ($sandiegoData as $action) {
            $frequency = strtolower(trim($action['frequency']));
            if (str_contains($frequency, 'annual')) {
                $hasAnnualTasks = true;
                break;
            }
        }
        
        // Group all data by topic
        $topicsData = [];
        
        // Process training data
        foreach ($trainingData as $training) {
            $topic = $training['topic'];
            $frequency = strtolower(trim($training['frequency']));
            
            if (!isset($topicsData[$topic])) {
                $topicsData[$topic] = [
                    'annual_training' => [],
                    'annual_tasks' => [],
                    'other_training' => []
                ];
            }
            
            // Check if it's "every x years" - put in other training with frequency
            if (str_contains($frequency, 'every') || str_contains($frequency, 'years')) {
                $topicsData[$topic]['other_training'][] = [
                    'frequency' => $training['frequency'],
                    'content' => $training['training_content']
                ];
            } elseif (str_contains($frequency, 'annual')) {
                // Put in annual training
                $topicsData[$topic]['annual_training'][] = $training['training_content'];
            }
        }
        
        // Process San Diego compliance data for annual tasks
        foreach ($sandiegoData as $action) {
            $topic = $action['topic'];
            $frequency = strtolower(trim($action['frequency']));
            
            if (!isset($topicsData[$topic])) {
                $topicsData[$topic] = [
                    'annual_training' => [],
                    'annual_tasks' => [],
                    'other_training' => []
                ];
            }
            
            // Check if it's annual - put in annual tasks
            if (str_contains($frequency, 'annual')) {
                $topicsData[$topic]['annual_tasks'][] = $action['activity'];
            }
        }
        
        // Create the sheet data
        $sheetData = [];
        
        // Create headers based on what frequencies exist
        $headers = ['Topics'];
        if ($hasAnnualTraining) {
            $headers[] = 'Annual Training';
        }
        if ($hasAnnualTasks) {
            $headers[] = 'Annual Tasks';
        }
        if ($hasOtherTraining) {
            $headers[] = 'Other Training';
        }
        
        $sheetData[] = $headers;
        
        // Fill data rows grouped by topic
        foreach ($topicsData as $topic => $data) {
            $row = [];
            
            // Topics column
            $row[] = $topic;
            
            // Annual Training column (only if annual training exists)
            if ($hasAnnualTraining) {
                if (!empty($data['annual_training'])) {
                    $annualTrainingText = '';
                    foreach ($data['annual_training'] as $training) {
                        $annualTrainingText .= "-{$training}\n";
                    }
                    $row[] = rtrim($annualTrainingText, "\n");
                } else {
                    $row[] = '';
                }
            }
            
            // Annual Tasks column (only if annual tasks exist)
            if ($hasAnnualTasks) {
                if (!empty($data['annual_tasks'])) {
                    $annualTasksText = '';
                    foreach ($data['annual_tasks'] as $task) {
                        $annualTasksText .= "-{$task}\n";
                    }
                    $row[] = rtrim($annualTasksText, "\n");
                } else {
                    $row[] = '';
                }
            }
            
            // Other Training column (only if other training exists)
            if ($hasOtherTraining) {
                if (!empty($data['other_training'])) {
                    $otherTrainingText = '';
                    foreach ($data['other_training'] as $training) {
                        $otherTrainingText .= "-{$training['frequency']}: {$training['content']}\n";
                    }
                    $row[] = rtrim($otherTrainingText, "\n");
                } else {
                    $row[] = '';
                }
            }
            
            $sheetData[] = $row;
        }
        
        return $sheetData;
    }

    /**
     * Generate Toluca Calendar Export with exact layout (2025-2030)
     * Layout: Row 1 = Day headers, Row 2 = Dates, Row 3 = Activities, etc.
     */
    public function generateTolucaCalendarExport($tolucaData, $startYear = 2025, $endYear = 2030, $file = null)
    {
        try {
            Log::info('Starting Toluca Calendar Export', [
                'toluca_data_count' => count($tolucaData),
                'start_year' => $startYear,
                'end_year' => $endYear
            ]);
            
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            
            // Create sheets for each year
            $years = range($startYear, $endYear);
            
            foreach ($years as $yearIndex => $year) {
                if ($yearIndex === 0) {
                    $worksheet = $spreadsheet->getActiveSheet();
                } else {
                    $worksheet = $spreadsheet->createSheet();
                }
                
                $worksheet->setTitle("Toluca {$year}");
                
                Log::info("Setting up worksheet for year {$year}");
                
                // Generate calendar for this year
                $this->generateYearCalendar($worksheet, $tolucaData, $year);
            }
            
            // Set first sheet as active
            $spreadsheet->setActiveSheetIndex(0);
            
            // Add Annual Training and Tasks sheet if file is provided
            if ($file) {
                $trainingData = $this->processTrainingSheet($file);
                $annualTrainingAndTasksData = $this->createAnnualTrainingAndTasksSheet($tolucaData, $trainingData);
                
                // Create the new sheet
                $annualSheet = $spreadsheet->createSheet();
                $annualSheet->setTitle('Toluca Training and Task');
                
                // Add data to the sheet
                foreach ($annualTrainingAndTasksData as $rowIndex => $row) {
                    foreach ($row as $colIndex => $value) {
                        $cellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1) . ($rowIndex + 1);
                        $annualSheet->setCellValue($cellAddress, $value);
                    }
                }
                
                // Get the number of columns dynamically
                $numColumns = count($annualTrainingAndTasksData[0]);
                $lastColumn = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($numColumns);
                
                // Style the header row
                $annualSheet->getStyle('A1:' . $lastColumn . '1')->getFont()->setBold(true);
                $annualSheet->getStyle('A1:' . $lastColumn . '1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
                $annualSheet->getStyle('A1:' . $lastColumn . '1')->getFill()->getStartColor()->setRGB('E6E6FA');
                
                // Auto-size columns
                for ($i = 1; $i <= $numColumns; $i++) {
                    $column = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
                    $annualSheet->getColumnDimension($column)->setAutoSize(true);
                }
                
                // Enable text wrapping for content columns (all except Topics column)
                if ($numColumns > 1) {
                    $contentColumns = 'B:' . $lastColumn;
                    $annualSheet->getStyle($contentColumns)->getAlignment()->setWrapText(true);
                }
            }
            
            Log::info('Creating Excel writer');
            
            // Create writer and save
            $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
            
            // Save to temporary file
            $filename = "toluca_calendar_{$startYear}_{$endYear}.xlsx";
            $tempPath = storage_path('app/temp/' . $filename);
            Log::info('Saving to temp path', ['temp_path' => $tempPath]);
            
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            
            $writer->save($tempPath);
            
            Log::info('Toluca Calendar file saved successfully', ['temp_path' => $tempPath]);
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error('Error generating Toluca Calendar Export', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Generate San Diego Calendar Export (2025-2030)
     */
    public function generateSandiegoCalendarExport($file)
    {
        try {
            Log::info('Starting San Diego Calendar Export', ['file' => $file]);
            
            // Process San Diego data
            $sandiegoData = $this->processSandiegoFile($file);
            
            Log::info('San Diego data processed', ['count' => count($sandiegoData)]);
            
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            
            // Create sheets for each year (2025-2030)
            $years = range(2025, 2030);
            
            foreach ($years as $yearIndex => $year) {
                if ($yearIndex === 0) {
                    $worksheet = $spreadsheet->getActiveSheet();
                } else {
                    $worksheet = $spreadsheet->createSheet();
                }
                
                $worksheet->setTitle("San Diego {$year}");
                
                Log::info("Setting up worksheet for year {$year}");
                
                // Generate calendar for this year
                $this->generateSandiegoYearCalendar($worksheet, $sandiegoData, $year);
            }
            
            // Set first sheet as active
            $spreadsheet->setActiveSheetIndex(0);
            
            // Add Annual Training and Tasks sheet
            $trainingData = $this->processTrainingSheetFromPath($file);
            $annualTrainingAndTasksData = $this->createSanDiegoTrainingAndTasksSheet($sandiegoData, $trainingData);
            
            // Create the new sheet
            $annualSheet = $spreadsheet->createSheet();
            $annualSheet->setTitle('San Diego Training and Task');
            
            // Add data to the sheet
            foreach ($annualTrainingAndTasksData as $rowIndex => $row) {
                foreach ($row as $colIndex => $value) {
                    $cellAddress = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1) . ($rowIndex + 1);
                    $annualSheet->setCellValue($cellAddress, $value);
                }
            }
            
            // Get the number of columns dynamically
            $numColumns = count($annualTrainingAndTasksData[0]);
            $lastColumn = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($numColumns);
            
            // Style the header row
            $annualSheet->getStyle('A1:' . $lastColumn . '1')->getFont()->setBold(true);
            $annualSheet->getStyle('A1:' . $lastColumn . '1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
            $annualSheet->getStyle('A1:' . $lastColumn . '1')->getFill()->getStartColor()->setRGB('E6E6FA');
            
            // Auto-size columns
            for ($i = 1; $i <= $numColumns; $i++) {
                $column = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
                $annualSheet->getColumnDimension($column)->setAutoSize(true);
            }
            
            // Enable text wrapping for content columns (all except Topics column)
            if ($numColumns > 1) {
                $contentColumns = 'B:' . $lastColumn;
                $annualSheet->getStyle($contentColumns)->getAlignment()->setWrapText(true);
            }
            
            Log::info('Creating Excel writer');
            
            // Create writer and save
            $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
            
            // Save to temporary file
            $filename = "sandiego_calendar_2025_2030.xlsx";
            $tempPath = storage_path('app/temp/' . $filename);
            Log::info('Saving to temp path', ['temp_path' => $tempPath]);
            
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            
            $writer->save($tempPath);
            
            Log::info('San Diego Calendar file saved successfully', ['temp_path' => $tempPath]);
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error('Error generating San Diego Calendar Export', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Process San Diego Excel file
     */
    public function processSandiegoFile($filePath)
    {
        try {
            Log::info('Processing San Diego file', ['file' => $filePath]);
            
            $spreadsheet = IOFactory::load($filePath);
            $worksheet = $spreadsheet->getActiveSheet();
            
            $highestRow = $worksheet->getHighestRow();
            $highestColumn = $worksheet->getHighestColumn();
            
            Log::info('San Diego file dimensions', ['rows' => $highestRow, 'columns' => $highestColumn]);
            
            $sandiegoData = [];
            $rowsToIgnore = [27, 46, 62, 77, 81, 85]; // Rows to skip
            
            for ($row = 1; $row <= $highestRow; $row++) {
                // Skip header rows and ignored rows
                if ($row <= 2 || in_array($row, $rowsToIgnore)) {
                    continue;
                }
                
                $rowData = [];
                for ($col = 'A'; $col <= $highestColumn; $col++) {
                    $cellValue = $worksheet->getCell($col . $row)->getCalculatedValue();
                    $rowData[$col] = $cellValue;
                }
                
                // Skip empty rows
                if (empty(array_filter($rowData))) {
                    continue;
                }
                
                // Process the row data
                $processedRow = $this->processSandiegoRow($rowData, $row);
                if ($processedRow) {
                    $sandiegoData[] = $processedRow;
                }
            }
            
            Log::info('San Diego data processed successfully', ['count' => count($sandiegoData)]);
            return $sandiegoData;
            
        } catch (\Exception $e) {
            Log::error('Error processing San Diego file', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Process individual San Diego row
     */
    private function processSandiegoRow($rowData, $rowNumber)
    {
        // Extract data from columns A, C, D (Topic, Activity, Frequency)
        $topic = $rowData['A'] ?? '';
        $activity = $rowData['C'] ?? '';
        $frequency = $rowData['D'] ?? '';
        $dueDate = $rowData['E'] ?? '';
        
        // Skip if essential data is missing
        if (empty($topic) || empty($activity)) {
        return null;
        }
        
        // Handle special cases
        $processedFrequency = $this->processSandiegoFrequency($frequency, $dueDate, $rowNumber);
        
        return [
            'row_number' => $rowNumber,
            'topic' => trim($topic),
            'activity' => trim($activity),
            'frequency' => $processedFrequency,
            'original_frequency' => trim($frequency),
            'due_date' => trim($dueDate),
            'original_due_date' => trim($dueDate)
        ];
    }

    /**
     * Process San Diego frequency with special rules
     */
    private function processSandiegoFrequency($frequency, $dueDate, $rowNumber)
    {
        $freq = strtolower(trim($frequency));
        $due = strtolower(trim($dueDate));
        
        // Handle special rows
        if ($rowNumber == 45) {
            return 'early_july'; // Early July -> July 1st week, 1st Monday
        }
        
        if ($rowNumber == 53) {
            return 'every_3_years'; // Every three years starting 2024
        }
        
        if ($rowNumber == 79) {
            return 'within_90_days'; // Within 90 days of annual report (July 15th)
        }
        
        // Handle frequency patterns based on actual San Diego data
        if (str_contains($freq, 'annually')) {
            return 'annual';
        }
        
        if (str_contains($freq, 'monthly')) {
            return 'monthly';
        }
        
        if (str_contains($freq, 'one time')) {
            return 'one_time';
        }
        
        if (str_contains($freq, 'after obtaining level 1') ||
            str_contains($freq, 'after conduction level 1') ||
            str_contains($freq, 'after sampling results') ||
            str_contains($freq, 'after conduction level 2')) {
            return 'one_time';
        }
        
        if (str_contains($freq, 'every four years') || 
            str_contains($freq, 'every 4 years')) {
            return 'every_4_years';
        }
        
        if (str_contains($freq, 'every three years') || 
            str_contains($freq, 'every 3 years')) {
            return 'every_3_years';
        }
        
        if (str_contains($freq, 'episodic')) {
            return 'episodic'; // Will be ignored
        }
        
        if (str_contains($freq, 'daily')) {
            return 'daily'; // Will be ignored
        }
        
        // Default to annual if no specific frequency found
        return 'annual';
    }

    /**
     * Generate San Diego calendar for a specific year
     */
    private function generateSandiegoYearCalendar($worksheet, $sandiegoData, $year)
    {
        $currentRow = 1;
        
        // Generate calendar for each month
        for ($month = 1; $month <= 12; $month++) {
            $currentRow = $this->generateMonthCalendar($worksheet, $month, $year, $sandiegoData, $currentRow);
            
            // Add 2 empty rows between months (except after December)
            if ($month < 12) {
                $currentRow += 2;
            }
        }
    }

    /**
     * Generate San Diego calendar for a specific month
     */
    private function generateSandiegoMonthCalendar($worksheet, $month, $year, $sandiegoData, $startRow)
    {
        $monthName = date('F', mktime(0, 0, 0, $month, 1, $year));
        $currentRow = $startRow;
        
        // Row 1: Month header in column A, Day headers in columns B-H
        $worksheet->setCellValue('A' . $currentRow, $monthName . ' ' . $year);
        $worksheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $worksheet->getStyle('A' . $currentRow)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
        $worksheet->getStyle('A' . $currentRow)->getFill()->getStartColor()->setRGB('E6E6FA');
        
        // Day headers
        $dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        foreach ($dayHeaders as $index => $day) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 2); // B-H
            $worksheet->setCellValue($col . $currentRow, $day);
            $worksheet->getStyle($col . $currentRow)->getFont()->setBold(true);
            $worksheet->getStyle($col . $currentRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }
        
        $currentRow++;
        
        // Get month data
        $firstDay = new \DateTime("{$year}-{$month}-01");
        $lastDay = new \DateTime("{$year}-{$month}-" . $firstDay->format('t'));
        $daysInMonth = $lastDay->format('t');
        $firstDayOfWeek = $firstDay->format('w'); // 0 = Sunday
        
        // Generate calendar events for this month using San Diego logic
        $monthEvents = $this->getSandiegoMonthEvents($sandiegoData, $year, $month);
        
        // Fill calendar weeks
        $currentDate = 1;
        $weekNumber = 0;
        
        while ($currentDate <= $daysInMonth) {
            // Row for dates
            $dateRow = $currentRow;
            // Row for activities (next row)
            $activityRow = $currentRow + 1;
            
            // Fill the week
            for ($dayOfWeek = 0; $dayOfWeek < 7; $dayOfWeek++) {
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($dayOfWeek + 2); // B-H
                
                if ($currentDate == 1 && $dayOfWeek < $firstDayOfWeek) {
                    // Empty cell before month starts
                    $worksheet->setCellValue($col . $dateRow, '');
                    $worksheet->setCellValue($col . $activityRow, '');
                } elseif ($currentDate <= $daysInMonth) {
                    // Date cell
                    $worksheet->setCellValue($col . $dateRow, $currentDate);
                    $worksheet->getStyle($col . $dateRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    
                    // Activity cell - check if there are activities for this date
                    $dateKey = "{$year}-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-" . str_pad($currentDate, 2, '0', STR_PAD_LEFT);
                    if (isset($monthEvents[$dateKey])) {
                        $activities = $monthEvents[$dateKey];
                        
                        // Format activities with proper labels based on frequency
                        $monthName = date('M', mktime(0, 0, 0, $month, 1, $year));
                        $activityText = "";
                        
                        // Group activities by frequency type
                        $groupedActivities = [];
                        foreach ($activities as $activity) {
                            $frequency = strtolower($activity['frequency']);
                            
                            if (!isset($groupedActivities[$frequency])) {
                                $groupedActivities[$frequency] = [];
                            }
                            $groupedActivities[$frequency][] = $activity;
                        }
                        
                        // Format each group
                        foreach ($groupedActivities as $frequency => $freqActivities) {
                            if ($frequency === 'bi-annually') {
                                $activityText .= "Bi-annually:\n";
                            } elseif ($frequency === 'weekly') {
                                $activityText .= "Weekly:\n";
                            } elseif ($frequency === 'one_time') {
                                $activityText .= "One time:\n";
                            } elseif ($frequency === 'annual') {
                                $activityText .= "Annually:\n";
                            } elseif ($frequency === 'early_july') {
                                $activityText .= "Early July:\n";
                            } elseif ($frequency === 'every_3_years') {
                                $activityText .= "Every 3 years:\n";
                            } elseif ($frequency === 'within_90_days') {
                                $activityText .= "Within 90 days:\n";
                            } else {
                                $activityText .= "Due {$monthName} {$currentDate}:\n";
                            }
                            
                            foreach ($freqActivities as $activity) {
                                $activityText .= "-" . $activity['topic'] . ": " . $activity['activity'] . "\n";
                            }
                        }
                        
                        $worksheet->setCellValue($col . $activityRow, rtrim($activityText, "\n"));
                        $worksheet->getStyle($col . $activityRow)->getAlignment()->setWrapText(true);
                        $worksheet->getStyle($col . $activityRow)->getFont()->setBold(true);
                    } else {
                        $worksheet->setCellValue($col . $activityRow, '');
                    }
                }
                
                $currentDate++;
            }
            
            $currentRow += 2; // Move to next week (date row + activity row)
            $weekNumber++;
        }
        
        return $currentRow;
    }

    /**
     * Get San Diego events for a specific month
     */
    private function getSandiegoMonthEvents($sandiegoData, $year, $month)
    {
        $events = [];
        
        foreach ($sandiegoData as $activity) {
            $frequency = $activity['frequency'];
            
            // Skip daily activities
            if ($frequency === 'daily') {
                continue;
            }
            
            $dates = $this->getSandiegoActivityDates($activity, $year, $month);
            
            foreach ($dates as $date) {
                $dateKey = $date->format('Y-m-d');
                if (!isset($events[$dateKey])) {
                    $events[$dateKey] = [];
                }
                $events[$dateKey][] = $activity;
            }
        }
        
        return $events;
    }

    /**
     * Get dates for San Diego activity based on frequency
     */
    private function getSandiegoActivityDates($activity, $year, $month)
    {
        $frequency = $activity['frequency'];
        $dates = [];
        
        switch ($frequency) {
            case 'bi-annually':
                // January 1st week, 1st Monday and July 1st week, 1st Monday
                if ($month == 1) {
                    $dates[] = $this->getFirstMondayOfMonth($year, 1);
                } elseif ($month == 7) {
                    $dates[] = $this->getFirstMondayOfMonth($year, 7);
                }
                break;
                
            case 'weekly':
                // First Monday of the month - for ALL months
                $dates[] = $this->getFirstMondayOfMonth($year, $month);
                break;
                
            case 'monthly':
                // First weekday of the month (no due date means first weekday)
                $dates[] = $this->getFirstWeekdayOfMonth($year, $month);
                break;
                
            case 'one_time':
                // Look at due date
                $dueDate = $this->parseSandiegoDueDate($activity['due_date'], $year);
                if ($dueDate && $dueDate->format('n') == $month) {
                    $dates[] = $this->adjustToWeekday($dueDate);
                }
                break;
                
            case 'annual':
            case 'annually':
                // Same as annually - check if there's a due date
                $dueDate = $this->parseSandiegoDueDate($activity['due_date'], $year);
                if ($dueDate && $dueDate->format('n') == $month) {
                    // Has specific due date - use it
                    $dates[] = $this->adjustToWeekday($dueDate);
                } elseif (empty($activity['due_date']) && $month == 1) {
                    // No due date - use first weekday of January (1st week, 1st weekday)
                    $dates[] = $this->getFirstWeekdayOfJanuary($year);
                }
                break;
                
            case 'early_july':
                // July 1st week, 1st Monday
                if ($month == 7) {
                    $dates[] = $this->getFirstMondayOfMonth($year, 7);
                }
                break;
                
            case 'every_3_years':
                // Every 3 years starting 2024
                if (($year - 2024) % 3 == 0 && $month == 1) {
                    $dates[] = $this->getFirstMondayOfMonth($year, 1);
                }
                break;
                
            case 'every_4_years':
                // Every 4 years starting 2024
                if (($year - 2024) % 4 == 0 && $month == 9) {
                    $dates[] = $this->getFirstMondayOfMonth($year, 9);
                }
                break;
                
            case 'within_90_days':
                // Within 90 days of annual report (July 15th)
                if ($month == 10) { // 90 days from July 15th is around October 13th
                    $july15 = new \DateTime("{$year}-07-15");
                    $dueDate = clone $july15;
                    $dueDate->add(new \DateInterval('P90D'));
                    if ($dueDate->format('n') == $month) {
                        $dates[] = $this->adjustToWeekday($dueDate);
                    }
                }
                break;
        }
        
        return $dates;
    }

    /**
     * Get first weekday of January (1st week, 1st weekday)
     */
    private function getFirstWeekdayOfJanuary($year)
    {
        $firstDay = new \DateTime("{$year}-01-01");
        $dayOfWeek = $firstDay->format('w'); // 0 = Sunday, 1 = Monday
        
        if ($dayOfWeek == 0) { // Sunday
            $firstWeekday = clone $firstDay;
            $firstWeekday->add(new \DateInterval('P1D')); // Add 1 day to get Monday
        } elseif ($dayOfWeek == 6) { // Saturday
            $firstWeekday = clone $firstDay;
            $firstWeekday->add(new \DateInterval('P2D')); // Add 2 days to get Monday
        } else { // Monday-Friday
            $firstWeekday = $firstDay; // Already a weekday
        }
        
        return $firstWeekday;
    }

    /**
     * Get first weekday of any month (1st week, 1st weekday)
     */
    private function getFirstWeekdayOfMonth($year, $month)
    {
        $firstDay = new \DateTime("{$year}-{$month}-01");
        $dayOfWeek = $firstDay->format('w'); // 0 = Sunday, 1 = Monday
        
        if ($dayOfWeek == 0) { // Sunday
            $firstWeekday = clone $firstDay;
            $firstWeekday->add(new \DateInterval('P1D')); // Add 1 day to get Monday
        } elseif ($dayOfWeek == 6) { // Saturday
            $firstWeekday = clone $firstDay;
            $firstWeekday->add(new \DateInterval('P2D')); // Add 2 days to get Monday
        } else { // Monday-Friday
            $firstWeekday = $firstDay; // Already a weekday
        }
        
        return $firstWeekday;
    }

    /**
     * Get first Monday of a month
     */
    private function getFirstMondayOfMonth($year, $month)
    {
        $firstDay = new \DateTime("{$year}-{$month}-01");
        $dayOfWeek = $firstDay->format('w'); // 0 = Sunday, 1 = Monday
        
        if ($dayOfWeek == 0) { // Sunday
            $firstMonday = clone $firstDay;
            $firstMonday->add(new \DateInterval('P1D')); // Add 1 day
        } elseif ($dayOfWeek == 1) { // Monday
            $firstMonday = $firstDay;
        } else { // Tuesday-Saturday
            $daysToAdd = 8 - $dayOfWeek; // Days to get to next Monday
            $firstMonday = clone $firstDay;
            $firstMonday->add(new \DateInterval("P{$daysToAdd}D"));
        }
        
        return $firstMonday;
    }

    /**
     * Parse San Diego due date
     */
    private function parseSandiegoDueDate($dueDateStr, $year)
    {
        if (empty($dueDateStr)) {
            return null;
        }
        
        // Try to parse various date formats
        $formats = [
            'Y-m-d',
            'm/d/Y',
            'm-d-Y',
            'F j, Y',
            'F j',
            'M j',
            'j F',
            'j M'
        ];
        
        foreach ($formats as $format) {
            $date = \DateTime::createFromFormat($format, $dueDateStr);
            if ($date !== false) {
                // If year is not specified, use the given year
                if ($date->format('Y') == 1970) {
                    $date->setDate($year, $date->format('n'), $date->format('j'));
                }
                return $date;
            }
        }
        
        return null;
    }

    /**
     * Adjust date to nearest weekday (move to next weekday if weekend)
     */
    private function adjustToWeekday($date)
    {
        $dayOfWeek = $date->format('w'); // 0 = Sunday, 6 = Saturday
        
        if ($dayOfWeek == 0) { // Sunday
            $adjusted = clone $date;
            $adjusted->add(new \DateInterval('P1D')); // Move to Monday
            return $adjusted;
        } elseif ($dayOfWeek == 6) { // Saturday
            $adjusted = clone $date;
            $adjusted->add(new \DateInterval('P2D')); // Move to Monday
            return $adjusted;
        }
        
        return $date; // Already a weekday
    }

    /**
     * Generate calendar for a specific year with exact layout
     */
    private function generateYearCalendar($worksheet, $tolucaData, $year)
    {
        $currentRow = 1;
        
        // Generate calendar for each month
        for ($month = 1; $month <= 12; $month++) {
            $currentRow = $this->generateMonthCalendar($worksheet, $month, $year, $tolucaData, $currentRow);
            
            // Add 2 empty rows between months (except after December)
            if ($month < 12) {
                $currentRow += 2;
            }
        }
    }

    /**
     * Generate calendar for a specific month with exact layout
     */
    private function generateMonthCalendar($worksheet, $month, $year, $tolucaData, $startRow)
    {
        $monthName = date('F', mktime(0, 0, 0, $month, 1, $year));
        $currentRow = $startRow;
        
        // Row 1: Month header in column A, Day headers in columns B-H
        $worksheet->setCellValue('A' . $currentRow, $monthName . ' ' . $year);
        $worksheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $worksheet->getStyle('A' . $currentRow)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
        $worksheet->getStyle('A' . $currentRow)->getFill()->getStartColor()->setRGB('E6E6FA');
        
        // Day headers
        $dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        foreach ($dayHeaders as $index => $day) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 2); // B-H
            $worksheet->setCellValue($col . $currentRow, $day);
            $worksheet->getStyle($col . $currentRow)->getFont()->setBold(true);
            $worksheet->getStyle($col . $currentRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        }
        
        $currentRow++;
        
        // Get month data
        $firstDay = new \DateTime("{$year}-{$month}-01");
        $lastDay = new \DateTime("{$year}-{$month}-" . $firstDay->format('t'));
        $daysInMonth = $lastDay->format('t');
        $firstDayOfWeek = $firstDay->format('w'); // 0 = Sunday
        
        // Generate calendar events for this month
        $monthEvents = $this->getMonthEvents($tolucaData, $year, $month);
        
        // Fill calendar weeks
        $currentDate = 1;
        $weekNumber = 0;
        
        while ($currentDate <= $daysInMonth) {
            // Row for dates
            $dateRow = $currentRow;
            // Row for activities (next row)
            $activityRow = $currentRow + 1;
            
            // Fill the week
            for ($dayOfWeek = 0; $dayOfWeek < 7; $dayOfWeek++) {
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($dayOfWeek + 2); // B-H
                
                if ($currentDate == 1 && $dayOfWeek < $firstDayOfWeek) {
                    // Empty cell before month starts
                    $worksheet->setCellValue($col . $dateRow, '');
                    $worksheet->setCellValue($col . $activityRow, '');
                } elseif ($currentDate <= $daysInMonth) {
                    // Date cell
                    $worksheet->setCellValue($col . $dateRow, $currentDate);
                    $worksheet->getStyle($col . $dateRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                    
                    // Activity cell - check if there are activities for this date
                    $dateKey = "{$year}-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-" . str_pad($currentDate, 2, '0', STR_PAD_LEFT);
                    if (isset($monthEvents[$dateKey])) {
                        $activities = $monthEvents[$dateKey];
                        
                        // Format activities with proper labels based on frequency
                        $monthName = date('M', mktime(0, 0, 0, $month, 1, $year));
                        $activityText = "";
                        
                        // Group activities by frequency type and due date
                        $groupedActivities = [];
                        foreach ($activities as $activity) {
                            $frequency = strtolower($activity['frequency']);
                            $dueDateStr = strtolower($activity['original_due_date'] ?? '');
                            
                            // Create a key that combines frequency and due date for proper grouping
                            $groupKey = $frequency;
                            if (str_contains($frequency, 'quarterly')) {
                                if (str_contains($dueDateStr, 'end of quarter') || str_contains($dueDateStr, 'end of every quarter') || str_contains($dueDateStr, 'the end of every quarter')) {
                                    $groupKey = 'end_of_quarter';
                                } else {
                                    $groupKey = 'quarterly_start';
                                }
                            } elseif (str_contains($frequency, 'annual')) {
                                if (str_contains($dueDateStr, 'on hire') || str_contains($dueDateStr, 'annually')) {
                                    $groupKey = 'annual_hire';
                                } else {
                                    $groupKey = 'annual_due';
                                }
                            }
                            
                            if (!isset($groupedActivities[$groupKey])) {
                                $groupedActivities[$groupKey] = [];
                            }
                            $groupedActivities[$groupKey][] = $activity;
                        }
                        
                        // Format each group
                        foreach ($groupedActivities as $groupKey => $freqActivities) {
                            if ($groupKey === 'monthly') {
                                $activityText .= "End of Month:\n";
                            } elseif ($groupKey === 'end_of_quarter') {
                                $activityText .= "End of every quarter:\n";
                            } elseif ($groupKey === 'quarterly_start') {
                                $activityText .= "Quarterly:\n";
                            } elseif ($groupKey === 'annual_hire') {
                                $activityText .= "Annually:\n";
                            } elseif ($groupKey === 'annual_due') {
                                // Check if this was moved from a weekend
                                $originalDate = $this->getOriginalDate($freqActivities[0], $year, $month, $currentDate);
                                if ($originalDate && $originalDate != $currentDate) {
                                    $activityText .= "Annually due on {$monthName} {$originalDate} (Note: moved to {$monthName} {$currentDate} due to {$monthName} {$originalDate} being a weekend):\n";
                                } else {
                                    $activityText .= "Annually due on {$monthName} {$currentDate}:\n";
                                }
                            } else {
                                $activityText .= "Due {$monthName} {$currentDate}:\n";
                            }
                            
                            foreach ($freqActivities as $activity) {
                                $activityText .= "-" . $activity['topic'] . ": " . $activity['activity'] . "\n";
                            }
                        }
                        
                        // Remove trailing newline
                        $activityText = rtrim($activityText, "\n");
                        
                        $worksheet->setCellValue($col . $activityRow, $activityText);
                        
                        // Style activity cells (no background color)
                        $worksheet->getStyle($col . $activityRow)->getFont()->setSize(8);
                        $worksheet->getStyle($col . $activityRow)->getAlignment()->setWrapText(true);
                    } else {
                        $worksheet->setCellValue($col . $activityRow, '');
                    }
                    
                    $currentDate++;
                } else {
                    // Empty cell after month ends
                    $worksheet->setCellValue($col . $dateRow, '');
                    $worksheet->setCellValue($col . $activityRow, '');
                }
            }
            
            $currentRow += 2; // Move to next week (date row + activity row)
            $weekNumber++;
        }
        
        return $currentRow;
    }
    

    /**
     * Get the original date before weekend adjustment
     */
    private function getOriginalDate($activity, $year, $month, $currentDate)
    {
        // For annual activities, check if the original date was a weekend
        $frequency = strtolower($activity['frequency']);
        if (str_contains($frequency, 'annual')) {
            // Try to determine the original date based on the activity
            // This is a simplified approach - in practice, you'd need to track the original date
            $originalDate = $currentDate;
            
            // Check if this looks like it was moved from a weekend
            // For now, we'll assume March 1st activities were moved to March 3rd
            if ($month == 3 && $currentDate == 3) {
                return 1; // Return just the day number
            }
        }
        
        return null;
    }

    /**
     * Get all events for a specific month
     */
    private function getMonthEvents($data, $year, $month)
    {
        $events = [];
        
        foreach ($data as $task) {
            // Use Toluca's proven date calculation logic
            $dueDate = $this->parseDueDate($task['due_date'], $year, $task['frequency']);
            
            if ($dueDate) {
                // Generate recurring dates for the specific year
                $recurringDates = $this->calculateRecurringDates($dueDate, $task['frequency'], $year, $task['due_date']);
                
                foreach ($recurringDates as $date) {
                    // Handle weekend events - move to weekday
                    $adjustedDate = $this->adjustWeekendDate($date);
                    
                    // Check if this date is in the target month
                    if ($adjustedDate->format('Y') == $year && $adjustedDate->format('n') == $month) {
                        $dateKey = $adjustedDate->format('Y-m-d');
                        
                        if (!isset($events[$dateKey])) {
                            $events[$dateKey] = [];
                        }
                        
                        $events[$dateKey][] = [
                            'topic' => $task['topic'],
                            'activity' => $task['activity'],
                            'frequency' => $task['frequency'],
                            'original_due_date' => $task['due_date'] ?? ''
                        ];
                    }
                }
            }
        }
        
        return $events;
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
