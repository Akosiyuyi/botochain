<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use App\Models\Election;
use App\Enums\ElectionStatus;
use App\Models\Student;
use App\Models\Vote;
use App\Models\Position;
use App\Models\VoteDetail;
use App\Services\VoteService;
use App\Jobs\SealVoteHash;
use Illuminate\Validation\ValidationException;
use App\Models\Candidate;

class VoteServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_vote_if_election_not_ongoing()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ended]);
        $student = Student::factory()->create();

        $this->expectException(ValidationException::class);

        app(VoteService::class)->create($election, [1 => 5], $student);
    }

    public function test_cannot_vote_twice()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $student = Student::factory()->create();
        Vote::factory()->create(['election_id' => $election->id, 'student_id' => $student->id]);

        $this->expectException(ValidationException::class);

        app(VoteService::class)->create($election, [1 => 5], $student);
    }

    public function test_invalid_position_is_rejected()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $student = Student::factory()->create();

        $this->expectException(ValidationException::class);

        app(VoteService::class)->create($election, [999 => 5], $student);
    }

    public function test_invalid_candidate_throws_database_exception()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $student = Student::factory()->create();

        // Candidate ID 999 doesn't exist in the database
        // Foreign key constraint will prevent creating vote_detail with invalid candidate_id
        // Controller validates this with 'exists:candidates,id' rule
        
        $this->expectException(\Illuminate\Database\QueryException::class);

        app(VoteService::class)->create($election, [$position->id => 999], $student);
    }

    public function test_candidate_from_wrong_election_is_allowed()
    {
        $election1 = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $election2 = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        
        $position1 = Position::factory()->create(['election_id' => $election1->id]);
        $candidate2 = Candidate::factory()->create([
            'election_id' => $election2->id,
            'position_id' => Position::factory()->create(['election_id' => $election2->id]),
        ]);
        
        $student = Student::factory()->create();

        // Service doesn't validate that candidate belongs to the election
        // Controller validates 'exists:candidates,id' but not election_id match
        $vote = app(VoteService::class)->create($election1, [$position1->id => $candidate2->id], $student);

        $this->assertDatabaseHas('votes', [
            'id' => $vote->id,
            'election_id' => $election1->id,
        ]);

        $this->assertDatabaseHas('vote_details', [
            'vote_id' => $vote->id,
            'candidate_id' => $candidate2->id, // From wrong election
        ]);
    }

    public function test_candidate_from_wrong_position_is_allowed()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position1 = Position::factory()->create(['election_id' => $election->id]);
        $position2 = Position::factory()->create(['election_id' => $election->id]);
        
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position2->id, // Belongs to position2
        ]);
        
        $student = Student::factory()->create();

        // Service doesn't validate that candidate belongs to the position
        $vote = app(VoteService::class)->create($election, [$position1->id => $candidate->id], $student);

        $this->assertDatabaseHas('vote_details', [
            'vote_id' => $vote->id,
            'position_id' => $position1->id,
            'candidate_id' => $candidate->id, // Candidate actually belongs to position2
        ]);
    }

    public function test_vote_with_multiple_positions()
    {
        Bus::fake();

        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        
        $position1 = Position::factory()->create(['election_id' => $election->id]);
        $candidate1 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position1->id,
        ]);
        
        $position2 = Position::factory()->create(['election_id' => $election->id]);
        $candidate2 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position2->id,
        ]);
        
        $position3 = Position::factory()->create(['election_id' => $election->id]);
        $candidate3 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position3->id,
        ]);
        
        $student = Student::factory()->create();

        $choices = [
            $position1->id => $candidate1->id,
            $position2->id => $candidate2->id,
            $position3->id => $candidate3->id,
        ];

        $vote = app(VoteService::class)->create($election, $choices, $student);

        // Verify vote is created
        $this->assertDatabaseHas('votes', [
            'id' => $vote->id,
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);

        // Verify all three vote details are created
        $this->assertDatabaseHas('vote_details', [
            'vote_id' => $vote->id,
            'position_id' => $position1->id,
            'candidate_id' => $candidate1->id,
        ]);

        $this->assertDatabaseHas('vote_details', [
            'vote_id' => $vote->id,
            'position_id' => $position2->id,
            'candidate_id' => $candidate2->id,
        ]);

        $this->assertDatabaseHas('vote_details', [
            'vote_id' => $vote->id,
            'position_id' => $position3->id,
            'candidate_id' => $candidate3->id,
        ]);

        // Verify exactly 3 vote details were created
        $this->assertEquals(3, VoteDetail::where('vote_id', $vote->id)->count());

        Bus::assertDispatched(SealVoteHash::class, fn($job) => $job->voteId === $vote->id);
    }

    public function test_vote_and_details_are_created_and_job_dispatched()
    {
        Bus::fake();

        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);
        $student = Student::factory()->create();

        $vote = app(VoteService::class)->create($election, [$position->id => $candidate->id], $student);

        $this->assertDatabaseHas('votes', [
            'id' => $vote->id,
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);

        $this->assertDatabaseHas('vote_details', [
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        Bus::assertDispatched(SealVoteHash::class, fn($job) => $job->voteId === $vote->id);
    }


    public function test_seal_vote_hash_job_updates_hashes()
    {
        $election = Election::factory()->create();
        $student = Student::factory()->create();
        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        SealVoteHash::dispatchSync($vote->id);

        $vote->refresh();

        $this->assertNotNull($vote->payload_hash);
        $this->assertNotNull($vote->current_hash);
    }

    public function test_seal_vote_hash_job_tallies_vote_and_marks_tallied()
    {
        $election = Election::factory()->create();
        $student = Student::factory()->create();
        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // Run the job
        SealVoteHash::dispatchSync($vote->id);
        $vote->refresh();
        $this->assertDatabaseHas('votes', [
            'id' => $vote->id,
            'tallied' => true,
        ]);

        // Assert hashes were set
        $this->assertNotNull($vote->payload_hash);
        $this->assertNotNull($vote->current_hash);

        // Assert tallied flag was set
        $this->assertTrue($vote->tallied);

        // Assert election result row was created and incremented
        $this->assertDatabaseHas('election_results', [
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 1,
        ]);
    }

    public function test_seal_vote_hash_job_does_not_double_tally()
    {
        $election = Election::factory()->create();
        $student = Student::factory()->create();
        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        // First run
        SealVoteHash::dispatchSync($vote->id);
        $vote->refresh();
        $this->assertDatabaseHas('votes', [
            'id' => $vote->id,
            'tallied' => true,
        ]);

        $this->assertTrue($vote->tallied);

        // Capture vote_count after first tally
        $result = \App\Models\ElectionResult::where([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ])->first();
        $this->assertEquals(1, $result->vote_count);

        // Run job again (should skip tallying because tallied = true)
        SealVoteHash::dispatchSync($vote->id);

        $result->refresh();
        $this->assertEquals(1, $result->vote_count, 'Vote count should not increment twice');
    }
}
