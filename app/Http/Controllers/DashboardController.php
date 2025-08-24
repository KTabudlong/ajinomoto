<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        // All authenticated users can access the dashboard
        $dashboard = [
            'totalActivities' => 0,
            'totalSites' => 0,
            'activeUsers' => 0,
            'activeTopics' => 0,
            'recentActivity' => [],
        ];

        return Inertia::render('Dashboard/Index', [
            'dashboard' => $dashboard,
            'user' => $user,
        ]);
    }
}
