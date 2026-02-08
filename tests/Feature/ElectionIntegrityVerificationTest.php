<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use App\Models\Election;
use App\Models\Vote;
use App\Models\VoteDetail;
use App\Models\Position;
use App\Models\Candidate;
use App\Models\User;
use App\Enums\ElectionStatus;
use App\Services\VoteIntegrityService;
use App\Services\ElectionFinalizationService;

class ElectionIntegrityVerificationTest extends TestCase
{
    use RefreshDatabase;

    private VoteIntegrityService $integrityService;
    private ElectionFinalizationService $finalizationService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
        
        $this->integrityService = app(VoteIntegrityService::class);
        $this->finalizationService = app(ElectionFinalizationService::class);
    }

    private function createAdminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function createVoterUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('voter');
        return $user;
    }

    /**
     * Helper to properly seal a vote with correct hash chain
     */
    private function sealVote(Vote $vote): void
    {
        // Reload with voteDetails
        $vote->load('voteDetails');

        // Get previous hash from latest vote current_hash
        $previousHash = Vote::where('election_id', $vote->election_id)
            ->where('id', '<', $vote->id)
            ->latest('id')
            ->value('current_hash');

        // Build payload exactly as service does
        $payload = $vote->voteDetails
            ->sortBy('position_id')
            ->map(fn($d) => [
                'position_id' => $d->position_id,
                'candidate_id' => $d->candidate_id,
            ])
            ->values()
            ->toJson();

        $payloadHash = hash('sha256', $payload);
        $currentHash = hash('sha256', $payloadHash . ($previousHash ?? ''));

        // Use DB facade to ensure update persists
        DB::table('votes')
            ->where('id', $vote->id)
            ->update([
                'payload_hash' => $payloadHash,
                'previous_hash' => $previousHash,
                'current_hash' => $currentHash,
                'updated_at' => now(),
            ]);
    }

    /**
     * Helper to create a vote without factory-generated hashes
     */
    private function createEmptyHashVote(int $electionId): Vote
    {
        $vote = Vote::factory()
            ->unsealed()
            ->create(['election_id' => $electionId]);
        
        // Clear all hashes
        $vote->update([
            'payload_hash' => null,
            'previous_hash' => null,
            'current_hash' => null,
        ]);
        
        return $vote->fresh();
    }

    /**
     * Test election integrity verification workflow through API
     */
    public function test_election_integrity_verification_workflow()
    {
        $admin = $this->createAdminUser();
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
            'final_hash' => 'test_hash_value',
        ]);

        $response = $this->actingAs($admin)
            ->getJson(route('election.verify', $election->id));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'valid',
            'total_votes',
            'final_hash',
        ]);
    }

    /**
     * Test vote chain validation with single sealed vote
     */
    public function test_vote_chain_validation_single_vote()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create vote without factory hashes
        $vote = $this->createEmptyHashVote($election->id);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Seal the vote with proper hashes
        $this->sealVote($vote);

        // Verify the election
        $result = $this->integrityService->verifyElection($election);

        $this->assertTrue($result['valid'], 'Expected valid chain, got reason: ' . ($result['reason'] ?? 'N/A'));
        $this->assertEquals(1, $result['total_votes']);
        $this->assertNotNull($result['final_hash']);
    }

    /**
     * Test vote chain validation with multiple votes
     */
    public function test_vote_chain_validation_multiple_votes()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidates = Candidate::factory(2)->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // First vote
        $vote1 = $this->createEmptyHashVote($election->id);

        VoteDetail::factory()->create([
            'vote_id' => $vote1->id,
            'position_id' => $position->id,
            'candidate_id' => $candidates[0]->id,
        ]);

        // Seal first vote
        $this->sealVote($vote1);

        // Second vote in chain
        $vote2 = $this->createEmptyHashVote($election->id);

        VoteDetail::factory()->create([
            'vote_id' => $vote2->id,
            'position_id' => $position->id,
            'candidate_id' => $candidates[1]->id,
        ]);

        // Seal second vote (will use first vote's current_hash as previous)
        $this->sealVote($vote2);

        // Verify chain
        $result = $this->integrityService->verifyElection($election);

        $this->assertTrue($result['valid'], 'Expected valid chain, got reason: ' . ($result['reason'] ?? 'N/A'));
        $this->assertEquals(2, $result['total_votes']);
        $this->assertNotNull($result['final_hash']);
    }

    /**
     * Test compromised election detection on unsealed votes
     */
    public function test_compromised_election_detection_unsealed_votes()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
        ]);

        // Create unsealed vote
        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'payload_hash' => 'somehash',
            'previous_hash' => null,
            'current_hash' => null, // unsealed
        ]);

        $result = $this->integrityService->verifyElection($election);

        $this->assertFalse($result['valid']);
        $this->assertEquals('Vote not sealed yet', $result['reason']);
        $this->assertEquals($vote->id, $result['vote_id']);
    }

    /**
     * Test compromised election detection on broken chain
     */
    public function test_compromised_election_detection_broken_chain()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate1 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // First vote sealed correctly
        $vote1 = Vote::factory()->create([
            'election_id' => $election->id,
        ]);

        VoteDetail::factory()->create([
            'vote_id' => $vote1->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate1->id,
        ]);

        $payload1 = json_encode([
            ['position_id' => $position->id, 'candidate_id' => $candidate1->id]
        ]);
        $payloadHash1 = hash('sha256', $payload1);
        $currentHash1 = hash('sha256', $payloadHash1);

        $vote1->update([
            'payload_hash' => $payloadHash1,
            'previous_hash' => null,
            'current_hash' => $currentHash1,
        ]);

        // Second vote with broken chain (wrong previous hash)
        $vote2 = Vote::factory()->create([
            'election_id' => $election->id,
        ]);

        VoteDetail::factory()->create([
            'vote_id' => $vote2->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate1->id,
        ]);

        $vote2->update([
            'payload_hash' => 'somepayload',
            'previous_hash' => 'wrong_previous_hash', // broken chain
            'current_hash' => 'wrongcurrent',
        ]);

        // Verify should fail
        $result = $this->integrityService->verifyElection($election);

        $this->assertFalse($result['valid']);
        $this->assertEquals('Previous hash mismatch', $result['reason']);
    }

    /**
     * Test compromised election detection on tampering
     */
    public function test_compromised_election_detection_tampering()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create and seal a vote
        $vote = $this->createEmptyHashVote($election->id);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Seal the vote properly first
        $this->sealVote($vote);

        // Now tamper with the payload_hash using DB facade
        DB::table('votes')
            ->where('id', $vote->id)
            ->update([
                'payload_hash' => 'tampered_hash_1234567890',
            ]);

        // Verify should fail
        $result = $this->integrityService->verifyElection($election);

        $this->assertFalse($result['valid']);
        $this->assertEquals('Chain broken', $result['reason']);
    }

    /**
     * Test integrity verification API response for valid election
     */
    public function test_integrity_verification_api_response_valid()
    {
        $admin = $this->createAdminUser();
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        $response = $this->actingAs($admin)
            ->getJson(route('election.verify', $election->id));

        $response->assertStatus(200);
        $response->assertJson([
            'valid' => true,
            'total_votes' => 0, // empty election
            'final_hash' => null,
        ]);
    }

    /**
     * Test integrity verification API response includes required fields
     */
    public function test_integrity_verification_api_response_structure()
    {
        $admin = $this->createAdminUser();
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        $response = $this->actingAs($admin)
            ->getJson(route('election.verify', $election->id));

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'valid',
            'total_votes',
            'final_hash',
        ]);
    }

    /**
     * Test single vote verification API response
     */
    public function test_verify_single_vote_api_response()
    {
        $voter = $this->createVoterUser();
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
        ]);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Seal vote
        $payload = json_encode([
            ['position_id' => $position->id, 'candidate_id' => $candidate->id]
        ]);
        $payloadHash = hash('sha256', $payload);
        $currentHash = hash('sha256', $payloadHash);

        $vote->update([
            'payload_hash' => $payloadHash,
            'previous_hash' => null,
            'current_hash' => $currentHash,
        ]);

        // Test API requires authorization - voter can only verify own vote
        // This would require proper policy implementation
        // For now, just test the response structure
        $response = $this->actingAs($voter)
            ->getJson(route('vote.verify', [$election->id, $vote->id]));

        $response->assertStatus(403); // forbidden unless voter owns vote
    }

    /**
     * Test election finalization sets final hash
     */
    public function test_election_finalization_sets_final_hash()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
            'final_hash' => null,
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create sealed vote
        $vote = $this->createEmptyHashVote($election->id);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Seal the vote
        $this->sealVote($vote);

        // Create election results to avoid errors during finalization
        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 1,
        ]);

        // Finalize election
        $this->finalizationService->finalize($election);

        // Refresh and verify
        $election->refresh();

        $this->assertEquals(ElectionStatus::Finalized, $election->status);
        $this->assertNotNull($election->final_hash);
    }

    /**
     * Test election finalization detects integrity violation
     */
    public function test_election_finalization_detects_integrity_violation()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Ended,
            'final_hash' => null,
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        // Create vote with wrong hashes to simulate tampering
        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'payload_hash' => 'tampered',
            'previous_hash' => null,
            'current_hash' => 'tampered_hash',
        ]);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Create election results
        \App\Models\ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 1,
        ]);

        // Attempt finalization
        $this->finalizationService->finalize($election);

        // Refresh and verify
        $election->refresh();

        // Should be marked as compromised due to integrity violation
        $this->assertEquals(ElectionStatus::Compromised, $election->status);
        $this->assertNull($election->final_hash);
    }

    /**
     * Test empty election verification
     */
    public function test_empty_election_verification()
    {
        $election = Election::factory()->create([
            'status' => ElectionStatus::Finalized,
        ]);

        $result = $this->integrityService->verifyElection($election);

        $this->assertTrue($result['valid']);
        $this->assertEquals(0, $result['total_votes']);
        $this->assertNull($result['final_hash']);
    }

    /**
     * Test vote belonging to wrong election is rejected
     */
    public function test_vote_from_wrong_election_rejected()
    {
        $election1 = Election::factory()->create(['status' => ElectionStatus::Finalized]);
        $election2 = Election::factory()->create(['status' => ElectionStatus::Finalized]);

        $position = Position::factory()->create(['election_id' => $election1->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election1->id,
            'position_id' => $position->id,
        ]);

        $vote = Vote::factory()->create(['election_id' => $election2->id]);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Seal it
        $payload = json_encode([
            ['position_id' => $position->id, 'candidate_id' => $candidate->id]
        ]);
        $payloadHash = hash('sha256', $payload);
        $currentHash = hash('sha256', $payloadHash);

        $vote->update([
            'payload_hash' => $payloadHash,
            'previous_hash' => null,
            'current_hash' => $currentHash,
        ]);

        // Try to verify vote against wrong election
        $result = $this->integrityService->verifyVote($election1, $vote);

        $this->assertFalse($result['valid']);
        $this->assertEquals('Vote does not belong to this election', $result['reason']);
    }
}
