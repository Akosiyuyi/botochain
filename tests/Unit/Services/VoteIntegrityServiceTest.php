<?php

namespace Tests\Unit\Services;

use App\Models\Candidate;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\Vote;
use App\Models\VoteDetail;
use App\Services\VoteIntegrityService;
use App\Models\Position;

class VoteIntegrityServiceTest extends TestCase
{
    use RefreshDatabase;

    private VoteIntegrityService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new VoteIntegrityService();
    }

    public function test_it_returns_valid_for_empty_election()
    {
        $election = Election::factory()->create();

        $result = $this->service->verifyElection($election);

        $this->assertTrue($result['valid']);
        $this->assertEquals(0, $result['total_votes']);
        $this->assertNull($result['final_hash']);
    }

    public function test_it_detects_unsealed_vote()
    {
        $election = Election::factory()->create();

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'payload_hash' => 'dummyhash',   // ensure payload_hash is set
            'previous_hash' => null,          // first vote in chain
            'current_hash' => null,          // unsealed
        ]);

        $result = $this->service->verifyElection($election);

        $this->assertFalse($result['valid']);
        $this->assertEquals($vote->id, $result['vote_id']);
        $this->assertEquals('Vote not sealed yet', $result['reason']);
    }


    public function test_it_verifies_a_valid_vote_chain()
    {
        $election = Election::factory()->create();
        [$vote, $position, $candidate] = $this->createVoteWithDetail($election);


        $payload = json_encode([['position_id' => $position->id, 'candidate_id' => $candidate->id]]);
        $payloadHash = hash('sha256', $payload);
        $currentHash = hash('sha256', $payloadHash);

        $vote->update([
            'payload_hash' => $payloadHash,
            'previous_hash' => null,
            'current_hash' => $currentHash,
        ]);

        $result = $this->service->verifyElection($election);

        $this->assertTrue($result['valid']);
        $this->assertEquals(1, $result['total_votes']);
        $this->assertEquals($currentHash, $result['final_hash']);
    }

    public function test_it_verifies_a_single_vote_and_detects_mismatch()
    {
        $election = Election::factory()->create();
        [$vote] = $this->createVoteWithDetail($election);

        // Seal with wrong hash to simulate tampering
        $vote->update([
            'payload_hash' => 'tampered',
            'previous_hash' => null,
            'current_hash' => 'wrong',
        ]);

        $result = $this->service->verifyVote($election, $vote);

        $this->assertFalse($result['valid']);
        $this->assertEquals('Payload hash mismatch', $result['reason']);
    }

    public function test_it_verifies_multiple_votes_chained_together()
    {
        $election = Election::factory()->create();

        // --- First vote --- 
        [$vote1, $position1, $candidate1] = $this->createVoteWithDetail($election);


        $payload1 = json_encode([
            ['position_id' => $position1->id, 'candidate_id' => $candidate1->id]
        ]);

        $payloadHash1 = hash('sha256', $payload1);
        $currentHash1 = hash('sha256', $payloadHash1);
        $vote1->update(
            [
                'payload_hash' => $payloadHash1,
                'previous_hash' => null,
                'current_hash' => $currentHash1,
            ]
        );


        // --- Second vote --- 
        [$vote2, $position2, $candidate2] = $this->createVoteWithDetail($election);


        $payload2 = json_encode([
            [
                'position_id' => $position2->id,
                'candidate_id' => $candidate2->id,
            ]
        ]);
        $payloadHash2 = hash('sha256', $payload2);
        $currentHash2 = hash('sha256', $payloadHash2 . $currentHash1);
        $vote2->update([
            'payload_hash' => $payloadHash2,
            'previous_hash' => $currentHash1,
            'current_hash' => $currentHash2,
        ]);


        // Verify election chain 
        $result = $this->service->verifyElection($election);
        $this->assertTrue($result['valid']);
        $this->assertEquals(2, $result['total_votes']);
        $this->assertEquals($currentHash2, $result['final_hash']);
    }

    public function test_it_detects_chain_break_in_multiple_votes()
    {
        $election = Election::factory()->create();

        [$vote1, $position1, $candidate1] = $this->createVoteWithDetail($election);

        $payload1 = json_encode([
            ['position_id' => $position1->id, 'candidate_id' => $candidate1->id]
        ]);
        $payloadHash1 = hash('sha256', $payload1);
        $currentHash1 = hash('sha256', $payloadHash1);

        $vote1->update([
            'payload_hash' => $payloadHash1,
            'previous_hash' => null,
            'current_hash' => $currentHash1,
        ]);

        // Second vote tampered (wrong previous_hash) 
        [$vote2, $position2, $candidate2] = $this->createVoteWithDetail($election);

        $payload2 = json_encode([['position_id' => $position2->id, 'candidate_id' => $candidate2->id]]);
        $payloadHash2 = hash('sha256', $payload2);
        $currentHash2 = hash('sha256', $payloadHash2 . 'wrong_previous');

        $vote2->update([
            'payload_hash' => $payloadHash2,
            'previous_hash' => 'wrong_previous',
            'current_hash' => $currentHash2,
        ]);

        $result = $this->service->verifyElection($election);
        $this->assertFalse($result['valid']);
        $this->assertEquals($vote2->id, $result['vote_id']);
        $this->assertEquals('Previous hash mismatch', $result['reason']);
    }

    public function test_it_verifies_a_single_chained_vote_correctly()
    {
        $election = Election::factory()->create();

        // --- First vote --- 
        [$vote1, $position1, $candidate1] = $this->createVoteWithDetail($election);

        $payload1 = json_encode([
            ['position_id' => $position1->id, 'candidate_id' => $candidate1->id]
        ]);
        $payloadHash1 = hash('sha256', $payload1);
        $currentHash1 = hash('sha256', $payloadHash1);

        $vote1->update([
            'payload_hash' => $payloadHash1,
            'previous_hash' => null,
            'current_hash' => $currentHash1,
        ]);


        [$vote2, $position2, $candidate2] = $this->createVoteWithDetail($election);

        $payload2 = json_encode([
            ['position_id' => $position2->id, 'candidate_id' => $candidate2->id]
        ]);
        $payloadHash2 = hash('sha256', $payload2);
        $currentHash2 = hash('sha256', $payloadHash2 . $currentHash1);

        $vote2->update([
            'payload_hash' => $payloadHash2,
            'previous_hash' => $currentHash1,
            'current_hash' => $currentHash2,
        ]);

        // Verify the second vote individually 
        $result = $this->service->verifyVote($election, $vote2);
        $this->assertTrue($result['valid']);
        $this->assertEquals($payloadHash2, $result['expected_payload_hash']);
        $this->assertEquals($currentHash2, $result['expected_current_hash']);
    }

    public function test_it_detects_mismatch_in_chained_vote()
    {
        $election = Election::factory()->create();

        // First vote sealed correctly
        [$vote1, $position1, $candidate1] = $this->createVoteWithDetail($election);

        $payload1 = json_encode([
            ['position_id' => $position1->id, 'candidate_id' => $candidate1->id]
        ]);
        $payloadHash1 = hash('sha256', $payload1);
        $currentHash1 = hash('sha256', $payloadHash1);

        $vote1->update([
            'payload_hash' => $payloadHash1,
            'previous_hash' => null,
            'current_hash' => $currentHash1,
        ]);

        // Second vote chained but tampered current hash
        [$vote2, $position2, $candidate2] = $this->createVoteWithDetail($election);

        $payload2 = json_encode([
            ['position_id' => $position2->id, 'candidate_id' => $candidate2->id]
        ]);
        $payloadHash2 = hash('sha256', $payload2);

        // Tamper only current_hash
        $vote2->update([
            'payload_hash' => $payloadHash2,   // correct
            'previous_hash' => $currentHash1,  // correct chain link
            'current_hash' => 'wrong',         // tampered
        ]);

        $result = $this->service->verifyVote($election, $vote2);

        $this->assertFalse($result['valid']);
        $this->assertEquals('Current hash mismatch', $result['reason']);
    }

    private function createVoteWithDetail(Election $election): array
    {
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

        return [$vote, $position, $candidate];
    }

}
