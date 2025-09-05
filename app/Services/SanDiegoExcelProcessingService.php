<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Illuminate\Support\Facades\Log;

class SanDiegoExcelProcessingService
{
    /**
     * Generate San Diego 2025 Calendar
     */
    public function generateSanDiego2025Calendar($file)
    {
        try {
            Log::info('Starting San Diego 2025 Calendar', ['file' => $file]);
            
            // Process San Diego data
            $sandiegoData = $this->processSanDiegoFile($file);
            
            Log::info('San Diego data processed', ['count' => count($sandiegoData)]);
            
            $spreadsheet = new Spreadsheet();
            $worksheet = $spreadsheet->getActiveSheet();
            $worksheet->setTitle("San Diego 2025");
            
            Log::info("Setting up worksheet for year 2025");
            
            // Generate calendar for 2025 only
            $this->generateSanDiegoYearCalendar($worksheet, $sandiegoData, 2025);
            
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
            $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
            
            // Save to temporary file
            $filename = "sandiego_calendar_2025.xlsx";
            $tempPath = storage_path('app/temp/' . $filename);
            Log::info('Saving to temp path', ['temp_path' => $tempPath]);
            
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            
            $writer->save($tempPath);
            
            Log::info('San Diego 2025 Calendar file saved successfully', ['temp_path' => $tempPath]);
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error('Error generating San Diego 2025 Calendar', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Generate San Diego 2025 Sample Calendar
     */
    public function generateSanDiego2025Sample($file)
    {
        try {
            Log::info('Starting San Diego 2025 Sample Calendar', ['file' => $file]);
            
            // Process San Diego data
            $sandiegoData = $this->processSanDiegoFile($file);
            
            Log::info('San Diego data processed', ['count' => count($sandiegoData)]);
            
            $spreadsheet = new Spreadsheet();
            $worksheet = $spreadsheet->getActiveSheet();
            $worksheet->setTitle("San Diego 2025");
            
            Log::info("Setting up worksheet for year 2025");
            
            // Generate calendar for 2025 only
            $this->generateSanDiegoYearCalendar($worksheet, $sandiegoData, 2025);
            
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
            $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
            
            // Save to temporary file
            $filename = "sandiego_2025_sample.xlsx";
            $tempPath = storage_path('app/temp/' . $filename);
            Log::info('Saving to temp path', ['temp_path' => $tempPath]);
            
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            
            $writer->save($tempPath);
            
            Log::info('San Diego 2025 Sample Calendar file saved successfully', ['temp_path' => $tempPath]);
            
            return $tempPath;
            
        } catch (\Exception $e) {
            Log::error('Error generating San Diego 2025 Sample Calendar', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Generate San Diego Calendar Export (2025-2030)
     */
    public function generateSanDiegoCalendarExport($file)
    {
        try {
            Log::info('Starting San Diego Calendar Export', ['file' => $file]);
            
            // Process San Diego data
            $sandiegoData = $this->processSanDiegoFile($file);
            
            Log::info('San Diego data processed', ['count' => count($sandiegoData)]);
            
            $spreadsheet = new Spreadsheet();
            
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
                $this->generateSanDiegoYearCalendar($worksheet, $sandiegoData, $year);
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
            $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
            
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
    public function processSanDiegoFile($filePath)
    {
        try {
            Log::info('Processing San Diego file', ['file' => $filePath]);
            
            $spreadsheet = IOFactory::load($filePath);
            $worksheet = $spreadsheet->getActiveSheet();
            
            $highestRow = $worksheet->getHighestRow();
            $highestColumn = $worksheet->getHighestColumn();
            
            Log::info('San Diego file dimensions', ['rows' => $highestRow, 'columns' => $highestColumn]);
            
            $sandiegoData = [];
            $rowsToIgnore = [27, 46, 62, 73, 74, 75, 76, 77, 81, 85, 101]; // Updated rows to skip
            
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
                $processedRow = $this->processSanDiegoRow($rowData, $row);
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
    private function processSanDiegoRow($rowData, $rowNumber)
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
        $processedFrequency = $this->processSanDiegoFrequency($frequency, $dueDate, $rowNumber);
        
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
    private function processSanDiegoFrequency($frequency, $dueDate, $rowNumber)
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
    private function generateSanDiegoYearCalendar($worksheet, $sandiegoData, $year)
    {
        $currentRow = 1;
        
        // Generate calendar for each month
        for ($month = 1; $month <= 12; $month++) {
            $currentRow = $this->generateSanDiegoMonthCalendar($worksheet, $month, $year, $sandiegoData, $currentRow);
            
            // Add 2 empty rows between months (except after December)
            if ($month < 12) {
                $currentRow += 2;
            }
        }
    }

    /**
     * Generate San Diego calendar for a specific month
     */
    private function generateSanDiegoMonthCalendar($worksheet, $month, $year, $sandiegoData, $startRow)
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
        
        // Get events for this month
        $monthEvents = $this->getSanDiegoMonthEvents($sandiegoData, $year, $month);
        
        // Generate calendar grid
        $this->generateSanDiegoCalendarGrid($worksheet, $firstDay, $lastDay, $monthEvents, $currentRow);
    }

    /**
     * Get San Diego events for a specific month
     */
    private function getSanDiegoMonthEvents($sandiegoData, $year, $month)
    {
        $events = [];
        
        foreach ($sandiegoData as $activity) {
            $frequency = $activity['frequency'];
            
            // Skip daily activities
            if ($frequency === 'daily') {
                continue;
            }
            
            $dates = $this->getSanDiegoActivityDates($activity, $year, $month);
            
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
    private function getSanDiegoActivityDates($activity, $year, $month)
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
                $dueDate = $this->parseSanDiegoDueDate($activity['due_date'], $year);
                if ($dueDate && $dueDate->format('n') == $month) {
                    $dates[] = $this->adjustToWeekday($dueDate);
                }
                break;
                
            case 'annual':
            case 'annually':
                // Same as annually - check if there's a due date
                $dueDate = $this->parseSanDiegoDueDate($activity['due_date'], $year);
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
                if ($month == 7) {
                    $july15 = new \DateTime("{$year}-07-15");
                    $dates[] = $this->adjustToWeekday($july15);
                }
                break;
        }
        
        return $dates;
    }

    /**
     * Parse San Diego due date
     */
    private function parseSanDiegoDueDate($dueDateStr, $year)
    {
        if (empty($dueDateStr)) {
            return null;
        }
        
        // Handle Excel numeric dates
        if (is_numeric($dueDateStr)) {
            try {
                $excelDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($dueDateStr);
                return $excelDate;
            } catch (\Exception $e) {
                Log::warning('Failed to parse Excel date', ['date' => $dueDateStr, 'error' => $e->getMessage()]);
                return null;
            }
        }
        
        // Try to parse various date formats
        $formats = [
            'F jS, Y',  // April 5th, 2025
            'F j, Y',   // April 5, 2025
            'Y-m-d',
            'm/d/Y',
            'm-d-Y',
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
        
        // If all parsing fails, log the problematic date
        Log::warning('Could not parse San Diego due date', ['date' => $dueDateStr, 'year' => $year]);
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
     * Get first Monday of a month
     */
    private function getFirstMondayOfMonth($year, $month)
    {
        $firstDay = new \DateTime("{$year}-{$month}-01");
        $dayOfWeek = $firstDay->format('w'); // 0 = Sunday, 6 = Saturday
        
        // Calculate days to add to get to Monday
        $daysToAdd = $dayOfWeek == 0 ? 1 : (8 - $dayOfWeek) % 7;
        if ($daysToAdd == 0) $daysToAdd = 7; // If it's already Monday, go to next Monday
        
        $firstMonday = clone $firstDay;
        $firstMonday->add(new \DateInterval("P{$daysToAdd}D"));
        
        return $firstMonday;
    }

    /**
     * Get first weekday of a month (Monday-Friday)
     */
    private function getFirstWeekdayOfMonth($year, $month)
    {
        $firstDay = new \DateTime("{$year}-{$month}-01");
        $dayOfWeek = $firstDay->format('w'); // 0 = Sunday, 6 = Saturday
        
        if ($dayOfWeek == 0) { // Sunday
            $firstWeekday = clone $firstDay;
            $firstWeekday->add(new \DateInterval('P1D')); // Move to Monday
            return $firstWeekday;
        } elseif ($dayOfWeek == 6) { // Saturday
            $firstWeekday = clone $firstDay;
            $firstWeekday->add(new \DateInterval('P2D')); // Move to Monday
            return $firstWeekday;
        }
        
        return $firstDay; // Already a weekday
    }

    /**
     * Get first weekday of January
     */
    private function getFirstWeekdayOfJanuary($year)
    {
        return $this->getFirstWeekdayOfMonth($year, 1);
    }

    /**
     * Generate San Diego calendar grid
     */
    private function generateSanDiegoCalendarGrid($worksheet, $firstDay, $lastDay, $monthEvents, $startRow)
    {
        $currentRow = $startRow;
        $currentDate = clone $firstDay;
        
        // Find the first Sunday of the month (or before if month doesn't start on Sunday)
        $dayOfWeek = $firstDay->format('w'); // 0 = Sunday, 6 = Saturday
        $daysToSubtract = $dayOfWeek;
        $currentDate->sub(new \DateInterval("P{$daysToSubtract}D"));
        
        // Generate 6 weeks (42 days) to cover the month
        for ($week = 0; $week < 6; $week++) {
            for ($day = 0; $day < 7; $day++) {
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($day + 2); // B-H
                $cellAddress = $col . $currentRow;
                
                // Set the date
                $worksheet->setCellValue($cellAddress, $currentDate->format('j'));
                
                // Check if this date has events
                $dateKey = $currentDate->format('Y-m-d');
                if (isset($monthEvents[$dateKey])) {
                    $eventText = '';
                    foreach ($monthEvents[$dateKey] as $event) {
                        $eventText .= "• " . $event['activity'] . "\n";
                    }
                    $worksheet->setCellValue($cellAddress, $currentDate->format('j') . "\n" . rtrim($eventText, "\n"));
                    $worksheet->getStyle($cellAddress)->getAlignment()->setWrapText(true);
                    $worksheet->getStyle($cellAddress)->getAlignment()->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP);
                }
                
                // Style the cell
                if ($currentDate->format('n') != $firstDay->format('n')) {
                    // Different month - gray out
                    $worksheet->getStyle($cellAddress)->getFont()->getColor()->setRGB('999999');
                } else {
                    // Current month - normal styling
                    $worksheet->getStyle($cellAddress)->getFont()->setBold(true);
                }
                
                $currentDate->add(new \DateInterval('P1D'));
            }
            $currentRow++;
        }
    }

    /**
     * Process Training sheet from file path
     */
    private function processTrainingSheetFromPath($filePath)
    {
        try {
            $spreadsheet = IOFactory::load($filePath);
            $trainingSheet = $spreadsheet->getSheetByName('Training');
            
            if (!$trainingSheet) {
                return [];
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
     * Create San Diego Training and Tasks sheet data
     */
    private function createSanDiegoTrainingAndTasksSheet($sandiegoData, $trainingData)
    {
        // Process training data
        $topicsData = [];
        $hasAnnualTraining = false;
        $hasOtherTraining = false;
        
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
            
            if (str_contains($frequency, 'annual')) {
                $topicsData[$topic]['annual_training'][] = $training['training_content'];
                $hasAnnualTraining = true;
            } else {
                $topicsData[$topic]['other_training'][] = [
                    'frequency' => $frequency,
                    'content' => $training['training_content']
                ];
                $hasOtherTraining = true;
            }
        }
        
        // Process actions data (annual tasks only)
        foreach ($sandiegoData as $action) {
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
}
