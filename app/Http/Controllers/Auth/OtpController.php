<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;

class OtpController extends Controller
{
    public function create(Request $request): \Inertia\Response|\Illuminate\Http\RedirectResponse
    {
        if (!session()->has('pre_2fa_user_id')) {
            return redirect()->route('login');
        }

        $userId = $request->session()->get('pre_2fa_user_id');
        $user = User::findOrFail($userId);
        $otp = $user->currentOneTimePassword();

        return Inertia::render('Auth/OtpVerification', [
            'email' => $user->email,
            'expiresAt' => $otp?->expires_at?->timestamp,
        ]);
    }

    /**
     * Handle OTP verification
     */
    public function store(Request $request)
    {
        $request->validate([
            'otp' => ['required', 'string'],
        ]);

        $userId = session('pre_2fa_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::findOrFail($userId);

        $result = $user->consumeOneTimePassword($request->input('otp'));

        if ($result->isOk()) {
            // Finalize login
            Auth::login($user);
            $request->session()->forget('pre_2fa_user_id');
            $request->session()->put('2fa_verified', true);
            $request->session()->regenerate();

            // Role-based redirects
            if ($user->hasAnyRole(['super-admin', 'admin'])) {
                return redirect()->route('admin.dashboard');
            } elseif ($user->hasRole('voter')) {
                return redirect()->route('voter.dashboard');
            }

            return redirect('/');
        }

        return back()->withErrors([
            'otp' => $result->validationMessage(),
        ])->onlyInput('otp');
    }

    public function resend(Request $request)
    {
        $userId = $request->session()->get('pre_2fa_user_id');
        $user = User::findOrFail($userId);

        $user->sendOneTimePassword();
        $otp = $user->currentOneTimePassword();

        return response()->json([
            'expiresAt' => $otp->expires_at->timestamp,
        ]);
    }
}
