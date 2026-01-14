<?php

namespace Tests\Unit\Models;

use App\Enums\ElectionStatus;
use App\Models\Election;
use App\Models\ElectionResult;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ElectionResultModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_update_result_if_election_finalized()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        [$position, $candidate] = $this->createPositionWithCandidate($election);

        $result = ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 10,
        ]);

        $updated = $result->update(['vote_count' => 20]);

        $this->assertFalse($updated, 'Update should be blocked when election is finalized');
        $this->assertEquals(10, $result->fresh()->vote_count);
    }

    public function test_cannot_delete_result_if_election_finalized()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        [$position, $candidate] = $this->createPositionWithCandidate($election);

        $result = ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 10,
        ]);

        $deleted = $result->delete();

        $this->assertFalse($deleted, 'Delete should be blocked when election is finalized');
        $this->assertDatabaseHas('election_results', ['id' => $result->id]);
    }

    public function test_can_update_or_delete_if_election_not_finalized()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        [$position, $candidate] = $this->createPositionWithCandidate($election);

        $result = ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 10,
        ]);

        $updated = $result->update(['vote_count' => 20]);
        $this->assertTrue($updated);
        $this->assertEquals(20, $result->fresh()->vote_count);

        $deleted = $result->delete();
        $this->assertTrue($deleted);
        $this->assertDatabaseMissing('election_results', ['id' => $result->id]);
    }

    private function createPositionWithCandidate(Election $election)
    {
        $position = \App\Models\Position::factory()->create(['election_id' => $election->id]);
        $candidate = \App\Models\Candidate::factory()->create(['election_id' => $election->id]);

        return [$position, $candidate];
    }
}
