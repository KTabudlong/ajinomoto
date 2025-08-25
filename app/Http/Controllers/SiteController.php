<?php

namespace App\Http\Controllers;

use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $sites = Site::query()
            ->filter(request()->only('search', 'trashed'))
            ->orderBy('name')
            ->paginate(10)
            ->appends(request()->all());

        return Inertia::render('Sites/Index', [
            'sites' => $sites,
            'filters' => request()->only('search', 'trashed'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Sites/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        Site::create($validated);

        return redirect()->route('admin.sites')->with('success', 'Site created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Site $site): Response
    {
        return Inertia::render('Sites/Show', [
            'site' => $site,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Site $site): Response
    {
        return Inertia::render('Sites/Edit', [
            'site' => $site,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Site $site): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $site->update($validated);

        return redirect()->route('admin.sites')->with('success', 'Site updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Site $site): RedirectResponse
    {
        $site->delete();

        return redirect()->route('admin.sites')->with('success', 'Site deleted successfully.');
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(Site $site): RedirectResponse
    {
        $site->restore();

        return redirect()->route('admin.sites')->with('success', 'Site restored successfully.');
    }
}
