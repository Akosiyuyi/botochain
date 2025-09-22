<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Auth\Events\Registered;
use App\Rules\UniqueAdminName;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:create_admin')->only(['create', 'store']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // all users list
        $users = User::with('roles:id,name')->get();

        return Inertia::render("Admin/Users/UserManagement", [
            'users' => $users,
            'stats' => $this->usersStatsCount(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Users/CreateAdminModal');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', new UniqueAdminName],
            'id_number' => 'required|string|unique:users',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);


        $user = User::create([
            'name' => $request->name,
            'id_number' => $request->id_number,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => true,
        ]);
        $user->assignRole('admin');

        event(new Registered($user));

        return redirect()->route('admin.users.index')
            ->with('success', 'Admin created successfully!');
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
