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

}
