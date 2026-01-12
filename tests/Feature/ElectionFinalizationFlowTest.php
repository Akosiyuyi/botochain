<?php

namespace Tests\Feature;

use App\Enums\ElectionStatus;
use App\Jobs\FinalizeElection;
use App\Models\Election;
use App\Models\Position;
use App\Models\Candidate;
use App\Models\Vote;
use App\Models\VoteDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ElectionFinalizationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_finalizes_an_ended_election_and_computes_results()
    {
        $mock = $this->createMock(\App\Services\VoteIntegrityService::class);
        $mock->method('verifyElection')->willReturn([
            'valid' => true,
            'final_hash' => 'testhash',
        ]);

        $this->app->instance(\App\Services\VoteIntegrityService::class, $mock);


        $election = Election::factory()->ended()->create([
            'finalized_at' => null,
        ]);

        $position = Position::factory()->create();
        $candidate = Candidate::factory()->create();

        // Create a sealed vote
        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'current_hash' => 'sealedhash',
        ]);

        VoteDetail::create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        $this->assertEquals(1, $election->votes()->count());

        // Act
        FinalizeElection::dispatchSync();

        // Assert
        $election->refresh();
        $this->assertEquals(ElectionStatus::Finalized, $election->status);
        $this->assertEquals('testhash', $election->final_hash);
        $this->assertNotNull($election->finalized_at);

        $this->assertDatabaseHas('election_results', [
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 1,
        ]);
    }

    public function test_it_marks_election_as_compromised_if_vote_integrity_fails()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
            'finalized_at' => null,
        ]);

        // Create a vote with missing current_hash (unsealed)
        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'payload_hash' => 'hash1',
            'previous_hash' => null,
            'current_hash' => null, // unsealed
        ]);

        // Act
        FinalizeElection::dispatchSync();

        // Assert: election remains Ended (because unsealed votes exist)
        $election->refresh();
        $this->assertEquals(ElectionStatus::Ended, $election->status);

        // Now simulate compromised vote
        $vote->update(['current_hash' => 'wrong']);
        FinalizeElection::dispatchSync();

        $election->refresh();
        $this->assertEquals(ElectionStatus::Compromised, $election->status);
    }

    public function test_it_skips_if_election_is_not_ended()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ongoing,
            'finalized_at' => null,
        ]);

        FinalizeElection::dispatchSync();

        $election->refresh();
        $this->assertEquals(ElectionStatus::Ongoing, $election->status);
        $this->assertNull($election->finalized_at);
    }

    public function test_it_skips_if_unsealed_votes_exist()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
            'finalized_at' => null,
        ]);

        // Create an unsealed vote (current_hash = null)
        Vote::factory()->create([
            'election_id' => $election->id,
            'current_hash' => null,
        ]);

        FinalizeElection::dispatchSync();

        $election->refresh();
        $this->assertEquals(ElectionStatus::Ended, $election->status);
        $this->assertNull($election->finalized_at);
    }

    public function test_it_processes_multiple_elections_correctly()
    {
        // Mock integrity service to always pass
        $mock = $this->createMock(\App\Services\VoteIntegrityService::class);
        $mock->method('verifyElection')->willReturn(['valid' => true, 'final_hash' => 'testhash']);
        $this->app->instance(\App\Services\VoteIntegrityService::class, $mock);

        $validElection = Election::factory()->create([
            'status' => ElectionStatus::Ended,
            'finalized_at' => null,
        ]);

        $compromisedElection = Election::factory()->create([
            'status' => ElectionStatus::Ended,
            'finalized_at' => null,
        ]);

        // Valid election gets a sealed vote
        Vote::factory()->create([
            'election_id' => $validElection->id,
            'current_hash' => 'sealedhash',
        ]);

        // Compromised election gets an unsealed vote
        Vote::factory()->create([
            'election_id' => $compromisedElection->id,
            'current_hash' => null,
        ]);

        FinalizeElection::dispatchSync();

        $validElection->refresh();
        $compromisedElection->refresh();

        $this->assertEquals(ElectionStatus::Finalized, $validElection->status);
        $this->assertEquals(ElectionStatus::Ended, $compromisedElection->status); // skipped due to unsealed
    }
}
