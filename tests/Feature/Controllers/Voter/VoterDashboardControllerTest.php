<?php

namespace Tests\Feature\Controllers\Voter;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Student;
use App\Models\Election;
use App\Models\ElectionSetup;
use App\Models\SchoolLevel;
use App\Models\SchoolUnit;
use App\Models\Position;
use App\Models\PositionEligibleUnit;
use App\Models\EligibleVoter;
use App\Models\Vote;
use App\Enums\ElectionStatus;
use Carbon\Carbon;

class VoterDashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $voter;
    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
        $this->artisan('db:seed', ['--class' => 'SchoolLevelSeeder']);
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);

        // Create a voter with associated student
        // Student lookup works by matching user's id_number with student's student_id
        $this->voter = User::factory()->create(['id_number' => '12345678']);
        $this->voter->assignRole('voter');
        $this->student = Student::factory()->create([
            'student_id' => '12345678',
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
    }

    private function createElectionWithSetup($status = ElectionStatus::Ongoing, $startDate = null, $endDate = null): Election
    {
        $election = Election::factory()->create(['status' => $status]);
        
        $setup = ElectionSetup::factory()->create([
            'election_id' => $election->id,
            'start_time' => $startDate ?? ($status === ElectionStatus::Upcoming ? now()->addDays(5) : now()),
            'end_time' => $endDate ?? ($status === ElectionStatus::Upcoming ? now()->addDays(6) : now()->addHours(2)),
        ]);
        
        return $election->load('setup');
    }

    private function makeStudentEligibleForElection(Election $election)
    {
        $schoolLevel = SchoolLevel::where('name', 'Senior High')->first();
        
        $unit = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        $position = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);

        PositionEligibleUnit::factory()->create([
            'position_id' => $position->id,
            'school_unit_id' => $unit->id,
        ]);

        EligibleVoter::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'student_id' => $this->student->id,
        ]);
    }

    public function test_voter_sees_only_eligible_elections()
    {
        // Create multiple elections
        $eligibleElection1 = $this->createElectionWithSetup(ElectionStatus::Ongoing);
        $eligibleElection2 = $this->createElectionWithSetup(ElectionStatus::Upcoming);
        $ineligibleElection = $this->createElectionWithSetup(ElectionStatus::Ongoing);

        // Make student eligible for only 2 elections
        $this->makeStudentEligibleForElection($eligibleElection1);
        $this->makeStudentEligibleForElection($eligibleElection2);
        // No eligibility for ineligibleElection

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
        
        $ongoingIds = array_map(fn($e) => $e['id'], $response->viewData('page')['props']['ongoingElections']);
        $upcomingIds = array_map(fn($e) => $e['id'], $response->viewData('page')['props']['upcomingElections']);

        // Verify eligible elections are visible
        $this->assertContains($eligibleElection1->id, $ongoingIds);
        $this->assertContains($eligibleElection2->id, $upcomingIds);
        
        // Verify ineligible election is NOT visible
        $this->assertNotContains($ineligibleElection->id, $ongoingIds);
        $this->assertNotContains($ineligibleElection->id, $upcomingIds);
    }

    public function test_voter_election_list_categorized()
    {
        // Create elections with different statuses
        $ongoingElection = $this->createElectionWithSetup(ElectionStatus::Ongoing);
        $upcomingElection = $this->createElectionWithSetup(ElectionStatus::Upcoming);
        $finalizedElection = $this->createElectionWithSetup(ElectionStatus::Finalized);
        $draftElection = $this->createElectionWithSetup(ElectionStatus::Draft);

        // Make student eligible for all
        $this->makeStudentEligibleForElection($ongoingElection);
        $this->makeStudentEligibleForElection($upcomingElection);
        $this->makeStudentEligibleForElection($finalizedElection);
        $this->makeStudentEligibleForElection($draftElection);

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
        
        $ongoingElections = $response->viewData('page')['props']['ongoingElections'];
        $upcomingElections = $response->viewData('page')['props']['upcomingElections'];
        $stats = $response->viewData('page')['props']['stats'];

        // Verify categorization
        $ongoingIds = array_map(fn($e) => $e['id'], $ongoingElections);
        $upcomingIds = array_map(fn($e) => $e['id'], $upcomingElections);

        // Ongoing elections appear in ongoing list
        $this->assertContains($ongoingElection->id, $ongoingIds);
        $this->assertNotContains($ongoingElection->id, $upcomingIds);

        // Upcoming elections appear in upcoming list
        $this->assertContains($upcomingElection->id, $upcomingIds);
        $this->assertNotContains($upcomingElection->id, $ongoingIds);

        // Finalized elections do NOT appear in ongoing or upcoming (but count in stats)
        $this->assertNotContains($finalizedElection->id, $ongoingIds);
        $this->assertNotContains($finalizedElection->id, $upcomingIds);
        $this->assertEquals(1, $stats['results_available']);

        // Draft elections do NOT appear
        $this->assertNotContains($draftElection->id, $ongoingIds);
        $this->assertNotContains($draftElection->id, $upcomingIds);
    }

    public function test_voter_cannot_see_draft_elections()
    {
        $draftElection = $this->createElectionWithSetup(ElectionStatus::Draft);
        $this->makeStudentEligibleForElection($draftElection);

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
        
        $ongoingElections = $response->viewData('page')['props']['ongoingElections'];
        $upcomingElections = $response->viewData('page')['props']['upcomingElections'];

        $ongoingIds = array_map(fn($e) => $e['id'], $ongoingElections);
        $upcomingIds = array_map(fn($e) => $e['id'], $upcomingElections);

        // Draft election should NOT be visible
        $this->assertNotContains($draftElection->id, $ongoingIds);
        $this->assertNotContains($draftElection->id, $upcomingIds);
    }

    public function test_voter_sees_has_voted_status()
    {
        $ongoingElection = $this->createElectionWithSetup(ElectionStatus::Ongoing);
        $this->makeStudentEligibleForElection($ongoingElection);

        // Student has NOT voted yet
        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $ongoingElections = $response->viewData('page')['props']['ongoingElections'];
        $this->assertFalse($ongoingElections[0]['has_voted']);

        // Create a vote for the student
        Vote::factory()->create([
            'election_id' => $ongoingElection->id,
            'student_id' => $this->student->id,
        ]);

        // Now student HAS voted
        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $ongoingElections = $response->viewData('page')['props']['ongoingElections'];
        $this->assertTrue($ongoingElections[0]['has_voted']);
    }

    public function test_voter_participation_stats()
    {
        // Create multiple ongoing elections
        $election1 = $this->createElectionWithSetup(ElectionStatus::Ongoing);
        $election2 = $this->createElectionWithSetup(ElectionStatus::Ongoing);
        $election3 = $this->createElectionWithSetup(ElectionStatus::Ongoing);

        $this->makeStudentEligibleForElection($election1);
        $this->makeStudentEligibleForElection($election2);
        $this->makeStudentEligibleForElection($election3);

        // Student votes in 2 elections
        Vote::factory()->create([
            'election_id' => $election1->id,
            'student_id' => $this->student->id,
        ]);
        Vote::factory()->create([
            'election_id' => $election2->id,
            'student_id' => $this->student->id,
        ]);

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $stats = $response->viewData('page')['props']['stats'];

        // Participated should be 2
        $this->assertEquals(2, $stats['participated']);
    }

    public function test_voter_upcoming_elections_limited_to_three()
    {
        // Create 5 upcoming elections
        for ($i = 0; $i < 5; $i++) {
            $election = $this->createElectionWithSetup(ElectionStatus::Upcoming);
            $this->makeStudentEligibleForElection($election);
        }

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $upcomingElections = $response->viewData('page')['props']['upcomingElections'];

        // Should only show 3 upcoming elections max
        $this->assertCount(3, $upcomingElections);
    }

    public function test_voter_with_no_eligible_elections()
    {
        // Create elections but don't make student eligible
        $this->createElectionWithSetup(ElectionStatus::Ongoing);
        $this->createElectionWithSetup(ElectionStatus::Upcoming);
        $this->createElectionWithSetup(ElectionStatus::Finalized);

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
        
        // Parse Inertia page response
        $page = $response->viewData('page');
        $stats = $page['props']['stats'];
        $ongoingElections = $page['props']['ongoingElections'];
        $upcomingElections = $page['props']['upcomingElections'];

        // No elections should be visible
        $this->assertEquals(0, $stats['participated']);
        $this->assertEquals(0, $stats['upcoming']);
        $this->assertEquals(0, $stats['results_available']);
        $this->assertEmpty($ongoingElections);
        $this->assertEmpty($upcomingElections);
    }

    public function test_voter_without_student_record()
    {
        // Create a user without a student record but with voter role
        $userWithoutStudent = User::factory()->create(['id_number' => '99999999']);
        $userWithoutStudent->assignRole('voter');

        // Create elections
        $this->createElectionWithSetup(ElectionStatus::Ongoing);

        $response = $this->actingAs($userWithoutStudent)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
        
        // Parse Inertia page response
        $page = $response->viewData('page');
        $stats = $page['props']['stats'];

        // Should show dashboard with no data
        $this->assertEquals(0, $stats['participated']);
        $this->assertEquals(0, $stats['upcoming']);
        $this->assertEquals(0, $stats['results_available']);
    }

    public function test_voter_recent_activity_shows_last_five_votes()
    {
        // Create 7 elections
        $elections = [];
        for ($i = 0; $i < 7; $i++) {
            $election = $this->createElectionWithSetup(ElectionStatus::Finalized);
            $this->makeStudentEligibleForElection($election);
            $elections[] = $election;
        }

        // Create 7 votes
        foreach ($elections as $election) {
            Vote::factory()->create([
                'election_id' => $election->id,
                'student_id' => $this->student->id,
            ]);
        }

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
        $page = $response->viewData('page');
        $recentActivity = $page['props']['recentActivity'];

        // Should only show last 5 votes
        $this->assertCount(5, $recentActivity);
    }

    public function test_voter_results_available_count()
    {
        // Create 3 finalized elections
        $finalized1 = $this->createElectionWithSetup(ElectionStatus::Finalized);
        $finalized2 = $this->createElectionWithSetup(ElectionStatus::Finalized);
        $finalized3 = $this->createElectionWithSetup(ElectionStatus::Finalized);

        // Create 1 ongoing (not finalized)
        $ongoing = $this->createElectionWithSetup(ElectionStatus::Ongoing);

        // Make student eligible for all
        $this->makeStudentEligibleForElection($finalized1);
        $this->makeStudentEligibleForElection($finalized2);
        $this->makeStudentEligibleForElection($finalized3);
        $this->makeStudentEligibleForElection($ongoing);

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
        $page = $response->viewData('page');
        $stats = $page['props']['stats'];

        // Results available should be 3 (finalized elections)
        $this->assertEquals(3, $stats['results_available']);
    }

    public function test_voter_election_data_includes_required_fields()
    {
        $ongoingElection = $this->createElectionWithSetup(ElectionStatus::Ongoing);
        $this->makeStudentEligibleForElection($ongoingElection);

        $response = $this->actingAs($this->voter)
            ->get(route('voter.dashboard'));

        $response->assertStatus(200);
        $page = $response->viewData('page');
        $ongoingElections = $page['props']['ongoingElections'];

        // Verify election has all required fields
        $this->assertNotEmpty($ongoingElections);
        $election = $ongoingElections[0];
        
        $this->assertArrayHasKey('id', $election);
        $this->assertArrayHasKey('title', $election);
        $this->assertArrayHasKey('status', $election);
        $this->assertArrayHasKey('has_voted', $election);
        $this->assertArrayHasKey('image_path', $election);
    }

    public function test_voter_cannot_access_dashboard_if_not_authenticated()
    {
        $response = $this->get(route('voter.dashboard'));

        $response->assertRedirect(route('login'));
    }
}
