<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActivityRequest;
use App\Models\Activity;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class ActivityController extends Controller
{
    public function __construct(
        private ActivityService $activityService
    ) {}

    /**
     * Display a listing of activities
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'activity_type_id', 'site_id', 'topic_id', 'start_date', 'end_date', 'sort_by', 'sort_order', 'trashed']);
        
        $activities = $this->activityService->getPaginatedActivities($filters);
        
        return Inertia::render('Activities/Index', [
            'activities' => $activities,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new activity
     */
    public function create(): Response
    {
        return Inertia::render('Activities/CreateStepperPage');
    }

    /**
     * Store a newly created activity
     */
    public function store(ActivityRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            
            $activity = $this->activityService->createActivity($data);
            
            return redirect()->route('activities.show', $activity)
                ->with('success', 'Activity created successfully.');
                
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'An error occurred while creating the activity.'])->withInput();
        }
    }

    /**
     * Display the specified activity
     */
    public function show(Activity $activity): Response
    {
        // Check if user can access this activity
        if (!$this->activityService->canUserAccessActivity($activity->id)) {
            abort(403, 'You do not have permission to view this activity.');
        }

        return Inertia::render('Activities/Show', [
            'activity' => $activity->load(['user', 'activityType', 'site', 'topic']),
        ]);
    }

    /**
     * Show the form for editing the specified activity
     */
    public function edit(Activity $activity): Response
    {
        // Check if user can access this activity
        if (!$this->activityService->canUserAccessActivity($activity->id)) {
            abort(403, 'You do not have permission to edit this activity.');
        }

        return Inertia::render('Activities/Edit', [
            'activity' => $activity->load(['user', 'activityType', 'site', 'topic']),
        ]);
    }

    /**
     * Update the specified activity
     */
    public function update(ActivityRequest $request, Activity $activity): RedirectResponse
    {
        try {
            // Check if user can access this activity
            if (!$this->activityService->canUserAccessActivity($activity->id)) {
                abort(403, 'You do not have permission to edit this activity.');
            }

            $data = $request->validated();
            
            $updatedActivity = $this->activityService->updateActivity($activity->id, $data);
            
            return redirect()->route('activities.show', $updatedActivity)
                ->with('success', 'Activity updated successfully.');
                
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'An error occurred while updating the activity.'])->withInput();
        }
    }

    /**
     * Remove the specified activity
     */
    public function destroy(Activity $activity): RedirectResponse
    {
        try {
            $this->activityService->deleteActivity($activity->id);
            
            return redirect()->route('activities.index')
                ->with('success', 'Activity deleted successfully.');
                
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'An error occurred while deleting the activity.']);
        }
    }

    /**
     * Restore a soft-deleted activity
     */
    public function restore(Activity $activity): RedirectResponse
    {
        try {
            $this->activityService->restoreActivity($activity->id);
            
            return redirect()->route('activities.show', $activity)
                ->with('success', 'Activity restored successfully.');
                
        } catch (InvalidArgumentException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'An error occurred while restoring the activity.']);
        }
    }

    /**
     * Search activities
     */
    public function search(Request $request): Response
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return Inertia::render('Activities/Search', [
                'activities' => collect(),
                'query' => $query,
                'error' => 'Search query must be at least 2 characters long',
            ]);
        }

        try {
            $activities = $this->activityService->searchActivities($query);
            
            return Inertia::render('Activities/Search', [
                'activities' => $activities,
                'query' => $query,
            ]);
            
        } catch (InvalidArgumentException $e) {
            return Inertia::render('Activities/Search', [
                'activities' => collect(),
                'query' => $query,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get activities for calendar view
     */
    public function calendar(Request $request): Response
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());
        
        try {
            $activities = $this->activityService->getActivitiesForCalendar(
                \Carbon\Carbon::parse($startDate),
                \Carbon\Carbon::parse($endDate)
            );
            
            return Inertia::render('Activities/Calendar', [
                'activities' => $activities,
                'startDate' => $startDate,
                'endDate' => $endDate,
            ]);
            
        } catch (\Exception $e) {
            return Inertia::render('Activities/Calendar', [
                'activities' => collect(),
                'startDate' => $startDate,
                'endDate' => $endDate,
                'error' => 'An error occurred while loading activities.',
            ]);
        }
    }

    /**
     * Get activity statistics
     */
    public function statistics(): Response
    {
        try {
            $stats = $this->activityService->getActivityStatistics();
            
            return Inertia::render('Activities/Statistics', [
                'statistics' => $stats,
            ]);
            
        } catch (\Exception $e) {
            return Inertia::render('Activities/Statistics', [
                'statistics' => [],
                'error' => 'An error occurred while loading statistics.',
            ]);
        }
    }
}
