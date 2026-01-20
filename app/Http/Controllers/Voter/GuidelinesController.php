<?php

namespace App\Http\Controllers\Voter;

use Inertia\Inertia;
use App\Http\Controllers\Controller;

class GuidelinesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Voter/Guidelines');
    }
}
