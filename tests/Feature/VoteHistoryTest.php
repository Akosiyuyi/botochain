<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\Position;
use App\Models\Candidate;
use App\Models\Partylist;
use App\Models\Vote;
use App\Models\VoteDetail;
use App\Models\Student;
use App\Models\User;

class VoteHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
    }

    private function createVoterUser(): array
    {
        $user = User::factory()->create();
        $user->assignRole('voter');

        $student = Student::factory()->create([
            'student_id' => $user->id_number,
            'status' => 'Enrolled',
        ]);

        return ['user' => $user, 'student' => $student];
    }

    public function test_voter_can_view_vote_history_index()
    {
        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $election = Election::factory()->create();

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('voter.vote-history.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Voter/Vote/VoteHistory')
            ->has('votes', 1)
            ->where('votes.0.id', $vote->id)
            ->where('votes.0.election_id', $election->id)
            ->where('votes.0.election_title', $election->title)
            ->where('votes.0.created_at', $vote->created_at->format('M d, Y h:i A'))
        );
    }

    public function test_vote_history_sorted_by_most_recent_first()
    {
        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $olderElection = Election::factory()->create();
        $newerElection = Election::factory()->create();

        $olderVote = Vote::factory()->create([
            'election_id' => $olderElection->id,
            'student_id' => $student->id,
            'created_at' => now()->subHours(2),
        ]);

        $newerVote = Vote::factory()->create([
            'election_id' => $newerElection->id,
            'student_id' => $student->id,
            'created_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->get(route('voter.vote-history.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Voter/Vote/VoteHistory')
            ->has('votes', 2)
            ->where('votes.0.id', $newerVote->id)
            ->where('votes.1.id', $olderVote->id)
        );
    }

    public function test_vote_history_excludes_other_voter_votes()
    {
        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $other = $this->createVoterUser();
        $election = Election::factory()->create();

        $ownVote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);

        Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $other['student']->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('voter.vote-history.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Voter/Vote/VoteHistory')
            ->has('votes', 1)
            ->where('votes.0.id', $ownVote->id)
        );
    }

    public function test_vote_history_show_displays_vote_details_and_choices()
    {
        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $election = Election::factory()->create();
        $partylist = Partylist::factory()->create(['election_id' => $election->id]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
        ]);

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);

        VoteDetail::factory()->create([
            'vote_id' => $vote->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('voter.vote-history.show', $vote->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Voter/Vote/VoteHistoryDetail')
            ->has('vote')
            ->where('vote.id', $vote->id)
            ->where('vote.election_title', $election->title)
            ->where('vote.choices.' . $position->id, $candidate->id)
            ->has('vote.positions', 1)
        );
    }

    public function test_voter_cannot_view_other_voter_vote_details()
    {
        ['user' => $user] = $this->createVoterUser();
        $other = $this->createVoterUser();
        $election = Election::factory()->create();

        $vote = Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $other['student']->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('voter.vote-history.show', $vote->id));

        $response->assertStatus(403);
    }
}
