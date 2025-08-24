<?php

use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\ChirpController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryTypeController;
use App\Http\Controllers\EmailBlastController;
use App\Http\Controllers\EmailBlastTemplateController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderStatusController;
use App\Http\Controllers\PaymentStatusController;
use App\Http\Controllers\ProfileController;

use App\Http\Controllers\RoleController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Main Storefront Route (Public Landing Page)
Route::get('/', function () {
    return Inertia::render('Storefront/Home');
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
| Storefront Routes (Public)
|--------------------------------------------------------------------------
*/
Route::name('storefront.')->group(function () {
    // Teachers
    Route::get('/teachers', function () {
        return Inertia::render('Storefront/Teachers/Index');
    })->name('teachers');

    Route::get('/teachers/{id}', function ($id) {
        return Inertia::render('Storefront/Teachers/Show', ['id' => $id]);
    })->name('teachers.show');

    // Subjects
    Route::get('/storefront/subjects', function () {
        return Inertia::render('Storefront/Subjects/Index');
    })->name('subjects');

    Route::get('/storefront/subjects/{subject}', function ($subject) {
        return Inertia::render('Storefront/Subjects/Show', ['subject' => $subject]);
    })->name('subjects.show');

    // Static Pages
    Route::get('/about', function () {
        return Inertia::render('Storefront/About');
    })->name('about');

    Route::get('/contact', function () {
        return Inertia::render('Storefront/Contact');
    })->name('contact');

    Route::get('/faq', function () {
        return Inertia::render('Storefront/FAQ');
    })->name('faq');

    Route::get('/help', function () {
        return Inertia::render('Storefront/Help');
    })->name('help');

    Route::get('/privacy', function () {
        return Inertia::render('Storefront/Privacy');
    })->name('privacy');

    Route::get('/terms', function () {
        return Inertia::render('Storefront/Terms');
    })->name('terms');


});

/*
|--------------------------------------------------------------------------
| Authenticated Storefront Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->name('storefront.')->group(function () {
    Route::get('/bookings', function () {
        return Inertia::render('Storefront/Bookings/Index');
    })->name('bookings');

    Route::get('/favorites', function () {
        return Inertia::render('Storefront/Favorites');
    })->name('favorites');

    Route::get('/booking/create', function () {
        return Inertia::render('Storefront/Booking/Create');
    })->name('booking.create');

    // Storefront Profile Management (for customers)
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
    });
});

/*
|--------------------------------------------------------------------------
| User Dashboard Routes (Authenticated & Verified)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Chirps (Social Features)
    Route::resource('chirps', ChirpController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});

/*
|--------------------------------------------------------------------------
| Admin Portal Routes (Authenticated, Verified & Admin/Tutor)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth', 'verified', 'admin_or_tutor'])->name('admin.')->group(function () {
    // Redirect /admin to /admin/dashboard
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    // Dashboard (for regular tutors)
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

    // Subject Management
    Route::controller(SubjectController::class)->group(function () {
        Route::get('/subjects', 'index')->name('subjects');
        Route::get('/subjects/create', 'create')->name('subjects.create');
        Route::post('/subjects/store', 'store')->name('subjects.store');
        Route::get('/subjects/{subject}', 'show')->name('subjects.show');
        Route::get('/subjects/{subject}/edit', 'edit')->name('subjects.edit');
        Route::put('/subjects/{subject}', 'update')->name('subjects.update');
        Route::delete('/subjects/{subject}', 'destroy')->name('subjects.destroy');
        Route::put('/subjects/{subject}/restore', 'restore')->name('subjects.restore');
        Route::put('/subjects/{subject}/toggle-active', 'toggleActive')->name('subjects.toggle-active');
        Route::put('/subjects/{subject}/toggle-showcase', 'toggleShowcase')->name('subjects.toggle-showcase');
        Route::get('/api/subjects', 'apiIndex')->name('subjects.api');
    });

    // Topic Management
    Route::controller(TopicController::class)->group(function () {
        Route::get('/my-topics', 'myTopics')->name('topics.my-topics');
        Route::get('/topics', 'index')->name('topics.index');
        Route::get('/subjects/{subject}/topics', 'indexBySubject')->name('topics.by-subject');
        Route::get('/subjects/{subject}/topics/create', 'create')->name('topics.create');
        Route::post('/subjects/{subject}/topics', 'store')->name('topics.store');
        Route::get('/subjects/{subject}/topics/{topic}/edit', 'edit')->name('topics.edit');
        Route::put('/subjects/{subject}/topics/{topic}', 'update')->name('topics.update');
        Route::delete('/subjects/{subject}/topics/{topic}', 'destroy')->name('topics.destroy');
        Route::put('/subjects/{subject}/topics/{topic}/restore', 'restore')->name('topics.restore');
    });

    // Schedule Management
    Route::controller(ScheduleController::class)->group(function () {
        Route::get('/schedules', 'index')->name('schedules');
        Route::get('/schedules/create', 'create')->name('schedules.create');
        Route::post('/schedules/store', 'store')->name('schedules.store');
        Route::get('/schedules/{schedule}/edit', 'edit')->name('schedules.edit');
        Route::put('/schedules/{schedule}', 'update')->name('schedules.update');
        Route::delete('/schedules/{schedule}', 'destroy')->name('schedules.destroy');
        Route::put('/schedules/{schedule}/restore', 'restore')->name('schedules.restore');
    });

    // Order/Booking Management
    Route::controller(OrderController::class)->group(function () {
        Route::get('/bookings', 'index')->name('bookings');
        Route::get('/bookings/create', 'create')->name('bookings.create');
        Route::post('/bookings', 'store')->name('bookings.store');
        Route::get('/bookings/{order}', 'show')->name('bookings.show');
        Route::get('/bookings/{order}/edit', 'edit')->name('bookings.edit');
        Route::put('/bookings/{order}', 'update')->name('bookings.update');
        Route::delete('/bookings/{order}', 'destroy')->name('bookings.destroy');
        Route::put('/bookings/{order}/restore', 'restore')->name('bookings.restore');
        Route::put('/bookings/{order}/cancel', 'cancel')->name('bookings.cancel');
        Route::post('/bookings/{order}/test-cancel-email', 'testCancelEmail')->name('bookings.test-cancel-email');

        // Booking Flow Routes
        Route::get('/bookings/select-subject', 'selectSubject')->name('bookings.select-subject');
        Route::get('/bookings/select-topic/{subject}', 'selectTopic')->name('bookings.select-topic');
        Route::get('/bookings/select-schedule/{subject}/{topic}', 'selectSchedule')->name('bookings.select-schedule');
        Route::post('/bookings/confirm/{subject}/{topic}/{schedule}', 'confirmBooking')->name('bookings.confirm');
    });

    // Group Management
    Route::controller(GroupController::class)->group(function () {
        Route::get('/groups', 'index')->name('groups');
        Route::get('/groups/create', 'create')->name('groups.create');
        Route::post('/groups/store', 'store')->name('groups.store');
        Route::get('/groups/{group}', 'show')->name('groups.show');
        Route::get('/groups/{group}/edit', 'edit')->name('groups.edit');
        Route::put('/groups/{group}', 'update')->name('groups.update');
        Route::delete('/groups/{group}', 'destroy')->name('groups.destroy');
        Route::put('/groups/{group}/restore', 'restore')->name('groups.restore');

        // Group Member Management
        Route::get('/groups/{group}/manage-members', 'manageMembers')->name('groups.manage-members');
        Route::post('/groups/{group}/manage-members', 'storeManageMembers')->name('groups.store-manage-members');
        Route::get('/groups/{group}/manage-members/confirm', 'confirmManageMembers')->name('groups.confirm-manage-members');
        Route::post('/groups/{group}/manage-members/confirm', 'confirmAndManageMembers')->name('groups.confirm-and-manage-members');
    });

    // Email Blast Management
    Route::controller(EmailBlastController::class)->group(function () {
        Route::get('/email-blasts', 'index')->name('email-blasts.index');
        Route::get('/email-blasts/create', 'create')->name('email-blasts.create');
        Route::post('/email-blasts', 'store')->name('email-blasts.store');
        Route::get('/email-blasts/{emailBlast}/recipients', 'recipients')->name('email-blasts.recipients');
        Route::post('/email-blasts/{emailBlast}/recipients', 'storeRecipients')->name('email-blasts.store-recipients');
        Route::get('/email-blasts/{emailBlast}/preview', 'preview')->name('email-blasts.preview');
        Route::post('/email-blasts/{emailBlast}/send', 'send')->name('email-blasts.send');
        Route::get('/email-blasts/{emailBlast}', 'show')->name('email-blasts.show');
        Route::delete('/email-blasts/{emailBlast}', 'destroy')->name('email-blasts.destroy');
    });

    // Email Blast Templates
    Route::controller(EmailBlastTemplateController::class)->group(function () {
        Route::get('/email-blast-templates', 'index')->name('email-blast-templates.index');
        Route::get('/email-blast-templates/create', 'create')->name('email-blast-templates.create');
        Route::post('/email-blast-templates/preview', 'preview')->name('email-blast-templates.preview');
        Route::post('/email-blast-templates', 'store')->name('email-blast-templates.store');
        Route::get('/email-blast-templates/{template}/edit', 'edit')->name('email-blast-templates.edit');
        Route::post('/email-blast-templates/{template}/preview-edit', 'previewEdit')->name('email-blast-templates.preview-edit');
        Route::put('/email-blast-templates/{template}', 'update')->name('email-blast-templates.update');
        Route::delete('/email-blast-templates/{template}', 'destroy')->name('email-blast-templates.destroy');
    });

    // System Configuration
    Route::resource('delivery-types', DeliveryTypeController::class)->except(['show']);
    Route::resource('order-statuses', OrderStatusController::class)->except(['show']);
    Route::resource('payment-statuses', PaymentStatusController::class)->except(['show']);
    Route::resource('roles', RoleController::class);

    // Restore Routes for Soft Deletes
    Route::put('delivery-types/{deliveryType}/restore', [DeliveryTypeController::class, 'restore'])->name('delivery-types.restore');
    Route::put('order-statuses/{order_status}/restore', [OrderStatusController::class, 'restore'])->name('order-statuses.restore');
    Route::put('payment-statuses/{payment_status}/restore', [PaymentStatusController::class, 'restore'])->name('payment-statuses.restore');
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

    // Subjects API
    Route::get('/subjects', [SubjectController::class, 'apiIndex'])->name('subjects');
});

/*
|--------------------------------------------------------------------------
| Include Authentication Routes
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
