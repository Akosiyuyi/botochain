<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\BulkUploadController;
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\LoginLogsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PartylistController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VoterController;

Route::redirect('/', '/login');

// register steps routes
Route::post('/register/step2', [RegisteredUserController::class, 'validateStep2'])->name('register.step2');
Route::post('/register/step1', [RegisteredUserController::class, 'validateStep1'])->name('register.step1');
Route::post('/register/back', [RegisteredUserController::class, 'back'])->name('register.back');


// admin routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'verified', 'role:admin|super-admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

    // student resource route
    Route::get('/students/showConfirmUnenroll', [StudentController::class, 'showConfirmUnenroll'])
        ->name('students.showConfirmUnenroll');
    Route::patch('/students/unenrollAll', [StudentController::class, 'unenrollAll'])
        ->name('students.unenrollAll');
    Route::resource('students', StudentController::class);


    // bulk upload resource
    Route::get('/bulk-upload/template', [BulkUploadController::class, 'downloadTemplate'])
        ->name('bulk-upload.template');
    Route::post('/bulk-upload/stage', [BulkUploadController::class, 'stage'])
        ->name('bulk-upload.stage');
    Route::resource('bulk-upload', BulkUploadController::class);


    // user resource route
    Route::resource('users', UserController::class);
    Route::get('/login_logs', [LoginLogsController::class, 'index'])->name('login_logs');


    // election resource route
    Route::resource('election', ElectionController::class);
    Route::resource('election.positions', PositionController::class);
    Route::resource('election.partylists', PartylistController::class);
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
