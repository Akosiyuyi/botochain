<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request)
    {
        $step = $request->session()->get('register.step', 1);
        $step1 = $request->session()->get('register.step1', []);
        $step2 = $request->session()->get('register.step2', []);

        return Inertia::render('Auth/Register', [
            'step' => $step,
            'prefill_step1' => $step1,
            'prefill_step2' => $step2,
        ]);
    }


    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
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

        $user->assignRole('voter'); // assign voter role
        event(new Registered($user));
        Auth::login($user);
        session()->forget(['register.step', 'register.step1', 'register.step2']); // delete registration session data
        return redirect(route('voter.dashboard', absolute: false));
    }

    public function back(Request $request)
    {
        $currentStep = $request->session()->get('register.step', 1);
        $previousStep = max(1, $currentStep - 1);

        $request->session()->put('register.step', $previousStep);
        return redirect()->route('register');
    }

    public function validateStep1(Request $request)
    {
        $validated = $request->validate([
            'id_number' => 'required|unique:users,id_number',
            'name' => 'required|unique:users,name',
        ]);

        // Save step and data in session
        $request->session()->put('register.step', 2);
        $request->session()->put('register.step1', $validated);

        // Redirect back to /register
        return redirect()->route('register');
    }

    public function validateStep2(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Save step and data in session
        $request->session()->put('register.step', 3);
        $request->session()->put('register.step2', $validated);

        // Redirect back to /register
        return redirect()->route('register');
    }

}
