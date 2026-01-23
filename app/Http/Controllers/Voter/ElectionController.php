<?php

namespace App\Http\Controllers\Voter;

use App\Enums\ElectionStatus;
use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Services\ElectionViewService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ElectionController extends Controller
{

    public function __construct(
        protected ElectionViewService $electionViewService,
    )
    {
    }

    /**
     * Display a listing of elections for voters.
     */
    public function index()
    {
        // Reuse service list() then adapt link to voter route and hide Draft from students
        $list = $this->electionViewService->list()
            ->map(function ($item) {
                $item['link'] = route('voter.election.show', ['election' => $item['id']]);
                return $item;
            })
            ->filter(fn($item) => in_array($item['status'], [
                ElectionStatus::Upcoming,
                ElectionStatus::Ongoing,
                ElectionStatus::Finalized,
                ElectionStatus::Compromised,
            ]));

        return Inertia::render('Voter/Election/Election', [
            'elections' => [
                'ongoing'     => $list->filter(fn($e) => $e['status'] === ElectionStatus::Ongoing)->values()->toArray(),
                'upcoming'    => $list->filter(fn($e) => $e['status'] === ElectionStatus::Upcoming)->values()->toArray(),
                'finalized'   => $list->filter(fn($e) => $e['status'] === ElectionStatus::Finalized)->values()->toArray(),
                'compromised' => $list->filter(fn($e) => $e['status'] === ElectionStatus::Compromised)->values()->toArray(),
            ],
        ]);
    }

    /**
     * Display a specific election (read-only for voters).
     */
    public function show(Election $election)
    {
        $payload = $this->electionViewService->forShow($election);

        // Reuse admin payload; voters will consume the same info (positions, schedule, etc.)
        return Inertia::render('Voter/Election/Show', [
            'data' => $payload,
        ]);
    }
}