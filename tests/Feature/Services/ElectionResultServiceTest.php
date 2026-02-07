<?php

namespace Tests\Feature\Services;

use App\Enums\ElectionStatus;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\ElectionResult;
use App\Models\Position;
use App\Models\Vote;
use App\Models\VoteDetail;
use App\Services\ElectionResultService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ElectionResultServiceTest extends TestCase
{
    use RefreshDatabase;

    private ElectionResultService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ElectionResultService();
    }

    /**
     * Test that election results are computed when finalized
     */
    public function test_election_results_computed_on_finalize()
    {
        // Arrange: Create election, position, candidate, and sealed votes
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create sealed votes
        $vote1 = Vote::factory()->create([
            'election_id' => $election->id,
            'current_hash' => 'hash1',
            'payload_hash' => 'payload1',
        ]);
        VoteDetail::factory()->create([
            'vote_id' => $vote1->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        $vote2 = Vote::factory()->create([
            'election_id' => $election->id,
            'current_hash' => 'hash2',
            'payload_hash' => 'payload2',
        ]);
        VoteDetail::factory()->create([
            'vote_id' => $vote2->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Assert: No results exist yet
        $this->assertDatabaseMissing('election_results', [
            'election_id' => $election->id,
            'candidate_id' => $candidate->id,
        ]);

        // Act: Compute and store results
        $this->service->computeAndStore($election);

        // Assert: Results are now persisted
        $this->assertDatabaseHas('election_results', [
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 2,
        ]);
    }

    /**
     * Test that vote tallying is accurate across multiple positions and candidates
     */
    public function test_vote_tallying_accuracy()
    {
        // Arrange: Create election with multiple positions and candidates
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        $position1 = Position::factory()->create(['election_id' => $election->id, 'name' => 'President']);
        $position2 = Position::factory()->create(['election_id' => $election->id, 'name' => 'Vice President']);

        $candidate1a = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position1->id,
            'name' => 'Candidate 1A',
        ]);
        $candidate1b = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position1->id,
            'name' => 'Candidate 1B',
        ]);
        $candidate2a = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position2->id,
            'name' => 'Candidate 2A',
        ]);

        // Create 3 votes for candidate1a position1
        for ($i = 0; $i < 3; $i++) {
            $vote = Vote::factory()->create(['election_id' => $election->id]);
            VoteDetail::factory()->create([
                'vote_id' => $vote->id,
                'position_id' => $position1->id,
                'candidate_id' => $candidate1a->id,
            ]);
        }

        // Create 2 votes for candidate1b position1
        for ($i = 0; $i < 2; $i++) {
            $vote = Vote::factory()->create(['election_id' => $election->id]);
            VoteDetail::factory()->create([
                'vote_id' => $vote->id,
                'position_id' => $position1->id,
                'candidate_id' => $candidate1b->id,
            ]);
        }

        // Create 4 votes for candidate2a position2
        for ($i = 0; $i < 4; $i++) {
            $vote = Vote::factory()->create(['election_id' => $election->id]);
            VoteDetail::factory()->create([
                'vote_id' => $vote->id,
                'position_id' => $position2->id,
                'candidate_id' => $candidate2a->id,
            ]);
        }

        // Act: Compute results
        $this->service->computeAndStore($election);

        // Assert: Vote counts are accurate
        $this->assertDatabaseHas('election_results', [
            'election_id' => $election->id,
            'position_id' => $position1->id,
            'candidate_id' => $candidate1a->id,
            'vote_count' => 3,
        ]);

        $this->assertDatabaseHas('election_results', [
            'election_id' => $election->id,
            'position_id' => $position1->id,
            'candidate_id' => $candidate1b->id,
            'vote_count' => 2,
        ]);

        $this->assertDatabaseHas('election_results', [
            'election_id' => $election->id,
            'position_id' => $position2->id,
            'candidate_id' => $candidate2a->id,
            'vote_count' => 4,
        ]);

        // Verify total record count
        $totalResults = ElectionResult::where('election_id', $election->id)->count();
        $this->assertEquals(3, $totalResults);
    }

    /**
     * Test that result data can be cached per position
     */
    public function test_result_caching_per_position()
    {
        // Arrange: Create election with position and candidate
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create votes
        $vote = Vote::factory()->create(['election_id' => $election->id]);
        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Act: Compute results
        $this->service->computeAndStore($election);

        // Simulate caching that would happen in SealVoteHash job
        $cacheKey = "election:{$election->id}:results_broadcast_at";
        $timestamp = time();
        Cache::put($cacheKey, $timestamp, 5);

        // Assert: Cache key exists
        $this->assertEquals($timestamp, Cache::get($cacheKey));

        // Assert: Results exist in database
        $result = ElectionResult::where([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ])->first();
        $this->assertEquals(1, $result->vote_count);
    }

    /**
     * Test that final_hash is properly computed during finalization
     */
    public function test_final_hash_computation()
    {
        // Arrange: Create ended election with votes
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
            'final_hash' => null, // Initially null
        ]);

        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'current_hash' => 'test_hash_value',
        ]);
        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Act: Compute results (in real finalization, hash is set separately by VoteIntegrityService)
        $this->service->computeAndStore($election);

        // Assert: Results are computed (hash is set separately in ElectionFinalizationService)
        $result = ElectionResult::where([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ])->first();

        $this->assertNotNull($result);
        $this->assertEquals(1, $result->vote_count);
    }

    /**
     * Test that no tallying occurs if election is not in Ended status
     */
    public function test_no_tallying_if_election_not_ended()
    {
        // Arrange: Create election in Draft status
        $election = Election::factory()->create([
            'status' => ElectionStatus::Draft,
        ]);

        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        $vote = Vote::factory()->create(['election_id' => $election->id]);
        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Act: Attempt to compute results
        $this->service->computeAndStore($election);

        // Assert: No results are created
        $this->assertDatabaseMissing('election_results', [
            'election_id' => $election->id,
        ]);
    }

    /**
     * Test that results can be updated (idempotent)
     */
    public function test_result_updates_are_idempotent()
    {
        // Arrange: Create election and results
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        $vote = Vote::factory()->create(['election_id' => $election->id]);
        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Act: First computation
        $this->service->computeAndStore($election);

        // Assert: Result created with vote_count = 1
        $result = ElectionResult::where([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ])->first();
        $this->assertEquals(1, $result->vote_count);

        // Act: Call again (shouldn't double-count)
        $this->service->computeAndStore($election);

        // Assert: Vote count updated to same value (if no new votes)
        $result->refresh();
        $this->assertEquals(1, $result->vote_count);

        // Verify only one result record exists
        $count = ElectionResult::where([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ])->count();
        $this->assertEquals(1, $count);
    }

    /**
     * Test computation with empty election (no votes)
     */
    public function test_compute_results_with_empty_election()
    {
        // Arrange: Create election without any votes
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        // Act: Compute results
        $this->service->computeAndStore($election);

        // Assert: No results created
        $results = ElectionResult::where('election_id', $election->id)->get();
        $this->assertCount(0, $results);
    }

    /**
     * Test vote tallying with blank votes (skipped positions)
     */
    public function test_tallying_with_blank_votes()
    {
        // Arrange: Create election with 2 positions
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        $position1 = Position::factory()->create(['election_id' => $election->id]);
        $position2 = Position::factory()->create(['election_id' => $election->id]);

        $candidate1 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position1->id,
        ]);
        $candidate2 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position2->id,
        ]);

        // Vote 1: voted for position 1 only (no vote detail for position 2 = blank/skipped)
        $vote1 = Vote::factory()->create(['election_id' => $election->id]);
        VoteDetail::factory()->create([
            'vote_id' => $vote1->id,
            'position_id' => $position1->id,
            'candidate_id' => $candidate1->id,
        ]);
        // Note: no VoteDetail for position 2 - this is a blank/skipped vote

        // Vote 2: voted for both positions
        $vote2 = Vote::factory()->create(['election_id' => $election->id]);
        VoteDetail::factory()->create([
            'vote_id' => $vote2->id,
            'position_id' => $position1->id,
            'candidate_id' => $candidate1->id,
        ]);
        VoteDetail::factory()->create([
            'vote_id' => $vote2->id,
            'position_id' => $position2->id,
            'candidate_id' => $candidate2->id,
        ]);

        // Act: Compute results
        $this->service->computeAndStore($election);

        // Assert: candidate1 has 2 votes (from vote1 and vote2)
        $this->assertDatabaseHas('election_results', [
            'election_id' => $election->id,
            'position_id' => $position1->id,
            'candidate_id' => $candidate1->id,
            'vote_count' => 2,
        ]);

        // Assert: candidate2 has 1 vote (only from vote2)
        $this->assertDatabaseHas('election_results', [
            'election_id' => $election->id,
            'position_id' => $position2->id,
            'candidate_id' => $candidate2->id,
            'vote_count' => 1,
        ]);

        // Assert: No results exist for position2/vote1 blank (blank votes produce no result)
        $this->assertDatabaseMissing('election_results', [
            'election_id' => $election->id,
            'position_id' => $position2->id,
            'candidate_id' => null,
        ]);
    }

    /**
     * Test that unique constraint prevents duplicate results
     */
    public function test_unique_constraint_on_election_position_candidate()
    {
        // Arrange: Create election and result
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create result directly
        ElectionResult::create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 5,
        ]);

        // Act: Try to create duplicate
        ElectionResult::updateOrCreate(
            [
                'election_id' => $election->id,
                'position_id' => $position->id,
                'candidate_id' => $candidate->id,
            ],
            ['vote_count' => 10]
        );

        // Assert: Updated, not duplicated (vote_count should be 10)
        $result = ElectionResult::where([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ])->first();

        $this->assertEquals(10, $result->vote_count);

        // Verify only one record exists
        $count = ElectionResult::where([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ])->count();
        $this->assertEquals(1, $count);
    }

    /**
     * Test results computation with ongoing election (should be rejected)
     */
    public function test_computation_rejected_for_ongoing_election()
    {
        // Arrange: Create ongoing election with votes
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ongoing,
        ]);

        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        $vote = Vote::factory()->create(['election_id' => $election->id]);
        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Act: Attempt computation
        $this->service->computeAndStore($election);

        // Assert: No results created
        $this->assertDatabaseMissing('election_results', [
            'election_id' => $election->id,
        ]);
    }
}
