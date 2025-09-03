<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\ExcelProcessingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ExcelController extends Controller
{
    protected $excelService;
    
    public function __construct(ExcelProcessingService $excelService)
    {
        $this->excelService = $excelService;
    }
    
    /**
     * Show the Excel upload form
     */
    public function index(): Response
    {
        return Inertia::render('Excel/Index');
    }
    
    /**
     * Process uploaded Excel file
     */
    public function process(Request $request)
    {
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls|max:10240', // 10MB max
        ]);
        
        try {
            $file = $request->file('excel_file');
            
            // Process the Excel file
            $complianceData = $this->excelService->processComplianceFile($file);
            
            // Generate calendar events for 2025
            $calendarEvents = $this->excelService->generateCalendarEvents($complianceData, 2025);
            
            Log::info('Excel file processed successfully', [
                'filename' => $file->getClientOriginalName(),
                'compliance_tasks' => count($complianceData),
                'calendar_events' => count($calendarEvents)
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Excel file processed successfully',
                'data' => [
                    'compliance_tasks' => $complianceData,
                    'calendar_events' => $calendarEvents,
                    'summary' => [
                        'total_tasks' => count($complianceData),
                        'total_events' => count($calendarEvents),
                        'filename' => $file->getClientOriginalName()
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error processing Excel file', [
                'error' => $e->getMessage(),
                'filename' => $request->file('excel_file')?->getClientOriginalName()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error processing Excel file: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Preview the processed data
     */
    public function preview(Request $request)
    {
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);
        
        try {
            $file = $request->file('excel_file');
            
            // Process the Excel file
            $complianceData = $this->excelService->processComplianceFile($file);
            
            // Generate calendar events for 2025
            $calendarEvents = $this->excelService->generateCalendarEvents($complianceData, 2025);
            
            return Inertia::render('Excel/Preview', [
                'complianceData' => $complianceData,
                'calendarEvents' => $calendarEvents,
                'filename' => $file->getClientOriginalName()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error previewing Excel file', [
                'error' => $e->getMessage(),
                'filename' => $request->file('excel_file')?->getClientOriginalName()
            ]);
            
            return back()->withErrors(['error' => 'Error processing Excel file: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Download processed data as JSON
     */
    public function download(Request $request)
    {
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);
        
        try {
            $file = $request->file('excel_file');
            
            // Process the Excel file
            $complianceData = $this->excelService->processComplianceFile($file);
            
            // Generate calendar events for 2025
            $calendarEvents = $this->excelService->generateCalendarEvents($complianceData, 2025);
            
            $data = [
                'compliance_tasks' => $complianceData,
                'calendar_events' => $calendarEvents,
                'processed_at' => now()->toISOString(),
                'filename' => $file->getClientOriginalName()
            ];
            
            $filename = 'processed_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . date('Y-m-d_H-i-s') . '.json';
            
            return response()->json($data)
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            Log::error('Error downloading processed Excel data', [
                'error' => $e->getMessage(),
                'filename' => $request->file('excel_file')?->getClientOriginalName()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error processing Excel file: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export data in Master calendar format as Excel
     */
    public function exportMasterExcel(Request $request)
    {
        // Debug logging
        try {
            Log::info('Export Master Excel request received', [
                'session_id' => session()->getId() ?? 'no-session',
                'csrf_token' => $request->header('X-XSRF-TOKEN'),
                'x_csrf_token' => $request->header('X-CSRF-TOKEN'),
                'form_token' => $request->input('_token'),
                'has_file' => $request->hasFile('excel_file'),
                'file_name' => $request->file('excel_file')?->getClientOriginalName()
            ]);
        } catch (\Exception $e) {
            Log::warning('Session not available for logging', ['error' => $e->getMessage()]);
        }
        
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);
        
        try {
            $file = $request->file('excel_file');
            
            // Process the Excel file
            $complianceData = $this->excelService->processComplianceFile($file);
            
            // Export to Excel in exact Master format
            $filename = 'toluca_2025_calendar_' . date('Y-m-d_H-i-s') . '.xlsx';
            $filePath = $this->excelService->exportToExcelMasterFormat($complianceData, $filename);
            
            Log::info('Excel export successful', [
                'file_path' => $filePath,
                'filename' => $filename
            ]);
            
            return response()->download($filePath, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend();
            
        } catch (\Exception $e) {
            Log::error('Error exporting Master format Excel', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'filename' => $request->file('excel_file')?->getClientOriginalName()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error exporting Excel: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Export data in Master calendar format as CSV
     */
    public function exportMasterCsv(Request $request)
    {
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);
        
        try {
            $file = $request->file('excel_file');
            
            // Process the Excel file
            $complianceData = $this->excelService->processComplianceFile($file);
            
            // Export to CSV in exact Master format
            $filename = 'toluca_2025_calendar_' . date('Y-m-d_H-i-s') . '.csv';
            $filePath = $this->excelService->exportToCsvMasterFormat($complianceData, $filename);
            
            return response()->download($filePath, $filename, [
                'Content-Type' => 'text/csv',
            ])->deleteFileAfterSend();
            
        } catch (\Exception $e) {
            Log::error('Error exporting Master format CSV', [
                'error' => $e->getMessage(),
                'filename' => $request->file('excel_file')?->getClientOriginalName()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error exporting CSV: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate Toluca Calendar Export (2025-2030)
     */
    public function generateTolucaCalendar()
    {
        try {
            // Read the Toluca file
            $tolucaFile = 'xlsx/Toluca Environmental Compliance Calendar.xlsx';
            
            if (!file_exists($tolucaFile)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Toluca file not found: ' . $tolucaFile
                ], 404);
            }
            
            // Create a mock file object
            $file = new \Illuminate\Http\UploadedFile(
                $tolucaFile,
                basename($tolucaFile),
                mime_content_type($tolucaFile),
                null,
                true
            );
            
            $excelService = new ExcelProcessingService();
            
            // Process the Toluca file
            $tolucaData = $excelService->processTolucaFile($file);
            
            Log::info('Toluca data processed', [
                'total_tasks' => count($tolucaData)
            ]);
            
            // Generate the calendar export
            $filePath = $excelService->generateTolucaCalendarExport($tolucaData, 2025, 2030, $file);
            
            return response()->json([
                'success' => true,
                'message' => 'Toluca Calendar generated successfully',
                'file_path' => $filePath,
                'file_exists' => file_exists($filePath),
                'file_size' => file_exists($filePath) ? filesize($filePath) : 0,
                'total_tasks' => count($tolucaData),
                'years_generated' => '2025-2030'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error generating Toluca Calendar', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Test calendar export functionality (for debugging)
     */
    public function testCalendarExport()
    {
        try {
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
            
            $excelService = new ExcelProcessingService();
            
            // Test date parsing
            $testResults = [];
            foreach ($sampleData as $index => $task) {
                $parsedDate = $this->invokeMethod($excelService, 'parseDueDate', [$task['due_date']]);
                if ($parsedDate) {
                    $recurringDates = $this->invokeMethod($excelService, 'calculateRecurringDates', [$parsedDate, $task['frequency'], 2025]);
                    $adjustedDates = [];
                    foreach ($recurringDates as $date) {
                        $adjusted = $this->invokeMethod($excelService, 'adjustWeekendDate', [$date]);
                        $adjustedDates[] = $adjusted->format('Y-m-d');
                    }
                    
                    $testResults[] = [
                        'task' => $task['topic'],
                        'parsed_date' => $parsedDate->format('Y-m-d'),
                        'recurring_dates' => $recurringDates,
                        'adjusted_dates' => $adjustedDates
                    ];
                }
            }
            
            // Test full event generation
            $events = $excelService->generateCalendarEvents($sampleData, 2025);
            
            // Test Excel export
            $filename = 'test_calendar_debug.xlsx';
            $filePath = $excelService->exportToExcelMasterFormat($sampleData, $filename);
            
            return response()->json([
                'success' => true,
                'test_results' => $testResults,
                'total_events' => count($events),
                'sample_events' => array_slice($events, 0, 5),
                'file_path' => $filePath,
                'file_exists' => file_exists($filePath),
                'file_size' => file_exists($filePath) ? filesize($filePath) : 0
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
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
