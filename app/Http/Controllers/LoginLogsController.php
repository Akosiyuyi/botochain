<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\LoginLogs;
use Jenssegers\Agent\Agent;

class LoginLogsController extends Controller
{
    public function index()
    {
        $agent = new Agent();

        $login_logs = LoginLogs::orderByDesc('login_attempt_time')->get()->map(function ($log) use ($agent) {
            // Parse user agent for better readability
            $agent->setUserAgent($log->user_agent);

            return [
                'date' => $log->login_attempt_time->format('M. d, Y'),
                'time' => $log->login_attempt_time->format('h:i:s A'),
                'email' => $log->email,
                'ip_address' => $log->ip_address,
                'device' => $agent->device(),
                'platform' => $agent->platform(),
                'browser' => $agent->browser(),
                'status' => $log->status,
                'reason' => $log->reason,
            ];
        });

        return Inertia::render("Admin/Users/LoginLogs", [
            'login_logs' => $login_logs,
        ]);
    }
}
