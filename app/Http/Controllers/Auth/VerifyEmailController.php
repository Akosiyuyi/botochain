<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        // Determine redirect route based on user role
        $dashboardRoute = $user->hasRole('admin') || $user->hasRole('super-admin') 
            ? 'admin.dashboard' 
            : 'voter.dashboard';
        
        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route($dashboardRoute, absolute: false).'?verified=1');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->intended(route($dashboardRoute, absolute: false).'?verified=1');
    }
}
