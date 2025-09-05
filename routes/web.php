<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\BulkUploadController;
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\VoterController;
use Illuminate\Support\Facades\Auth;

Route::redirect('/', '/login');

Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

    // Bulk upload route
    Route::get('students/bulkUpload', [BulkUploadController::class, 'index'])
        ->name('bulk-upload');

    // student resource route
    Route::resource('students', StudentController::class);

    // user resource route
    Route::resource('users', UserController::class);

    // election resource route
    Route::resource('election', ElectionController::class);
});

Route::middleware(['auth', 'verified', 'role:voter'])->group(function () {
    Route::get('/voter/dashboard', [VoterController::class, 'dashboard'])->name('voter.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
