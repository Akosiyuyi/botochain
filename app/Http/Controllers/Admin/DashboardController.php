<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardViewService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private AdminDashboardViewService $dashboardService
    ) {}

    public function dashboard()
    {
        $data = $this->dashboardService->getDashboardData();

        return Inertia::render('Admin/Dashboard', $data);
    }
}
