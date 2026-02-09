<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\Student;
use App\Models\Vote;
use App\Models\Position;
use App\Models\Candidate;
use App\Models\User;
use App\Enums\ElectionStatus;
use App\Models\ElectionSetup;

class VoteControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles for voter authentication
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
    }

    private function createElectionWithSetup(array $attributes = []): Election
    {
        $election = Election::factory()->create(array_merge([
            'status' => ElectionStatus::Ongoing,
        ], $attributes));

        ElectionSetup::factory()->create([
            'election_id' => $election->id,
        ]);

        return $election;
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

    private function makeStudentEligible($student, $election, $positions = null)
    {
        // Get all positions if not provided
        if ($positions === null) {
            $positions = $election->positions()->get();
        } elseif (!is_array($positions) && !($positions instanceof \Illuminate\Database\Eloquent\Collection)) {
            $positions = [$positions];
        }

        // Create EligibleVoter records for each position
        foreach ($positions as $position) {
            \App\Models\EligibleVoter::factory()->create([
                'election_id' => $election->id,
                'position_id' => $position->id,
                'student_id' => $student->id,
            ]);
        }
    }

    public function test_create_shows_voting_form_when_not_voted()
    {
        $election = $this->createElectionWithSetup(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        ['user' => $user, 'student' => $student] = $this->createVoterUser();

        $response = $this->actingAs($user)
            ->get(route('voter.election.vote.create', $election->id));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->component('Voter/Vote/VotingForm')
            ->has('election')
            ->has('setup')
        );
    }

    public function test_create_redirects_back_when_already_voted()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        ['user' => $user, 'student' => $student] = $this->createVoterUser();

        // Create existing vote
        Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($user)
            ->get(route('voter.election.vote.create', $election->id));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'You have already voted in this election.');
    }

    public function test_create_requires_authentication()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);

        $response = $this->get(route('voter.election.vote.create', $election->id));

        $response->assertRedirect(route('login'));
    }

    public function test_store_successfully_creates_vote()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $this->makeStudentEligible($student, $election, [$position]);

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => [$position->id => $candidate->id],
            ]);

        $response->assertRedirect(route('voter.election.show', $election->id));
        $response->assertSessionHas('success', 'Vote submitted successfully.');

        $this->assertDatabaseHas('votes', [
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);

        $this->assertDatabaseHas('vote_details', [
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
        ]);
    }

    public function test_store_with_multiple_positions()
    {
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

        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $this->makeStudentEligible($student, $election, [$position1, $position2]);

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => [
                    $position1->id => $candidate1->id,
                    $position2->id => $candidate2->id,
                ],
            ]);

        $response->assertRedirect(route('voter.election.show', $election->id));
        $response->assertSessionHas('success');

        $vote = Vote::where('election_id', $election->id)
            ->where('student_id', $student->id)
            ->first();

        $this->assertNotNull($vote);
        $this->assertEquals(2, $vote->voteDetails()->count());
    }

    public function test_store_fails_when_election_not_ongoing()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ended]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $this->makeStudentEligible($student, $election, [$position]);

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => [$position->id => $candidate->id],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'This election is not ongoing.');

        $this->assertDatabaseMissing('votes', [
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_store_fails_when_already_voted()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $this->makeStudentEligible($student, $election, [$position]);

        // Create existing vote
        Vote::factory()->create([
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => [$position->id => $candidate->id],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'You have already voted.');

        // Verify only one vote exists
        $this->assertEquals(1, Vote::where('election_id', $election->id)
            ->where('student_id', $student->id)
            ->count());
    }

    public function test_store_validates_choices_is_array()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        ['user' => $user, 'student' => $student] = $this->createVoterUser();

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => 'not-an-array',
            ]);

        $response->assertSessionHasErrors('choices');
    }

    public function test_store_validates_candidate_exists()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        
        ['user' => $user, 'student' => $student] = $this->createVoterUser();

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => [$position->id => 999], // Non-existent candidate
            ]);

        $response->assertSessionHasErrors('choices.' . $position->id);
    }

    public function test_store_validates_candidate_id_is_integer()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        
        ['user' => $user, 'student' => $student] = $this->createVoterUser();

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => [$position->id => 'not-a-number'],
            ]);

        $response->assertSessionHasErrors('choices.' . $position->id);
    }

    public function test_store_with_invalid_position_fails()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
        ]);

        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $this->makeStudentEligible($student, $election, [$position]);

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => [999 => $candidate->id], // Invalid position
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Invalid position.');

        $this->assertDatabaseMissing('votes', [
            'election_id' => $election->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_store_requires_authentication()
    {
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);

        $response = $this->post(route('voter.election.vote.store', $election->id), [
            'choices' => [],
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_store_with_empty_choices_succeeds()
    {
        // Abstaining from all positions
        $election = Election::factory()->create(['status' => ElectionStatus::Ongoing]);
        $position = Position::factory()->create(['election_id' => $election->id]);
        
        ['user' => $user, 'student' => $student] = $this->createVoterUser();
        $this->makeStudentEligible($student, $election, [$position]);

        $response = $this->actingAs($user)
            ->post(route('voter.election.vote.store', $election->id), [
                'choices' => [],
            ]);

        $response->assertRedirect(route('voter.election.show', $election->id));
        $response->assertSessionHas('success');

        // Vote should be created with no details
        $vote = Vote::where('election_id', $election->id)
            ->where('student_id', $student->id)
            ->first();

        $this->assertNotNull($vote);
        $this->assertEquals(0, $vote->voteDetails()->count());
    }
}
