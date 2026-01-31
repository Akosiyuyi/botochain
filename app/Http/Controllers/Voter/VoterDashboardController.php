<?php

namespace App\Http\Controllers\Voter;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class VoterDashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function dashboard(){
        return Inertia::render('Voter/Dashboard');
    }
}
