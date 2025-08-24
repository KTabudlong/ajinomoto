<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::controller(RegistrationController::class)->group(function () {
        Route::get('/register', 'show')->name('register');
        Route::post('/register/start', 'start')->name('register.start');
        Route::post('/register/verify', 'verify')->name('register.verify');
        Route::post('/register/complete-profile', 'completeProfile')->name('register.complete-profile');
        Route::post('/register/resend-verification', 'resendVerification')->name('register.resend-verification');
    });

    Route::controller(AuthenticatedSessionController::class)->group(function () {
        Route::get('login', 'create')->name('login');
        Route::post('login', 'store')->name('login.store');
    });

    Route::controller(PasswordResetLinkController::class)->group(function () {
        Route::get('forgot-password', 'create')->name('password.request');
        Route::post('forgot-password', 'store')->name('password.email');
    });

    Route::controller(NewPasswordController::class)->group(function () {
        Route::get('reset-password/{token}', 'create')->name('password.reset');
        Route::post('reset-password', 'store')->name('password.store'); 
    });
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::controller(ConfirmablePasswordController::class)->group(function () {
        Route::get('confirm-password', 'show')->name('password.confirm');
        Route::post('confirm-password', 'store');
    });

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::delete('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
