<?php

use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Main Route (Public Landing Page) - Redirect to admin login
Route::get('/', function () {
    return redirect()->route('admin.login');
})->name('home');

// Admin Authentication Routes (Public)
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [\App\Http\Controllers\Auth\AdminAuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [\App\Http\Controllers\Auth\AdminAuthenticatedSessionController::class, 'store'])->name('login.store');
    
    Route::get('/register', [\App\Http\Controllers\Auth\AdminRegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [\App\Http\Controllers\Auth\AdminRegisteredUserController::class, 'store'])->name('register.store');
});





/*
|--------------------------------------------------------------------------
| User Dashboard Routes (Authenticated & Verified)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Admin Portal Routes (Authenticated & Verified)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth', 'verified'])->name('admin.')->group(function () {
    // Redirect /admin to /admin/dashboard
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin Profile Management
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
    });

    // Super Admin Routes (super admin only)
    Route::prefix('super')->middleware('can:viewAny,App\\Models\\AdminSettings')->name('super.')->group(function () {
        // Redirect /admin/super to /admin/super/dashboard
        Route::get('/', function () {
            return redirect()->route('admin.super.dashboard');
        });

        // Super Admin Dashboard
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Index');
        })->name('dashboard');

        // Admin Panel Settings (super admin only)
        Route::resource('settings', AdminSettingsController::class)
            ->except(['show'])
            ->parameters(['settings' => 'adminSetting']);
    });

    // User Management
    Route::controller(UserController::class)->group(function () {
        Route::get('/users', 'index')->name('users');
        Route::get('/users/create', 'create')->name('users.create');
        Route::post('/users/store', 'store')->name('users.store');
        Route::get('/users/{user}/edit', 'edit')->name('users.edit');
        Route::put('/users/{user}', 'update')->name('users.update');
        Route::delete('/users/{user}', 'destroy')->name('users.destroy');
        Route::put('/users/{user}/restore', 'restore')->name('users.restore');
    });

    // Topic Management
    Route::controller(TopicController::class)->group(function () {
        Route::get('/topics', 'index')->name('topics');
        Route::get('/topics/create', 'create')->name('topics.create');
        Route::post('/topics', 'store')->name('topics.store');
        Route::get('/topics/{topic}/edit', 'edit')->name('topics.edit');
        Route::put('/topics/{topic}', 'update')->name('topics.update');
        Route::delete('/topics/{topic}', 'destroy')->name('topics.destroy');
        Route::put('/topics/{topic}/restore', 'restore')->name('topics.restore');
    });

    // Schedule Management
    Route::controller(ScheduleController::class)->group(function () {
        Route::get('/schedules', 'index')->name('schedules');
        Route::get('/schedules/create', 'create')->name('schedules.create');
        Route::put('/schedules/{schedule}', 'update')->name('schedules.update');
        Route::delete('/schedules/{schedule}', 'destroy')->name('schedules.destroy');
        Route::put('/schedules/{schedule}/restore', 'restore')->name('schedules.restore');
    });

    // Activity Management
    Route::controller(ActivityController::class)->group(function () {
        Route::get('/activities', 'index')->name('activities');
        Route::get('/activities/create', 'create')->name('activities.create');
        Route::post('/activities', 'store')->name('activities.store');
        Route::get('/activities/{activity}', 'show')->name('activities.show');
        Route::get('/activities/{activity}/edit', 'edit')->name('activities.edit');
        Route::put('/activities/{activity}', 'update')->name('activities.update');
        Route::delete('/activities/{activity}', 'destroy')->name('activities.destroy');
        Route::put('/activities/{activity}/restore', 'restore')->name('activities.restore');
        Route::get('/activities/search', 'search')->name('activities.search');
        Route::get('/activities/calendar', 'calendar')->name('activities.calendar');
        Route::get('/activities/statistics', 'statistics')->name('activities.statistics');
    });

    // Site Management
    Route::controller(\App\Http\Controllers\SiteController::class)->group(function () {
        Route::get('/sites', 'index')->name('sites');
        Route::get('/sites/create', 'create')->name('sites.create');
        Route::post('/sites', 'store')->name('sites.store');
        Route::get('/sites/{site}', 'show')->name('sites.show');
        Route::get('/sites/{site}/edit', 'edit')->name('sites.edit');
        Route::put('/sites/{site}', 'update')->name('sites.update');
        Route::delete('/sites/{site}', 'destroy')->name('sites.destroy');
        Route::put('/sites/{site}/restore', 'restore')->name('sites.restore');
    });

    // Excel Processing
    Route::controller(\App\Http\Controllers\ExcelController::class)->group(function () {
        Route::get('/excel', 'index')->name('excel');
        Route::post('/excel/process', 'process')->name('excel.process');
        Route::post('/excel/preview', 'preview')->name('excel.preview');
        Route::post('/excel/download', 'download')->name('excel.download');
        Route::post('/excel/export-master-excel', 'exportMasterExcel')->name('excel.export-master-excel');
        Route::post('/excel/export-master-csv', 'exportMasterCsv')->name('excel.export-master-csv');
        
        // Test route for debugging calendar export
        Route::get('/excel/test-calendar', 'testCalendarExport')->name('excel.test-calendar');
        
        // Generate Toluca Calendar Export (2025-2030)
        Route::get('/excel/generate-toluca-calendar', 'generateTolucaCalendar')->name('excel.generate-toluca-calendar');
    });
});

/*
|--------------------------------------------------------------------------
| API Routes (Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->prefix('api')->name('api.')->group(function () {
    // Schedule API
    Route::get('/schedules', [ScheduleController::class, 'apiForDate'])->name('schedules.for-date');
    Route::get('/schedules/all', [ScheduleController::class, 'allApi'])->name('schedules.all');
    Route::get('/schedules/range', [ScheduleController::class, 'rangeApi'])->name('schedules.range');

    // Schedule Settings API
    Route::prefix('schedule-settings')->name('schedule-settings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ScheduleSettingsController::class, 'index'])->name('index');
        Route::get('/time-slots', [\App\Http\Controllers\ScheduleSettingsController::class, 'getTimeSlots'])->name('time-slots');
        Route::get('/day-colors', [\App\Http\Controllers\ScheduleSettingsController::class, 'getDayColors'])->name('day-colors');
        Route::get('/day-colors/tailwind', [\App\Http\Controllers\ScheduleSettingsController::class, 'getDayColorsTailwind'])->name('day-colors-tailwind');
        Route::get('/time-format', [\App\Http\Controllers\ScheduleSettingsController::class, 'getTimeFormat'])->name('time-format');
        Route::get('/slot-duration', [\App\Http\Controllers\ScheduleSettingsController::class, 'getSlotDuration'])->name('slot-duration');
        Route::get('/time-buffer', [\App\Http\Controllers\ScheduleSettingsController::class, 'getTimeBuffer'])->name('time-buffer');

        // Update Routes
        Route::put('/time-slots', [\App\Http\Controllers\ScheduleSettingsController::class, 'updateTimeSlots'])->name('update-time-slots');
        Route::put('/day-colors', [\App\Http\Controllers\ScheduleSettingsController::class, 'updateDayColors'])->name('update-day-colors');
        Route::put('/time-format', [\App\Http\Controllers\ScheduleSettingsController::class, 'updateTimeFormat'])->name('update-time-format');
        Route::put('/slot-duration', [\App\Http\Controllers\ScheduleSettingsController::class, 'updateSlotDuration'])->name('update-slot-duration');
        Route::post('/reset-defaults', [\App\Http\Controllers\ScheduleSettingsController::class, 'resetToDefaults'])->name('reset-defaults');
    });
});

/*
|--------------------------------------------------------------------------
| Include Authentication Routes
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
