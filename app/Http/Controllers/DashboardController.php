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
        $selectedTutorId = null;
        $tutors = [];
        $selectedTutor = null;

        if ($user->role_id === 1) { // Super admin
            $tutors = User::where('role_id', 2)
                ->orderBy('last_name')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'email']);
            $selectedTutorId = request('tutor_id') ?: ($tutors->first()?->id ?? null);
            $selectedTutor = $tutors->firstWhere('id', $selectedTutorId);
        } elseif ($user->role_id === 2) { // Tutor
            $selectedTutorId = $user->id;
            $selectedTutor = $user;
        }

        // Example/mock data, but could be made dynamic per tutor
        $dashboard = [
            'totalBookings' => 0,
            'totalRevenue' => 0,
            'activeTutors' => 0,
            'activeCustomers' => 0,
            'recentActivity' => [],
        ];

        return Inertia::render('Dashboard/Index', [
            'dashboard' => $dashboard,
            'tutors' => $tutors,
            'selectedTutorId' => $selectedTutorId,
            'selectedTutor' => $selectedTutor,
        ]);
    }
}
