<?php
// filepath: /home/huey/botochain/app/Services/AdminDashboardViewService.php

namespace App\Services;

use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\LoginLogs;
use App\Models\Student;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminDashboardViewService
{
    /**
     * Get all dashboard data for admin view
     */
    public function getDashboardData(): array
    {
        return [
            'stats' => $this->getStats(),
            'electionStatusOverview' => $this->getElectionStatusOverview(),
            'recentActivity' => $this->getRecentActivity(),
            'systemStatus' => $this->getSystemStatus(),
            'systemTraffic' => $this->getSystemTraffic(),
        ];
    }

    /**
     * Get general statistics - OPTIMIZED with single query
     */
    private function getStats(): array
    {
        // Single query instead of 5 separate queries
        $stats = DB::table('elections')
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed
            ', [ElectionStatus::Ongoing->value, ElectionStatus::Finalized->value])
            ->first();

        $totalStudents = Student::count();
        $totalVotes = Vote::count();

        return [
            'totalElections' => (int) $stats->total,
            'activeElections' => (int) $stats->active,
            'totalVoters' => $totalStudents,
            'totalVotes' => $totalVotes,
            'completedElections' => (int) $stats->completed,
        ];
    }

    /**
     * Get election status overview - OPTIMIZED with single query
     */
    private function getElectionStatusOverview(): array
    {
        $statuses = Election::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'draft' => $statuses[ElectionStatus::Draft->value] ?? 0,
            'upcoming' => $statuses[ElectionStatus::Upcoming->value] ?? 0,
            'ongoing' => $statuses[ElectionStatus::Ongoing->value] ?? 0,
            'finalized' => $statuses[ElectionStatus::Finalized->value] ?? 0,
            'compromised' => $statuses[ElectionStatus::Compromised->value] ?? 0,
        ];
    }

    /**
     * Get recent activity - OPTIMIZED with better queries
     */
    private function getRecentActivity(): array
    {
        $activities = [];

        // Get recently created elections (single query)
        $recentElections = Election::latest('created_at')
            ->select('title', 'created_at')
            ->take(3)
            ->get()
            ->map(fn($election) => [
                'type' => 'election_created',
                'title' => "{$election->title} created",
                'time' => $election->created_at->diffForHumans(),
                'time_raw' => $election->created_at->timestamp, // sort
                'icon' => '📋',
            ]);

        $activities = array_merge($activities, $recentElections->toArray());

        // Get recent voting activity with single aggregated query
        $votingActivity = DB::table('votes')
            ->join('elections', 'votes.election_id', '=', 'elections.id')
            ->selectRaw('elections.title, COUNT(votes.id) as vote_count, MAX(votes.created_at) as latest_vote')
            ->whereIn('elections.status', [ElectionStatus::Ongoing->value, ElectionStatus::Finalized->value])
            ->groupBy('elections.id', 'elections.title')
            ->having('vote_count', '>', 0)
            ->orderByDesc('latest_vote')
            ->limit(2)
            ->get()
            ->map(function ($record) {
                return [
                    'type' => 'vote_cast',
                    'title' => "{$record->vote_count} votes cast in {$record->title}",
                    'time' => \Carbon\Carbon::parse($record->latest_vote)->diffForHumans(),
                    'time_raw' => \Carbon\Carbon::parse($record->latest_vote)->timestamp, // sort
                    'icon' => '✅',
                ];
            });

        $activities = array_merge($activities, $votingActivity->toArray());

        // Get recently finalized elections (single query)
        $finalizedElections = Election::where('status', ElectionStatus::Finalized)
            ->latest('updated_at')
            ->select('title', 'updated_at')
            ->take(2)
            ->get()
            ->map(fn($election) => [
                'type' => 'election_finalized',
                'title' => "{$election->title} Finalized",
                'time' => $election->updated_at->diffForHumans(),
                'time_raw' => $election->updated_at->timestamp, // sort
                'icon' => '🏁',
            ]);

        $activities = array_merge($activities, $finalizedElections->toArray());

        // Get compromised elections (single query)
        $compromisedElections = Election::where('status', ElectionStatus::Compromised)
            ->latest('updated_at')
            ->select('title', 'updated_at')
            ->take(1)
            ->get()
            ->map(fn($election) => [
                'type' => 'compromised',
                'title' => "Integrity issue detected in {$election->title}",
                'time' => $election->updated_at->diffForHumans(),
                'time_raw' => $election->updated_at->timestamp, // sort
                'icon' => '⚠️',
            ]);

        $activities = array_merge($activities, $compromisedElections->toArray());

        // Return top 10 by recency
        return collect($activities)
            ->sortByDesc(fn($a) => $a['time_raw'])
            ->take(10)
            ->values()
            ->toArray();
    }

    /**
     * Get system status information
     */
    private function getSystemStatus(): array
    {
        // Use exists() instead of count() for boolean checks
        $hasCompromised = Election::where('status', ElectionStatus::Compromised)->exists();
        $activeElections = Election::where('status', ElectionStatus::Ongoing)->count();

        $dbLatencyMs = $this->measureDbLatencyMs();
        $loadAvg = $this->getSystemLoadAvg();
        $queueBacklog = $this->getQueueBacklog();
        $failedJobs = $this->getFailedJobsCount();

        $performanceStatus = $this->evaluatePerformanceStatus($dbLatencyMs, $loadAvg, $queueBacklog, $failedJobs);
        $performanceMessage = $this->buildPerformanceMessage($dbLatencyMs, $loadAvg, $queueBacklog, $failedJobs);

        return [
            'dataIntegrity' => [
                'status' => $hasCompromised ? 'warning' : 'healthy',
                'message' => $hasCompromised ? 'Some elections have integrity issues' : null,
            ],
            'activeElections' => [
                'status' => $activeElections > 0 ? 'active' : 'optimal',
                'message' => $activeElections > 0 ? "{$activeElections} elections running" : null,
            ],
            'systemPerformance' => [
                'status' => $performanceStatus,
                'message' => $performanceMessage,
                'details' => $this->buildPerformanceDetails($dbLatencyMs, $loadAvg, $queueBacklog, $failedJobs),
            ],
            'alerts' => [
                'status' => $this->hasAlerts() ? 'warning' : 'healthy',
                'message' => $this->getAlertMessage(),
            ],
        ];
    }

    private function measureDbLatencyMs(): float
    {
        $start = microtime(true);
        DB::select('SELECT 1');
        return round((microtime(true) - $start) * 1000, 1);
    }

    private function getSystemLoadAvg(): ?float
    {
        if (function_exists('sys_getloadavg')) {
            $loads = sys_getloadavg();
            return isset($loads[0]) ? (float) $loads[0] : null;
        }
        return null;
    }

    private function getQueueBacklog(): ?int
    {
        if (Schema::hasTable('jobs')) {
            return (int) DB::table('jobs')->count();
        }
        return null;
    }

    private function getFailedJobsCount(): ?int
    {
        if (Schema::hasTable('failed_jobs')) {
            return (int) DB::table('failed_jobs')->count();
        }
        return null;
    }

    private function evaluatePerformanceStatus(?float $dbLatencyMs, ?float $loadAvg, ?int $queueBacklog, ?int $failedJobs): string
    {
        $warning = false;
        $active = false;

        if ($failedJobs !== null && $failedJobs > 0)
            $warning = true;
        if ($dbLatencyMs !== null && $dbLatencyMs > 300)
            $warning = true;
        if ($loadAvg !== null && $loadAvg > 3.0)
            $warning = true;
        if ($queueBacklog !== null && $queueBacklog > 100)
            $warning = true;

        if (!$warning) {
            if ($dbLatencyMs !== null && $dbLatencyMs > 150)
                $active = true;
            if ($loadAvg !== null && $loadAvg > 1.5)
                $active = true;
            if ($queueBacklog !== null && $queueBacklog > 0)
                $active = true;
        }

        if ($warning)
            return 'warning';
        if ($active)
            return 'active';
        return 'optimal';
    }

    private function buildPerformanceMessage(?float $dbLatencyMs, ?float $loadAvg, ?int $queueBacklog, ?int $failedJobs): ?string
    {
        $parts = [];
        if ($dbLatencyMs !== null)
            $parts[] = "DB latency {$dbLatencyMs}ms";
        if ($loadAvg !== null)
            $parts[] = "load avg " . number_format($loadAvg, 2);
        if ($queueBacklog !== null)
            $parts[] = "queue {$queueBacklog}";
        if ($failedJobs !== null && $failedJobs > 0)
            $parts[] = "{$failedJobs} failed";

        return count($parts) ? implode(' • ', $parts) : null;
    }

    private function buildPerformanceDetails(?float $dbLatencyMs, ?float $loadAvg, ?int $queueBacklog, ?int $failedJobs): array
    {
        $details = [];
        if ($dbLatencyMs !== null)
            $details[] = "DB latency: {$dbLatencyMs} ms";
        if ($loadAvg !== null)
            $details[] = "Load avg (1m): " . number_format($loadAvg, 2);
        if ($queueBacklog !== null)
            $details[] = "Queue backlog: {$queueBacklog}";
        if ($failedJobs !== null)
            $details[] = "Failed jobs: {$failedJobs}";
        return $details;
    }

    private function hasAlerts(): bool
    {
        return Election::where('status', ElectionStatus::Draft)
            ->where('created_at', '<', now()->subDays(7))
            ->exists() ||
            Election::where('status', ElectionStatus::Compromised)->exists();
    }

    private function getAlertMessage(): ?string
    {
        $draftCount = Election::where('status', ElectionStatus::Draft)
            ->where('created_at', '<', now()->subDays(7))
            ->count();

        $compromisedCount = Election::where('status', ElectionStatus::Compromised)->count();

        if ($compromisedCount > 0) {
            return "{$compromisedCount} election(s) compromised";
        }

        if ($draftCount > 0) {
            return "{$draftCount} draft election(s) need attention";
        }

        return null;
    }

    /**
     * Get system traffic data (last 24 hours) - OPTIMIZED with raw SQL
     */
    private function getSystemTraffic(): array
    {
        $hoursAgo = 24;
        $votesPerHour = [];
        $activeUsersPerHour = [];
        $labels = [];

        // Use raw SQL for better performance - single query for all hours
        $voteData = DB::table('votes')
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m-%d %H:00:00") as hour, COUNT(*) as vote_count')
            ->where('created_at', '>=', now()->subHours($hoursAgo)->startOfHour())
            ->groupByRaw('DATE_FORMAT(created_at, "%Y-%m-%d %H:00:00")')
            ->orderBy('hour')
            ->pluck('vote_count', 'hour')
            ->toArray();

        // Use LoginLogs model for cleaner query
        $loginData = LoginLogs::selectRaw('DATE_FORMAT(login_attempt_time, "%Y-%m-%d %H:00:00") as hour, COUNT(DISTINCT email) as user_count')
            ->where('status', true)
            ->where('login_attempt_time', '>=', now()->subHours($hoursAgo)->startOfHour())
            ->groupByRaw('DATE_FORMAT(login_attempt_time, "%Y-%m-%d %H:00:00")')
            ->orderBy('hour')
            ->pluck('user_count', 'hour')
            ->toArray();

        // Build arrays for each hour
        for ($i = $hoursAgo - 1; $i >= 0; $i--) {
            $hourStart = now()->subHours($i)->startOfHour();
            $hourKey = $hourStart->format('Y-m-d H:00:00');
            $hourLabel = $hourStart->format('H:00');

            $votesPerHour[] = $voteData[$hourKey] ?? 0;
            $activeUsersPerHour[] = $loginData[$hourKey] ?? 0;
            $labels[] = $hourLabel;
        }

        // Calculate metrics
        $maxVotes = max($votesPerHour);
        $peakIndex = array_search($maxVotes, $votesPerHour);
        $peakTime = $peakIndex !== false ? $labels[$peakIndex] : null;

        $currentVotes = end($votesPerHour);
        $avgVotes = array_sum($votesPerHour) / count($votesPerHour);

        if ($currentVotes > $avgVotes * 1.5) {
            $currentLoad = 'high';
        } elseif ($currentVotes > $avgVotes * 0.5) {
            $currentLoad = 'medium';
        } else {
            $currentLoad = 'low';
        }

        return [
            'labels' => $labels,
            'votesPerHour' => $votesPerHour,
            'activeUsersPerHour' => $activeUsersPerHour,
            'peakTime' => $peakTime,
            'currentLoad' => $currentLoad,
            'totalVotes24h' => array_sum($votesPerHour),
            'peakVotes' => $maxVotes,
        ];
    }
}