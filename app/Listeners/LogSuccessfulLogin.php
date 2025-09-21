<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Models\LoginLogs;
use Illuminate\Support\Facades\Request;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class LogSuccessfulLogin
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        LoginLogs::create([
            'email'        => $event->user->email,
            'ip_address'   => Request::ip(),
            'user_agent'   => Request::header('User-Agent'),
            'status'       => true,
            'reason'       => 'Login successful',
            'login_attempt_time' => now(),
        ]);
    }
}
