<?php
namespace App\Http\Controllers;

use App\Http\Requests\ScheduleRequest;
use App\Http\Resources\ScheduleCollection;
use App\Http\Resources\ScheduleResource;
use App\Models\Schedule;
use App\Repositories\ScheduleRepository;
use App\Services\ScheduleService;
use App\Traits\HasCrudOperations;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    use HasCrudOperations;

    // Configuration properties
    protected string $modelClass      = Schedule::class;
    protected string $resourceClass   = ScheduleResource::class;
    protected string $collectionClass = ScheduleCollection::class;
    protected string $resourceName    = 'schedules';

    // Abstract method implementations
    protected function getModel(): string
    {
        return $this->modelClass;
    }

    protected function getIndexView(): string
    {
        return 'Schedules/Index';
    }

    protected function getCreateView(): string
    {
        return 'Schedules/CreateStepperPage';
    }

    public function create(Request $request): Response
    {
        $step = $request->get('step', 1);
        return Inertia::render($this->getCreateView(), ['step' => (int) $step]);
    }

    protected function getEditView(): string
    {
        return 'Schedules/Edit';
    }

    protected function getShowView(): string
    {
        return 'Schedules/Show';
    }

    protected function getIndexRoute(): string
    {
        return 'admin.schedules';
    }

    protected function getResourceName(): string
    {
        return $this->resourceName;
    }

    // Override sorting methods for schedules
    protected function getDefaultSortBy(): string
    {
        return 'start_time';
    }

    protected function getDefaultSortOrder(): string
    {
        return 'desc';
    }

    protected function getAllowedSortFields(): array
    {
        return ['start_time', 'end_time', 'created_at', 'updated_at'];
    }

    // Override index method to add settings
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get filter parameters and remove empty ones
        $filters = request()->only(['year', 'month', 'day', 'batch_id']);
        
        // Keep all filter values, including empty strings for "All" selections
        // Empty strings will be handled in the query logic
        
        // Get filtered schedules using the service layer
        $scheduleService = app(ScheduleService::class);
        $schedules = $scheduleService->getFilteredSchedules($user->id, $filters);

        // Get day colors from admin settings
        $adminSettingsService = app(\App\Services\AdminSettingsService::class);
        $dayColors = $adminSettingsService->getValue('day_colors', [
            0 => '#ef4444', // Sunday - Red
            1 => '#3b82f6', // Monday - Blue
            2 => '#10b981', // Tuesday - Green
            3 => '#f59e0b', // Wednesday - Orange
            4 => '#8b5cf6', // Thursday - Purple
            5 => '#06b6d4', // Friday - Cyan
            6 => '#84cc16'  // Saturday - Lime
        ]);

        // Get filter parameters and remove empty ones
        $filters = request()->only(['year', 'month', 'day', 'batch_id']);
        
        // Keep all filter values, including empty strings for "All" selections
        // Empty strings will be handled in the query logic
        


        return Inertia::render($this->getIndexView(), [
            'filters' => $filters,
            $this->getResourceName() => $schedules,
            'settings' => [
                'dayColors' => $dayColors
            ]
        ]);
    }

    // Override store method to handle both single and batch schedules
    public function store(ScheduleRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user         = Auth::user();
        $data         = $request->all();
        $userTimezone = $user->timezone ?? config('app.timezone', 'UTC');

        try {
            // Since we always send dates array format now, handle as batch
            $scheduleService = app(ScheduleService::class);
            $scheduleType    = $data['scheduleType'] ?? 'single';
            $result          = $scheduleService->createBatchSchedules($data['dates'], $user->id, $userTimezone, $scheduleType);

            return Redirect::route('admin.schedules')->with('success', $result['message']);
        } catch (\Exception $e) {
            return Redirect::back()->withErrors(['start_time' => $e->getMessage()])->withInput();
        }
    }



    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule, Request $request): Response
    {
        // Format schedule data for stepper
        $originalData = $this->formatScheduleForStepper($schedule);

        // Check if this is a delete intent request
        $intent = $request->query('intent');
        $step = $request->query('step', 1);

        return Inertia::render($this->getCreateView(), [
            'step'         => (int) $step,
            'mode'         => 'edit',
            'originalData' => $originalData,
            'scheduleId'   => $schedule->id,
            'intent'       => $intent,
        ]);
    }

    private function formatScheduleForStepper(Schedule $schedule): array
    {
        $user         = Auth::user();
        $userTimezone = $user->timezone ?? config('app.timezone', 'UTC');

        if ($schedule->batch_id) {
            // Load all schedules in batch
            $batchSchedules = Schedule::where('batch_id', $schedule->batch_id)->get();

            // Determine schedule type based on batch_id prefix
            $scheduleType = $this->determineScheduleTypeFromBatchId($schedule->batch_id);

            return [
                'scheduleType'  => $scheduleType,
                'selectedDates' => $batchSchedules->map(function ($s) use ($userTimezone) {
                    return $s->start_time->setTimezone($userTimezone)->format('Y-m-d\TH:i:s.v\Z');
                })->toArray(),
                'selectedTime'  => [
                    'start' => $this->formatTimeForFrontend($schedule->start_time),
                    'end'   => $this->formatTimeForFrontend($schedule->end_time),
                ],
                'batchId'       => $schedule->batch_id,
            ];
        } else {
            // Single schedule - convert to user timezone and use ISO format
            return [
                'scheduleType'  => 'single',
                'selectedDates' => [$schedule->start_time->setTimezone($userTimezone)->toISOString()],
                'selectedTime'  => [
                    'start' => $this->formatTimeForFrontend($schedule->start_time),
                    'end'   => $this->formatTimeForFrontend($schedule->end_time),
                ],
            ];
        }
    }

    private function determineScheduleTypeFromBatchId($batchId): string
    {
        if (str_starts_with($batchId, 's_')) {
            return 'single';
        } elseif (str_starts_with($batchId, 'w_')) {
            return 'weekly';
        } elseif (str_starts_with($batchId, 'm_')) {
            return 'monthly';
        }

        // Fallback: try to determine from existing logic for legacy data
        return 'weekly';
    }

    private function formatTimeForFrontend($datetime): string
    {
        $user         = Auth::user();
        $userTimezone = $user->timezone ?? config('app.timezone', 'UTC');

        $date = new \DateTime($datetime);
        $date->setTimezone(new \DateTimeZone($userTimezone));
        return $date->format('H:i'); // 24-hour format for frontend
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($model): RedirectResponse
    {
        // Handle case where string ID is passed instead of model (fallback for legacy support)
        if (is_string($model)) {
            $model = $this->modelClass::withTrashed()->findOrFail($model);
        }

        if ($this->hasDependencies($model)) {
            return Redirect::back()
                ->with('error', $this->getDependencyErrorMessage());
        }

        // Check if this is a batch schedule (weekly/monthly)
        $batchId      = $model->batch_id;
        $deletedCount = 1;

        if ($batchId && (str_starts_with($batchId, 'w_') || str_starts_with($batchId, 'm_'))) {
            // Delete all schedules with the same batch_id
            $deletedCount = $this->modelClass::where('batch_id', $batchId)->delete();
        } else {
            // Single schedule deletion
            $model->delete();
        }

        $message = $deletedCount > 1
        ? "Successfully deleted {$deletedCount} schedules."
        : $this->getSuccessMessage('deleted');

        return Redirect::route($this->getIndexRoute())
            ->with('success', $message);
    }

    public function update(ScheduleRequest $request, $model): \Illuminate\Http\RedirectResponse
    {
        // Handle case where string ID is passed instead of model (fallback for legacy support)
        if (is_string($model)) {
            $model = $this->modelClass::withTrashed()->findOrFail($model);
        }

        $data = $request->all();
        $mode = $data['mode'] ?? 'create';

        if ($mode === 'edit') {
            // Handle edit mode with stepper data
            try {
                $user            = Auth::user();
                $userTimezone    = $user->timezone ?? config('app.timezone', 'UTC');
                $scheduleService = app(ScheduleService::class);
                $result          = $scheduleService->updateScheduleFromStepper($model->id, $data, $user->id, $userTimezone);

                return \Illuminate\Support\Facades\Redirect::route('admin.schedules')
                    ->with('success', $result['message']);
            } catch (\Exception $e) {
                return \Illuminate\Support\Facades\Redirect::back()
                    ->withErrors(['start_time' => $e->getMessage()])
                    ->withInput();
            }
        } else {
            // Handle legacy update
            $model->update($request->validated());
            return \Illuminate\Support\Facades\Redirect::back()
                ->with('success', $this->getSuccessMessage('updated'));
        }
    }

    /**
     * API: Get schedules for a given date for the authenticated user (for conflict checking)
     */
    public function apiForDate(Request $request)
    {
        $user = Auth::user();
        $date = $request->query('date');
        if (! $date) {
            return response()->json([]);
        }

        $scheduleService = app(ScheduleService::class);
        $schedules       = $scheduleService->getSchedulesForDate($user->id, $date, $user->timezone ?? config('app.timezone', 'UTC'));

        return response()->json($schedules);
    }

    /**
     * API: Get all schedules for the authenticated user (for calendar red dots)
     */
    public function allApi(Request $request)
    {
        $user               = Auth::user();
        $scheduleRepository = app(ScheduleRepository::class);
        $schedules          = $scheduleRepository->getAllForUser($user->id);
        return ScheduleResource::collection($schedules);
    }

    /**
     * API: Get schedules for the authenticated user in a date range (for calendar lazy loading)
     */
    public function rangeApi(Request $request)
    {
        $user  = Auth::user();
        $start = $request->query('start');
        $end   = $request->query('end');
        if (! $start || ! $end) {
            return response()->json([]);
        }

        $scheduleService = app(ScheduleService::class);
        $schedules       = $scheduleService->getSchedulesForDateRange($user->id, $start, $end, $user->timezone ?? config('app.timezone', 'UTC'));

        return ScheduleResource::collection($schedules);
    }
}
