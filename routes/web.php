<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\BulkUploadController;
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\LoginLogsController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\VoterController;
use Illuminate\Support\Facades\Auth;

Route::redirect('/', '/login');

    // admin routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'role:admin|super-admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

    // student resource route
    Route::resource('students', StudentController::class);

    // bulk upload resource
    Route::get('/bulk-upload/template', [BulkUploadController::class, 'downloadTemplate'])
        ->name('bulk-upload.template');
    Route::post('/bulk-upload/upload', [BulkUploadController::class, 'upload'])
        ->name('bulk-upload.upload');
    Route::resource('bulk-upload', BulkUploadController::class);

    // user resource route
    Route::resource('users', UserController::class);
    Route::get('/login_logs', [LoginLogsController::class, 'index'])->name('login_logs');

    // election resource route
    Route::resource('election', ElectionController::class);
    Route::resource('election.positions', PositionController::class)->only(['store', 'destroy']);
});

    // voter routes
Route::middleware(['auth', 'verified', 'role:voter'])->group(function () {
    Route::get('/voter/dashboard', [VoterController::class, 'dashboard'])->name('voter.dashboard');
});

    // shared routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
