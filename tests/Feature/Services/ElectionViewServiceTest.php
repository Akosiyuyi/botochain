<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Election;
use App\Models\ElectionSetup;
use App\Models\Student;
use App\Models\SchoolLevel;
use App\Models\SchoolUnit;
use App\Models\Position;
use App\Models\PositionEligibleUnit;
use App\Models\Candidate;
use App\Models\Partylist;
use App\Models\EligibleVoter;
use App\Models\Vote;
use App\Services\ElectionViewService;
use App\Models\ElectionResult;

class ElectionViewServiceTest extends TestCase
{
    use RefreshDatabase;

    private ElectionViewService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ColorThemesSeeder']);
        $this->artisan('db:seed', ['--class' => 'SchoolLevelSeeder']);
        $this->service = app(ElectionViewService::class);
    }

    private function createElectionWithSetup(): Election
    {
        $election = Election::factory()->create();
        ElectionSetup::factory()->create([
            'election_id' => $election->id,
        ]);
        return $election->load('setup');
    }

    public function test_election_view_data_filtering_by_student_eligibility()
    {
        // Create election and setup
        $election = $this->createElectionWithSetup();
        $schoolLevel = SchoolLevel::first();

        // Create school units
        $unitA = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
        $unitB = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 12',
            'course' => 'STEM',
        ]);

        // Create positions with eligibility
        $position1 = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);
        $position2 = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'Vice President',
        ]);

        PositionEligibleUnit::factory()->create([
            'position_id' => $position1->id,
            'school_unit_id' => $unitA->id,
        ]);
        PositionEligibleUnit::factory()->create([
            'position_id' => $position2->id,
            'school_unit_id' => $unitB->id,
        ]);

        // Create students
        $eligibleStudent = Student::factory()->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
        $ineligibleStudent = Student::factory()->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 12',
            'course' => 'STEM',
        ]);

        // Create eligible voters
        EligibleVoter::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position1->id,
            'student_id' => $eligibleStudent->id,
        ]);
        EligibleVoter::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position2->id,
            'student_id' => $ineligibleStudent->id,
        ]);

        // Test: eligible student sees only their eligible position
        $viewData = $this->service->forShow($election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist'), $eligibleStudent);
        $positions = array_values($viewData['setup']['positions']);
        
        $this->assertCount(1, $positions);
        $this->assertEquals($position1->name, $positions[0]['name']);

        // Test: ineligible student sees their eligible position (position 2)
        $viewData = $this->service->forShow($election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist'), $ineligibleStudent);
        $positions = array_values($viewData['setup']['positions']);
        
        $this->assertCount(1, $positions);
        $this->assertEquals($position2->name, $positions[0]['name']);

        // Test: null student sees all positions (admin view)
        $viewData = $this->service->forShow($election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist'), null);
        $positions = array_values($viewData['setup']['positions']);
        
        $this->assertCount(2, $positions);
    }

    public function test_positions_filtered_correctly()
    {
        // Create election and setup
        $election = $this->createElectionWithSetup();
        $schoolLevel = SchoolLevel::first();

        // Create school units
        $unit1 = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
        $unit2 = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 12',
            'course' => 'STEM',
        ]);

        // Create 3 positions
        $positionA = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'Position A',
        ]);
        $positionB = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'Position B',
        ]);
        $positionC = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'Position C',
        ]);

        // Position A: eligible for unit1
        // Position B: eligible for unit1 and unit2
        // Position C: not eligible for any unit
        PositionEligibleUnit::factory()->create([
            'position_id' => $positionA->id,
            'school_unit_id' => $unit1->id,
        ]);
        PositionEligibleUnit::factory()->create([
            'position_id' => $positionB->id,
            'school_unit_id' => $unit1->id,
        ]);
        PositionEligibleUnit::factory()->create([
            'position_id' => $positionB->id,
            'school_unit_id' => $unit2->id,
        ]);

        // Create student from unit1
        $student = Student::factory()->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        // Create eligible voters for unit1 student
        EligibleVoter::factory()->create([
            'election_id' => $election->id,
            'position_id' => $positionA->id,
            'student_id' => $student->id,
        ]);
        EligibleVoter::factory()->create([
            'election_id' => $election->id,
            'position_id' => $positionB->id,
            'student_id' => $student->id,
        ]);

        // Get positions payload for the student
        $viewData = $this->service->forShow($election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist'), $student);
        $positions = $viewData['setup']['positions'];

        // Should only see positions A and B, not C
        $this->assertCount(2, $positions);
        $positionNames = array_map(fn($p) => $p['name'], $positions);
        $this->assertContains('Position A', $positionNames);
        $this->assertContains('Position B', $positionNames);
        $this->assertNotContains('Position C', $positionNames);
    }

    public function test_candidates_filtered_correctly()
    {
        // Create election and setup
        $election = $this->createElectionWithSetup();
        $schoolLevel = SchoolLevel::first();

        // Create school units
        $unit1 = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
        $unit2 = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 12',
            'course' => 'ABM',
        ]);

        // Create partylist
        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Party A',
        ]);

        // Create positions
        $positionA = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);
        $positionB = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'Vice President',
        ]);

        // Set eligibility
        PositionEligibleUnit::factory()->create([
            'position_id' => $positionA->id,
            'school_unit_id' => $unit1->id,
        ]);
        PositionEligibleUnit::factory()->create([
            'position_id' => $positionB->id,
            'school_unit_id' => $unit2->id,
        ]);

        // Create candidates for both positions
        $candidateA = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $positionA->id,
            'partylist_id' => $partylist->id,
            'name' => 'Candidate A',
        ]);
        $candidateB = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $positionB->id,
            'partylist_id' => $partylist->id,
            'name' => 'Candidate B',
        ]);

        // Create student from unit1 (only eligible for position A)
        $student = Student::factory()->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        // Create eligible voter for position A only
        EligibleVoter::factory()->create([
            'election_id' => $election->id,
            'position_id' => $positionA->id,
            'student_id' => $student->id,
        ]);

        // Get candidates payload for the student
        $viewData = $this->service->forShow($election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist'), $student);
        $candidates = $viewData['setup']['candidates'];

        // Should only see candidate A (from eligible position A)
        $this->assertCount(1, $candidates);
        $this->assertEquals('Candidate A', $candidates[0]['name']);
        $this->assertEquals($positionA->id, $candidates[0]['position']['id']);
    }

    public function test_results_computation_for_display()
    {
        // Create election and setup
        $election = $this->createElectionWithSetup();
        $schoolLevel = SchoolLevel::first();

        // Create school unit
        $unit = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        // Create partylist
        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Party A',
        ]);

        // Create position
        $position = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);

        PositionEligibleUnit::factory()->create([
            'position_id' => $position->id,
            'school_unit_id' => $unit->id,
        ]);

        // Create candidates
        $candidate1 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
            'name' => 'Candidate 1',
        ]);
        $candidate2 = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
            'name' => 'Candidate 2',
        ]);

        // Create eligible voters
        $students = Student::factory(10)->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        foreach ($students as $student) {
            EligibleVoter::factory()->create([
                'election_id' => $election->id,
                'position_id' => $position->id,
                'student_id' => $student->id,
            ]);
        }

        // Create Vote records (6 for candidate1, 4 for candidate2)
        $student6 = $students->slice(0, 6);
        $student4 = $students->slice(6, 4);
        
        foreach ($student6 as $student) {
            Vote::factory()->create([
                'election_id' => $election->id,
                'student_id' => $student->id,
            ]);
        }
        foreach ($student4 as $student) {
            Vote::factory()->create([
                'election_id' => $election->id,
                'student_id' => $student->id,
            ]);
        }

        // Create election results
        ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate1->id,
            'vote_count' => 6,
        ]);
        ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate2->id,
            'vote_count' => 4,
        ]);

        // Get results data via forShow
        $election = $election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist', 'results.candidate.partylist', 'results.position');
        $viewData = $this->service->forShow($election);
        $results = $viewData['results'];

        // Verify results calculation
        $this->assertNotEmpty($results['positions']);
        $positionResult = $results['positions'][0];

        $this->assertEquals($position->id, $positionResult['id']);
        $this->assertEquals($position->name, $positionResult['name']);
        $this->assertEquals(10, $positionResult['eligible_voter_count']);
        $this->assertEquals(10, $positionResult['position_total_votes']);

        // Check candidates sorted by votes descending
        $this->assertCount(2, $positionResult['candidates']);
        $this->assertEquals('Candidate 1', $positionResult['candidates'][0]['name']);
        $this->assertEquals(6, $positionResult['candidates'][0]['vote_count']);
        $this->assertEquals(60.0, $positionResult['candidates'][0]['percent_of_position']);

        $this->assertEquals('Candidate 2', $positionResult['candidates'][1]['name']);
        $this->assertEquals(4, $positionResult['candidates'][1]['vote_count']);
        $this->assertEquals(40.0, $positionResult['candidates'][1]['percent_of_position']);

        // Check metrics
        $this->assertEquals(10, $results['metrics']['eligibleVoterCount']);
        $this->assertEquals(10, $results['metrics']['votesCast']);
        $this->assertEquals(100.0, $results['metrics']['progressPercent']);
    }

    public function test_results_with_zero_votes()
    {
        // Create election and setup
        $election = $this->createElectionWithSetup();
        $schoolLevel = SchoolLevel::first();

        // Create school unit
        $unit = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        // Create position and candidates
        $position = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);

        PositionEligibleUnit::factory()->create([
            'position_id' => $position->id,
            'school_unit_id' => $unit->id,
        ]);

        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Party A',
        ]);

                $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
            'name' => 'Candidate 1',
        ]);

        // Create eligible voters but no votes
        $students = Student::factory(5)->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        foreach ($students as $student) {
            EligibleVoter::factory()->create([
                'election_id' => $election->id,
                'position_id' => $position->id,
                'student_id' => $student->id,
            ]);
        }

        // Get results data via forShow
        $election = $election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist', 'results.candidate.partylist', 'results.position');
        $viewData = $this->service->forShow($election);
        $results = $viewData['results'];

        // Verify zero votes case
        $positionResult = $results['positions'][0];
        $this->assertEquals(0, $positionResult['candidates'][0]['vote_count']);
        $this->assertEquals(0, $positionResult['candidates'][0]['percent_of_position']);
        $this->assertEquals(0, $results['metrics']['votesCast']);
        $this->assertEquals(0, $results['metrics']['progressPercent']);
    }

    public function test_results_progress_percentage_calculation()
    {
        // Create election and setup
        $election = $this->createElectionWithSetup();
        $schoolLevel = SchoolLevel::first();

        // Create school unit
        $unit = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        // Create position and candidates
        $position = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);

        PositionEligibleUnit::factory()->create([
            'position_id' => $position->id,
            'school_unit_id' => $unit->id,
        ]);

        $partylist = Partylist::factory()->create([
            'election_id' => $election->id,
            'name' => 'Party A',
        ]);

        $candidate = Candidate::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'partylist_id' => $partylist->id,
            'name' => 'Candidate 1',
        ]);

        // Create eligible voters
        $students = Student::factory(20)->create([
            'status' => 'Enrolled',
            'school_level' => 'Senior High',
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);

        foreach ($students as $student) {
            EligibleVoter::factory()->create([
                'election_id' => $election->id,
                'position_id' => $position->id,
                'student_id' => $student->id,
            ]);
        }

        // Create Vote records (7 votes out of 20 eligible)
        $votingStudents = $students->slice(0, 7);
        foreach ($votingStudents as $student) {
            Vote::factory()->create([
                'election_id' => $election->id,
                'student_id' => $student->id,
            ]);
        }

        // Create election results (7 votes out of 20 eligible)
        ElectionResult::factory()->create([
            'election_id' => $election->id,
            'position_id' => $position->id,
            'candidate_id' => $candidate->id,
            'vote_count' => 7,
        ]);

        // Get results data via forShow
        $election = $election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist', 'results.candidate.partylist', 'results.position');
        $viewData = $this->service->forShow($election);
        $results = $viewData['results'];

        // Verify progress percentage (7/20 = 35%)
        $this->assertEquals(20, $results['metrics']['eligibleVoterCount']);
        $this->assertEquals(7, $results['metrics']['votesCast']);
        $this->assertEquals(35.0, $results['metrics']['progressPercent']);
    }

    public function test_positions_formatted_with_school_units()
    {
        // Create election and setup
        $election = $this->createElectionWithSetup();
        $schoolLevel = SchoolLevel::first();

        // Create multiple school units
        $unit1 = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 11',
            'course' => 'STEM',
        ]);
        $unit2 = SchoolUnit::factory()->create([
            'school_level_id' => $schoolLevel->id,
            'year_level' => 'Grade 12',
            'course' => 'ABM',
        ]);

        // Create position with multiple eligible units
        $position = Position::factory()->create([
            'election_id' => $election->id,
            'name' => 'President',
        ]);

        PositionEligibleUnit::factory()->create([
            'position_id' => $position->id,
            'school_unit_id' => $unit1->id,
        ]);
        PositionEligibleUnit::factory()->create([
            'position_id' => $position->id,
            'school_unit_id' => $unit2->id,
        ]);

        // Get positions payload (no student filter)
        $viewData = $this->service->forShow($election->load('positions.eligibleUnits.schoolUnit.schoolLevel', 'partylists', 'candidates.position', 'candidates.partylist'), null);
        $positions = $viewData['setup']['positions'];

        // Verify position formatting
        $this->assertCount(1, $positions);
        $this->assertEquals('President', $positions[0]['name']);
        $this->assertNotEmpty($positions[0]['school_levels']);
    }
}
