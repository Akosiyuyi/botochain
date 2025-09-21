<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // all users list
        $users = User::with('roles:id,name')->get();

        return Inertia::render("Admin/UserManagement", [
            'users' => $users,
            'stats' => $this->usersStatsCount(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function usersStatsCount()
    {
        return [
            [
                'title' => 'All Users',
                'value' => User::count(),
                'color' => 'blue',
            ],
            [
                'title' => 'All Voters',
                'value' => User::whereHas('roles', fn($q) => $q->where('name', 'voter'))->count(),
                'color' => 'green',
            ],
            [
                'title' => 'All Admins',
                'value' => User::whereHas('roles', fn($q) => $q->whereIn('name', ['admin', 'super-admin']))->count(),
                'color' => 'yellow',
            ],
            [
                'title' => 'Deactivated Users',
                'value' => User::where('is_active', false)->count(),
                'color' => 'red',
            ],
        ];
    }
}
