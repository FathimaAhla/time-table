<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InstituteController;
use App\Http\Controllers\UserActivityController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('playground', 'playground')->name('playground');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware('super_admin')->group(function () {
        Route::get('institutes', [InstituteController::class, 'index'])->name('institutes.index');
        Route::get('users', [UserActivityController::class, 'index'])->name('users.index');
        Route::post('institutes/switch', [InstituteController::class, 'switch'])->name('institutes.switch');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/timetable.php';
