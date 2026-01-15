<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Vote;
use App\Services\VoteIntegrityService;
use Illuminate\Http\JsonResponse;

class VoteIntegrityController extends Controller
{
    public function __construct(private VoteIntegrityService $integrityService) {}

    /**
     * Verify election integrity (accessible to both admin and voter)
     */
    public function verifyElection(Election $election): JsonResponse
    {
        // Authorization can be handled via policy if needed
        $result = $this->integrityService->verifyElection($election);

        return response()->json($result);
    }

    /**
     * Verify a specific vote (voter-only - verify their own vote)
     */
    public function verifyVote(Election $election, Vote $vote): JsonResponse
    {
        // Authorize that this voter owns this vote
        $this->authorize('view', $vote);

        $result = $this->integrityService->verifyVote($election, $vote);

        return response()->json($result);
    }
}