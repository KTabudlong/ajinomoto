<?php

namespace App\Http\Controllers;

use App\Models\AdminSettings;
use App\Http\Requests\AdminSettingRequest;
use App\Services\AdminSettingsService;
use Illuminate\Http\RedirectResponse;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AdminSettingsController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private AdminSettingsService $service
    ) {}

    /**
     * Display a listing of admin settings
     */
    public function index(): Response
    {
        $this->authorize('viewAny', AdminSettings::class);
        
        $filters = request()->only(['search', 'sort_by', 'sort_order']);
        $settings = $this->service->getPaginatedWithSearchAndSort($filters);
        
        return Inertia::render('Admin/settings/Index', [
            'settings' => $settings,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new setting
     */
    public function create(): Response
    {
        $this->authorize('create', AdminSettings::class);
        
        return Inertia::render('Admin/settings/Create');
    }

    /**
     * Store a newly created setting
     */
    public function store(AdminSettingRequest $request): RedirectResponse
    {
        $this->authorize('create', AdminSettings::class);
        
        $validated = $request->validated();

        $this->service->create($validated);

        return redirect()->route('admin.super.settings.index')
            ->with('success', $this->service->getSuccessMessage('create'));
    }

    /**
     * Show the form for editing the specified setting
     */
    public function edit(AdminSettings $adminSetting): Response
    {
        $this->authorize('update', $adminSetting);
        
        return Inertia::render('Admin/settings/Edit', [
            'setting' => $adminSetting,
        ]);
    }

    /**
     * Update the specified setting
     */
    public function update(AdminSettingRequest $request, AdminSettings $adminSetting): RedirectResponse
    {
        $this->authorize('update', $adminSetting);
        
        $validated = $request->validated();

        $this->service->update($adminSetting->id, $validated);

        return redirect()->route('admin.super.settings.index')
            ->with('success', $this->service->getSuccessMessage('update'));
    }

    /**
     * Remove the specified setting
     */
    public function destroy(AdminSettings $adminSetting): RedirectResponse
    {
        $this->authorize('delete', $adminSetting);
        
        $this->service->delete($adminSetting->id);

        return redirect()->route('admin.super.settings.index')
            ->with('success', $this->service->getSuccessMessage('delete'));
    }
}
